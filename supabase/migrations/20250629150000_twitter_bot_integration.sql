-- Migration: Twitter Bot Integration
-- Description: Adds tables and columns needed for Twitter bot functionality

-- Create table for Twitter username mappings
CREATE TABLE IF NOT EXISTS user_twitter_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  twitter_username TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add twitter_username column to profiles table if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twitter_username TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_twitter_mappings_username ON user_twitter_mappings(twitter_username);
CREATE INDEX IF NOT EXISTS idx_user_twitter_mappings_user_id ON user_twitter_mappings(user_id);

-- Add RLS policies for user_twitter_mappings
ALTER TABLE user_twitter_mappings ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own Twitter mappings
CREATE POLICY "Users can view their own Twitter mappings" ON user_twitter_mappings
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to insert their own Twitter mappings
CREATE POLICY "Users can insert their own Twitter mappings" ON user_twitter_mappings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own Twitter mappings
CREATE POLICY "Users can update their own Twitter mappings" ON user_twitter_mappings
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for users to delete their own Twitter mappings
CREATE POLICY "Users can delete their own Twitter mappings" ON user_twitter_mappings
  FOR DELETE USING (auth.uid() = user_id);

-- Policy for service role to access all mappings (for bot operations)
CREATE POLICY "Service role can access all Twitter mappings" ON user_twitter_mappings
  FOR ALL USING (auth.role() = 'service_role');

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_twitter_mappings_updated_at 
  BEFORE UPDATE ON user_twitter_mappings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add function to link Twitter username to user
CREATE OR REPLACE FUNCTION link_twitter_username(twitter_username_param TEXT)
RETURNS JSON AS $$
DECLARE
  user_id_param UUID;
  result JSON;
BEGIN
  -- Get current user ID
  user_id_param := auth.uid();
  
  IF user_id_param IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Insert or update the mapping
  INSERT INTO user_twitter_mappings (user_id, twitter_username)
  VALUES (user_id_param, twitter_username_param)
  ON CONFLICT (twitter_username) 
  DO UPDATE SET 
    user_id = user_id_param,
    updated_at = NOW();
  
  -- Update profiles table
  UPDATE profiles 
  SET twitter_username = twitter_username_param
  WHERE id = user_id_param;
  
  result := json_build_object(
    'success', true,
    'message', 'Twitter username linked successfully',
    'twitter_username', twitter_username_param
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION link_twitter_username(TEXT) TO authenticated;

-- Add function to unlink Twitter username
CREATE OR REPLACE FUNCTION unlink_twitter_username()
RETURNS JSON AS $$
DECLARE
  user_id_param UUID;
  result JSON;
BEGIN
  -- Get current user ID
  user_id_param := auth.uid();
  
  IF user_id_param IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Remove the mapping
  DELETE FROM user_twitter_mappings WHERE user_id = user_id_param;
  
  -- Update profiles table
  UPDATE profiles 
  SET twitter_username = NULL
  WHERE id = user_id_param;
  
  result := json_build_object(
    'success', true,
    'message', 'Twitter username unlinked successfully'
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION unlink_twitter_username() TO authenticated;

-- Add function to get user's Twitter mapping
CREATE OR REPLACE FUNCTION get_twitter_mapping()
RETURNS JSON AS $$
DECLARE
  user_id_param UUID;
  mapping_record RECORD;
  result JSON;
BEGIN
  -- Get current user ID
  user_id_param := auth.uid();
  
  IF user_id_param IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Get the mapping
  SELECT * INTO mapping_record 
  FROM user_twitter_mappings 
  WHERE user_id = user_id_param;
  
  IF mapping_record IS NULL THEN
    result := json_build_object(
      'success', true,
      'linked', false,
      'twitter_username', NULL
    );
  ELSE
    result := json_build_object(
      'success', true,
      'linked', true,
      'twitter_username', mapping_record.twitter_username,
      'created_at', mapping_record.created_at
    );
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_twitter_mapping() TO authenticated;

-- Add column to notes table for Twitter metadata
ALTER TABLE notes ADD COLUMN IF NOT EXISTS twitter_metadata JSONB;

-- Add index for Twitter metadata queries
CREATE INDEX IF NOT EXISTS idx_notes_twitter_metadata ON notes USING GIN (twitter_metadata);

-- Add function to create note from Twitter (for bot use)
CREATE OR REPLACE FUNCTION create_note_from_twitter(
  user_id_param UUID,
  title_param TEXT,
  content_param TEXT,
  twitter_metadata_param JSONB DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  new_note_id UUID;
  result JSON;
BEGIN
  -- Insert the note
  INSERT INTO notes (
    user_id,
    title,
    content,
    content_type,
    category,
    tags,
    importance,
    word_count,
    is_favorite,
    is_archived,
    twitter_metadata,
    created_at,
    updated_at
  ) VALUES (
    user_id_param,
    title_param,
    content_param,
    'markdown',
    'twitter',
    ARRAY['twitter', 'bot-saved'],
    3,
    array_length(string_to_array(content_param, ' '), 1),
    false,
    false,
    twitter_metadata_param,
    NOW(),
    NOW()
  ) RETURNING id INTO new_note_id;
  
  result := json_build_object(
    'success', true,
    'note_id', new_note_id,
    'message', 'Note created successfully from Twitter'
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function (only for service role)
GRANT EXECUTE ON FUNCTION create_note_from_twitter(UUID, TEXT, TEXT, JSONB) TO service_role; 