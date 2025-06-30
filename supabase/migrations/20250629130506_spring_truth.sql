/*
  # MindVault Database Schema

  1. New Tables
    - `profiles` - User profiles and preferences
    - `folders` - Hierarchical folder organization
    - `notes` - Main notes table with content and metadata
    - `tags` - User-defined tags for organization
    - `note_tags` - Many-to-many relationship between notes and tags
    - `note_connections` - Knowledge graph connections between notes
    - `ai_insights` - AI-generated insights and analysis
    - `voice_recordings` - Voice recording metadata and transcripts

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access only their own data
    - Secure functions with proper access controls

  3. Performance
    - Full-text search indexes on notes content and titles
    - Optimized indexes for common query patterns
    - Automatic word count updates via triggers

  4. Features
    - Automatic user profile creation on signup
    - Full-text search functionality
    - Knowledge graph relationship tracking
    - AI insights storage with confidence scoring
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Profiles table for user preferences and metadata
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  preferences jsonb DEFAULT '{
    "theme": "system",
    "default_view": "list",
    "auto_save": true,
    "voice_enabled": true
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Folders table for hierarchical organization
CREATE TABLE IF NOT EXISTS folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  parent_id uuid REFERENCES folders(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  color text DEFAULT '#3b82f6',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notes table with all content and metadata
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Untitled Note',
  content text DEFAULT '',
  content_type text DEFAULT 'markdown' CHECK (content_type IN ('markdown', 'rich-text')),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  folder_id uuid REFERENCES folders(id) ON DELETE SET NULL,
  category text,
  importance integer DEFAULT 0 CHECK (importance >= 0 AND importance <= 10),
  sentiment text CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  is_favorite boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  embeddings jsonb, -- Store embeddings as JSON array for semantic search
  audio_url text,
  word_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  color text DEFAULT '#6b7280',
  created_at timestamptz DEFAULT now(),
  UNIQUE(name, user_id)
);

-- Many-to-many relationship between notes and tags
CREATE TABLE IF NOT EXISTS note_tags (
  note_id uuid REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (note_id, tag_id)
);

-- Note connections for knowledge graph
CREATE TABLE IF NOT EXISTS note_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_note_id uuid REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  target_note_id uuid REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  connection_type text DEFAULT 'related' CHECK (connection_type IN ('related', 'references', 'contradicts', 'expands')),
  strength real DEFAULT 0.5 CHECK (strength >= 0 AND strength <= 1),
  created_at timestamptz DEFAULT now(),
  UNIQUE(source_note_id, target_note_id)
);

-- AI insights and analysis
CREATE TABLE IF NOT EXISTS ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('summary', 'key_point', 'connection', 'recommendation', 'sentiment')),
  content text NOT NULL,
  confidence real DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Voice recordings
CREATE TABLE IF NOT EXISTS voice_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  audio_url text NOT NULL,
  transcript text,
  duration integer, -- in seconds
  file_size integer, -- in bytes
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_recordings ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policies for folders
CREATE POLICY "Users can manage own folders"
  ON folders FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policies for notes
CREATE POLICY "Users can manage own notes"
  ON notes FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policies for tags
CREATE POLICY "Users can manage own tags"
  ON tags FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policies for note_tags
CREATE POLICY "Users can manage own note tags"
  ON note_tags FOR ALL
  TO authenticated
  USING (
    note_id IN (
      SELECT id FROM notes WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    note_id IN (
      SELECT id FROM notes WHERE user_id = auth.uid()
    )
  );

-- Policies for note_connections
CREATE POLICY "Users can manage own note connections"
  ON note_connections FOR ALL
  TO authenticated
  USING (
    source_note_id IN (
      SELECT id FROM notes WHERE user_id = auth.uid()
    )
    AND target_note_id IN (
      SELECT id FROM notes WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    source_note_id IN (
      SELECT id FROM notes WHERE user_id = auth.uid()
    )
    AND target_note_id IN (
      SELECT id FROM notes WHERE user_id = auth.uid()
    )
  );

-- Policies for ai_insights
CREATE POLICY "Users can view insights for own notes"
  ON ai_insights FOR SELECT
  TO authenticated
  USING (
    note_id IN (
      SELECT id FROM notes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert insights"
  ON ai_insights FOR INSERT
  TO authenticated
  WITH CHECK (
    note_id IN (
      SELECT id FROM notes WHERE user_id = auth.uid()
    )
  );

-- Policies for voice_recordings
CREATE POLICY "Users can manage own voice recordings"
  ON voice_recordings FOR ALL
  TO authenticated
  USING (
    note_id IN (
      SELECT id FROM notes WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    note_id IN (
      SELECT id FROM notes WHERE user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON notes(folder_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_is_favorite ON notes(is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_notes_content_fts ON notes USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_notes_title_fts ON notes USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_notes_embeddings ON notes USING gin(embeddings);
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_note_connections_source ON note_connections(source_note_id);
CREATE INDEX IF NOT EXISTS idx_note_connections_target ON note_connections(target_note_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_note_id ON ai_insights(note_id);
CREATE INDEX IF NOT EXISTS idx_voice_recordings_note_id ON voice_recordings(note_id);

-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  END IF;
END $$;

-- Function to update note word count and timestamp
CREATE OR REPLACE FUNCTION update_note_metadata()
RETURNS trigger AS $$
BEGIN
  -- Calculate word count from content (strip HTML tags)
  NEW.word_count = COALESCE(
    array_length(
      string_to_array(
        trim(regexp_replace(NEW.content, '<[^>]*>', '', 'g')), 
        ' '
      ), 
      1
    ), 
    0
  );
  
  -- Update timestamp
  NEW.updated_at = now();
  
  RETURN NEW;
END;
$$ language plpgsql;

-- Trigger to automatically update note metadata
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_note_metadata_trigger'
  ) THEN
    CREATE TRIGGER update_note_metadata_trigger
      BEFORE INSERT OR UPDATE OF content ON notes
      FOR EACH ROW EXECUTE FUNCTION update_note_metadata();
  END IF;
END $$;

-- Function for full-text search with ranking
CREATE OR REPLACE FUNCTION search_notes(
  query text,
  user_uuid uuid
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  rank real
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.title,
    n.content,
    ts_rank(
      to_tsvector('english', n.title || ' ' || n.content), 
      plainto_tsquery('english', query)
    ) as rank
  FROM notes n
  WHERE n.user_id = user_uuid
    AND n.is_archived = false
    AND (
      to_tsvector('english', n.title || ' ' || n.content) @@ plainto_tsquery('english', query)
    )
  ORDER BY rank DESC
  LIMIT 50;
END;
$$ language plpgsql security definer;

-- Function to find similar notes based on content overlap
CREATE OR REPLACE FUNCTION find_similar_notes(
  note_uuid uuid,
  user_uuid uuid,
  similarity_threshold real DEFAULT 0.1
)
RETURNS TABLE (
  id uuid,
  title text,
  similarity real
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.title,
    similarity(n.content, (SELECT content FROM notes WHERE id = note_uuid)) as sim
  FROM notes n
  WHERE n.user_id = user_uuid
    AND n.id != note_uuid
    AND n.is_archived = false
    AND similarity(n.content, (SELECT content FROM notes WHERE id = note_uuid)) > similarity_threshold
  ORDER BY sim DESC
  LIMIT 10;
END;
$$ language plpgsql security definer;

-- Function to get note statistics for analytics
CREATE OR REPLACE FUNCTION get_user_note_stats(user_uuid uuid)
RETURNS TABLE (
  total_notes bigint,
  total_words bigint,
  favorite_notes bigint,
  notes_this_week bigint,
  notes_this_month bigint,
  avg_words_per_note numeric,
  most_used_tags text[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_notes,
    COALESCE(SUM(n.word_count), 0)::bigint as total_words,
    COUNT(*) FILTER (WHERE n.is_favorite = true)::bigint as favorite_notes,
    COUNT(*) FILTER (WHERE n.created_at >= now() - interval '7 days')::bigint as notes_this_week,
    COUNT(*) FILTER (WHERE n.created_at >= now() - interval '30 days')::bigint as notes_this_month,
    COALESCE(AVG(n.word_count), 0) as avg_words_per_note,
    ARRAY(
      SELECT t.name 
      FROM tags t 
      JOIN note_tags nt ON t.id = nt.tag_id 
      JOIN notes n2 ON nt.note_id = n2.id 
      WHERE n2.user_id = user_uuid 
      GROUP BY t.name 
      ORDER BY COUNT(*) DESC 
      LIMIT 5
    ) as most_used_tags
  FROM notes n
  WHERE n.user_id = user_uuid
    AND n.is_archived = false;
END;
$$ language plpgsql security definer;