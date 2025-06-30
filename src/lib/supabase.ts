import { createClient } from '@supabase/supabase-js';
import { Note, Folder, AIInsight, Tag } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Supabase configuration is incomplete. Please check your .env file.');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('Invalid Supabase URL format:', supabaseUrl);
  throw new Error('Invalid Supabase URL format. Please check your VITE_SUPABASE_URL in .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'notes-app'
    }
  }
});

// Test connection function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Network error during connection test:', error);
    return false;
  }
};

export const db = {
  // Notes
  async getNotes(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Database error loading notes:', error);
        throw new Error(`Failed to load notes: ${error.message}`);
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Network error loading notes:', error);
      throw new Error(`Network error loading notes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async createNote(note: Partial<Note>) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([note])
        .select()
        .single();
      
      if (error) {
        console.error('Database error creating note:', error);
        throw new Error(`Failed to create note: ${error.message}`);
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Network error creating note:', error);
      throw new Error(`Network error creating note: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async updateNote(id: string, updates: Partial<Note>) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Database error updating note:', error);
        throw new Error(`Failed to update note: ${error.message}`);
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Network error updating note:', error);
      throw new Error(`Network error updating note: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async deleteNote(id: string) {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Database error deleting note:', error);
        throw new Error(`Failed to delete note: ${error.message}`);
      }
      
      return { error: null };
    } catch (error) {
      console.error('Network error deleting note:', error);
      throw new Error(`Network error deleting note: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Folders
  async getFolders(userId: string) {
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', userId)
        .order('name');
      
      if (error) {
        console.error('Database error loading folders:', error);
        throw new Error(`Failed to load folders: ${error.message}`);
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Network error loading folders:', error);
      throw new Error(`Network error loading folders: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async createFolder(folder: Partial<Folder>) {
    try {
      const { data, error } = await supabase
        .from('folders')
        .insert([folder])
        .select()
        .single();
      
      if (error) {
        console.error('Database error creating folder:', error);
        throw new Error(`Failed to create folder: ${error.message}`);
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Network error creating folder:', error);
      throw new Error(`Network error creating folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Tags
  async getTags(userId: string) {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', userId)
        .order('name');
      
      if (error) {
        console.error('Database error loading tags:', error);
        throw new Error(`Failed to load tags: ${error.message}`);
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Network error loading tags:', error);
      throw new Error(`Network error loading tags: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async createTag(tag: Partial<Tag>) {
    try {
      const { data, error } = await supabase
        .from('tags')
        .insert([tag])
        .select()
        .single();
      
      if (error) {
        console.error('Database error creating tag:', error);
        throw new Error(`Failed to create tag: ${error.message}`);
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Network error creating tag:', error);
      throw new Error(`Network error creating tag: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // AI Insights
  async getInsights(noteId: string) {
    try {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('note_id', noteId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Database error loading insights:', error);
        throw new Error(`Failed to load insights: ${error.message}`);
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Network error loading insights:', error);
      throw new Error(`Network error loading insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Auth
  async signUp(email: string, password: string) {
    try {
      const result = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (result.error) {
        console.error('Auth error during sign up:', result.error);
        throw new Error(`Sign up failed: ${result.error.message}`);
      }
      
      return result;
    } catch (error) {
      console.error('Network error during sign up:', error);
      throw new Error(`Network error during sign up: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async signIn(email: string, password: string) {
    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (result.error) {
        console.error('Auth error during sign in:', result.error);
        throw new Error(`Sign in failed: ${result.error.message}`);
      }
      
      return result;
    } catch (error) {
      console.error('Network error during sign in:', error);
      throw new Error(`Network error during sign in: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async signOut() {
    try {
      const result = await supabase.auth.signOut();
      
      if (result.error) {
        console.error('Auth error during sign out:', result.error);
        throw new Error(`Sign out failed: ${result.error.message}`);
      }
      
      return result;
    } catch (error) {
      console.error('Network error during sign out:', error);
      throw new Error(`Network error during sign out: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async getCurrentUser() {
    try {
      const result = await supabase.auth.getUser();
      
      if (result.error) {
        console.error('Auth error getting current user:', result.error);
        throw new Error(`Failed to get current user: ${result.error.message}`);
      }
      
      return result;
    } catch (error) {
      console.error('Network error getting current user:', error);
      throw new Error(`Network error getting current user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Profile
  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Database error loading profile:', error);
        throw new Error(`Failed to load profile: ${error.message}`);
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Network error loading profile:', error);
      throw new Error(`Network error loading profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async updateProfile(userId: string, updates: any) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
      
      if (error) {
        console.error('Database error updating profile:', error);
        throw new Error(`Failed to update profile: ${error.message}`);
      }
      
      return { error: null };
    } catch (error) {
      console.error('Network error updating profile:', error);
      throw new Error(`Network error updating profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};