import { createClient } from '@supabase/supabase-js';
import { Note, Folder, AIInsight, Tag } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const db = {
  // Notes
  async getNotes(userId: string) {
    return await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
  },

  async createNote(note: Partial<Note>) {
    return await supabase
      .from('notes')
      .insert([note])
      .select()
      .single();
  },

  async updateNote(id: string, updates: Partial<Note>) {
    return await supabase
      .from('notes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  },

  async deleteNote(id: string) {
    return await supabase
      .from('notes')
      .delete()
      .eq('id', id);
  },

  // Folders
  async getFolders(userId: string) {
    return await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('name');
  },

  async createFolder(folder: Partial<Folder>) {
    return await supabase
      .from('folders')
      .insert([folder])
      .select()
      .single();
  },

  // Tags
  async getTags(userId: string) {
    return await supabase
      .from('tags')
      .select('*')
      .eq('user_id', userId)
      .order('name');
  },

  async createTag(tag: Partial<Tag>) {
    return await supabase
      .from('tags')
      .insert([tag])
      .select()
      .single();
  },

  // AI Insights
  async getInsights(noteId: string) {
    return await supabase
      .from('ai_insights')
      .select('*')
      .eq('note_id', noteId)
      .order('created_at', { ascending: false });
  },

  // Auth
  async signUp(email: string, password: string) {
    return await supabase.auth.signUp({
      email,
      password,
    });
  },

  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  async signOut() {
    return await supabase.auth.signOut();
  },

  async getCurrentUser() {
    return await supabase.auth.getUser();
  },

  // Profile
  async getProfile(userId: string) {
    return await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
  },

  async updateProfile(userId: string, updates: any) {
    return await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
  },
};