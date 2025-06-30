export interface Note {
  id: string;
  title: string;
  content: string;
  content_type: 'markdown' | 'rich-text';
  category?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  folder_id?: string;
  audio_url?: string;
  embeddings?: any;
  importance: number;
  sentiment?: string; // Updated to support all wheel of emotions
  is_favorite: boolean;
  is_archived: boolean;
  word_count: number;
  tags: string[];
}

export interface Tag {
  id: string;
  name: string;
  user_id: string;
  color?: string;
  created_at: string;
}

export interface NoteTag {
  note_id: string;
  tag_id: string;
  created_at: string;
}

export interface NoteConnection {
  id: string;
  source_note_id: string;
  target_note_id: string;
  connection_type: 'related' | 'references' | 'contradicts' | 'expands';
  strength: number;
  created_at: string;
}

export interface Folder {
  id: string;
  name: string;
  parent_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  color?: string;
}

export interface AIInsight {
  id: string;
  note_id: string;
  type: 'summary' | 'key_point' | 'connection' | 'recommendation' | 'sentiment';
  content: string;
  confidence: number;
  metadata?: any;
  created_at: string;
}

export interface KnowledgeNode {
  id: string;
  name: string;
  type: 'note' | 'concept' | 'topic';
  description?: string;
  note_ids: string[];
  connections: string[];
  centrality: number;
  created_at: string;
}

export interface VoiceRecording {
  id: string;
  note_id: string;
  audio_url: string;
  transcript?: string;
  duration?: number;
  file_size?: number;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    default_view: 'list' | 'grid' | 'timeline';
    auto_save: boolean;
    voice_enabled: boolean;
  };
  created_at: string;
  updated_at: string;
}