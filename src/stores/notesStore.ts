import { create } from 'zustand';
import { Note, Folder, AIInsight } from '../types';
import { db, testConnection } from '../lib/supabase';

interface NotesState {
  notes: Note[];
  folders: Folder[];
  insights: Record<string, AIInsight[]>;
  selectedNote: Note | null;
  loading: boolean;
  searchQuery: string;
  filter: string | null;
  connectionError: string | null;
  
  // Actions
  loadNotes: (userId: string) => Promise<void>;
  loadFolders: (userId: string) => Promise<void>;
  createNote: (note: Partial<Note>) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  selectNote: (note: Note | null) => void;
  searchNotes: (query: string) => void;
  setFilter: (filter: string | null) => void;
  loadInsights: (noteId: string) => Promise<void>;
  getFilteredNotes: () => Note[];
  testConnection: () => Promise<boolean>;
  clearConnectionError: () => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  folders: [],
  insights: {},
  selectedNote: null,
  loading: false,
  searchQuery: '',
  filter: null,
  connectionError: null,

  testConnection: async () => {
    try {
      const isConnected = await testConnection();
      if (!isConnected) {
        set({ connectionError: 'Unable to connect to the database. Please check your internet connection and try again.' });
      } else {
        set({ connectionError: null });
      }
      return isConnected;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
      set({ connectionError: errorMessage });
      return false;
    }
  },

  clearConnectionError: () => {
    set({ connectionError: null });
  },

  loadNotes: async (userId: string) => {
    set({ loading: true, connectionError: null });
    try {
      const { data, error } = await db.getNotes(userId);
      if (error) throw error;
      
      // Ensure tags is always an array
      const notesWithTags = (data || []).map(note => ({
        ...note,
        tags: Array.isArray(note.tags) ? note.tags : []
      }));
      
      set({ notes: notesWithTags, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load notes';
      console.error('Error loading notes:', errorMessage);
      set({ 
        loading: false, 
        connectionError: `Error loading notes: ${errorMessage}` 
      });
    }
  },

  loadFolders: async (userId: string) => {
    set({ connectionError: null });
    try {
      const { data, error } = await db.getFolders(userId);
      if (error) throw error;
      set({ folders: data || [] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load folders';
      console.error('Error loading folders:', errorMessage);
      set({ 
        connectionError: `Error loading folders: ${errorMessage}` 
      });
      
      // If it's a network error, suggest checking connection
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network error')) {
        set({ 
          connectionError: 'Unable to connect to the database. Please check your internet connection and try refreshing the page.' 
        });
      }
    }
  },

  createNote: async (noteData: Partial<Note>) => {
    set({ connectionError: null });
    try {
      // Ensure tags is always an array
      const noteWithTags = {
        ...noteData,
        tags: Array.isArray(noteData.tags) ? noteData.tags : []
      };

      const { data, error } = await db.createNote(noteWithTags);
      if (error) throw error;
      
      const newNote = { 
        ...data, 
        tags: Array.isArray(data.tags) ? data.tags : [] 
      } as Note;
      
      // Add to notes list and select it
      set(state => ({ 
        notes: [newNote, ...state.notes],
        selectedNote: newNote 
      }));
      
      return newNote;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create note';
      console.error('Error creating note:', errorMessage);
      set({ connectionError: `Error creating note: ${errorMessage}` });
      throw error;
    }
  },

  updateNote: async (id: string, updates: Partial<Note>) => {
    set({ connectionError: null });
    try {
      // Ensure tags is always an array if provided
      const updatesWithTags = {
        ...updates,
        ...(updates.tags !== undefined && {
          tags: Array.isArray(updates.tags) ? updates.tags : []
        })
      };

      const { data, error } = await db.updateNote(id, updatesWithTags);
      if (error) throw error;

      // Update both the notes list and selected note if it matches
      set(state => {
        const updatedNotes = state.notes.map(note => 
          note.id === id ? { 
            ...note, 
            ...updatesWithTags, 
            tags: Array.isArray(updatesWithTags.tags) ? updatesWithTags.tags : (note.tags || [])
          } : note
        );
        
        const updatedSelectedNote = state.selectedNote?.id === id 
          ? { 
              ...state.selectedNote, 
              ...updatesWithTags, 
              tags: Array.isArray(updatesWithTags.tags) ? updatesWithTags.tags : (state.selectedNote.tags || [])
            }
          : state.selectedNote;

        return {
          notes: updatedNotes,
          selectedNote: updatedSelectedNote
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update note';
      console.error('Error updating note:', errorMessage);
      set({ connectionError: `Error updating note: ${errorMessage}` });
      throw error;
    }
  },

  deleteNote: async (id: string) => {
    set({ connectionError: null });
    try {
      const { error } = await db.deleteNote(id);
      if (error) throw error;

      set(state => ({
        notes: state.notes.filter(note => note.id !== id),
        selectedNote: state.selectedNote?.id === id ? null : state.selectedNote
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete note';
      console.error('Error deleting note:', errorMessage);
      set({ connectionError: `Error deleting note: ${errorMessage}` });
      throw error;
    }
  },

  selectNote: (note: Note | null) => {
    set({ selectedNote: note });
  },

  searchNotes: (query: string) => {
    set({ searchQuery: query, filter: null });
  },

  setFilter: (filter: string | null) => {
    set({ filter, searchQuery: '' });
  },

  getFilteredNotes: () => {
    const { notes, searchQuery, filter } = get();
    
    let filteredNotes = [...notes];
    
    // Apply search query
    if (searchQuery) {
      filteredNotes = filteredNotes.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.category && note.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply filters
    if (filter) {
      switch (filter) {
        case 'favorites':
          filteredNotes = filteredNotes.filter(note => note.is_favorite);
          break;
        case 'recent':
          const dayAgo = new Date();
          dayAgo.setDate(dayAgo.getDate() - 1);
          filteredNotes = filteredNotes.filter(note => new Date(note.updated_at) > dayAgo);
          break;
        case 'archived':
          filteredNotes = filteredNotes.filter(note => note.is_archived);
          break;
        default:
          if (filter.startsWith('category:')) {
            const category = filter.replace('category:', '');
            filteredNotes = filteredNotes.filter(note => note.category === category);
          }
      }
    }
    
    return filteredNotes;
  },

  loadInsights: async (noteId: string) => {
    set({ connectionError: null });
    try {
      const { data, error } = await db.getInsights(noteId);
      if (error) throw error;
      
      set(state => ({
        insights: {
          ...state.insights,
          [noteId]: data || []
        }
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load insights';
      console.error('Error loading insights:', errorMessage);
      set({ connectionError: `Error loading insights: ${errorMessage}` });
    }
  },
}));