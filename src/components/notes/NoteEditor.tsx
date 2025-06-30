import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Star,
  Share,
  MoreHorizontal,
  Brain,
  FileText,
  Archive,
  Trash2,
  Copy,
  Tag,
  X,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { VoiceToText } from './VoiceToText';
import { useNotesStore } from '../../stores/notesStore';
import { useAuthStore } from '../../stores/authStore';
import { gemini } from '../../lib/gemini';
import { Note } from '../../types';

interface NoteEditorProps {
  note: Note | null;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ note }) => {
  // Local state for immediate UI updates - keyed by note ID to prevent cross-contamination
  const [localTitle, setLocalTitle] = useState('');
  const [localContent, setLocalContent] = useState('');
  const [localCategory, setLocalCategory] = useState('');
  const [localSentiment, setLocalSentiment] = useState<string>('');
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzingMood, setIsAnalyzingMood] = useState(false);
  const [aiInsights, setAiInsights] = useState<{
    mood?: string;
    summary?: string;
    keyPoints?: string[];
    category?: string;
  }>({});
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const currentNoteIdRef = useRef<string | null>(null);
  const { updateNote, deleteNote } = useNotesStore();
  const { user } = useAuthStore();

  // Initialize local state when note changes - ONLY when note ID actually changes
  useEffect(() => {
    if (note && note.id !== currentNoteIdRef.current) {
      currentNoteIdRef.current = note.id;
      setLocalTitle(note.title || '');
      setLocalContent(note.content || '');
      setLocalCategory(note.category || '');
      setLocalSentiment(note.sentiment || '');
      
      // Reset AI insights for new note
      setAiInsights({});
      
      // Load existing AI insights if available
      if (note.sentiment) {
        setAiInsights(prev => ({ ...prev, mood: note.sentiment }));
      }
    } else if (!note) {
      // Clear everything when no note is selected
      currentNoteIdRef.current = null;
      setLocalTitle('');
      setLocalContent('');
      setLocalCategory('');
      setLocalSentiment('');
      setAiInsights({});
    }
  }, [note?.id]); // Only depend on note ID, not the entire note object

  // AI Analysis function
  const analyzeWithAI = useCallback(async (content: string) => {
    if (!content.trim() || content.length < 50 || !note) return;
    
    setIsAnalyzingMood(true);
    try {
      // Analyze mood/sentiment
      const mood = await gemini.analyzeSentiment(content);
      setLocalSentiment(mood);
      
      // Update note with mood if it changed
      if (mood !== note.sentiment) {
        await updateNote(note.id, {
          sentiment: mood,
          updated_at: new Date().toISOString(),
        });
      }

      // Generate other insights if content is substantial
      if (content.length > 200) {
        const [summary, keyPoints, category] = await Promise.all([
          gemini.generateSummary(content).catch(() => ''),
          gemini.extractKeyPoints(content).catch(() => []),
          gemini.categorizeNote(content).catch(() => ''),
        ]);

        setAiInsights({
          mood,
          summary,
          keyPoints,
          category,
        });

        // Update category if it's different and substantial
        if (category && category !== 'Other' && category !== note.category) {
          setLocalCategory(category);
          await updateNote(note.id, {
            category,
            updated_at: new Date().toISOString(),
          });
        }
      } else {
        setAiInsights(prev => ({ ...prev, mood }));
      }
    } catch (error) {
      console.error('Error analyzing with AI:', error);
    } finally {
      setIsAnalyzingMood(false);
    }
  }, [note, updateNote]);

  // Debounced save function
  const debouncedSave = useCallback((title: string, content: string) => {
    if (!note) return;
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set new timeout for saving
    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        await updateNote(note.id, {
          title: title.trim() || 'Untitled Note',
          content: content,
          word_count: content.split(/\s+/).filter(word => word.length > 0).length,
          updated_at: new Date().toISOString(),
        });

        // Trigger AI analysis after saving
        if (content.trim()) {
          analyzeWithAI(content);
        }
      } catch (error) {
        console.error('Error saving note:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000);
  }, [note, updateNote, analyzeWithAI]);

  // Handle title changes
  const handleTitleChange = (newTitle: string) => {
    setLocalTitle(newTitle);
    debouncedSave(newTitle, localContent);
  };

  // Handle content changes
  const handleContentChange = (newContent: string) => {
    setLocalContent(newContent);
    debouncedSave(localTitle, newContent);
  };

  // Handle voice transcript - insert at cursor position WITHOUT replacing content
  const handleVoiceTranscript = (transcript: string) => {
    if (!textareaRef.current || !transcript.trim()) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    // Get the current content
    const currentContent = localContent;
    
    // Split content at cursor position
    const beforeCursor = currentContent.substring(0, start);
    const afterCursor = currentContent.substring(end);
    
    // Determine spacing needs
    const needsSpaceBefore = beforeCursor.length > 0 && 
                            !beforeCursor.endsWith(' ') && 
                            !beforeCursor.endsWith('\n') && 
                            !beforeCursor.endsWith('\t');
    
    const needsSpaceAfter = afterCursor.length > 0 && 
                           !afterCursor.startsWith(' ') && 
                           !afterCursor.startsWith('\n') && 
                           !afterCursor.startsWith('\t');
    
    // Build the new content with proper spacing
    const spaceBefore = needsSpaceBefore ? ' ' : '';
    const spaceAfter = needsSpaceAfter ? ' ' : '';
    const insertText = spaceBefore + transcript.trim() + spaceAfter;
    
    // Create new content
    const newContent = beforeCursor + insertText + afterCursor;
    const newCursorPosition = start + insertText.length;
    
    // Update the content state
    setLocalContent(newContent);
    debouncedSave(localTitle, newContent);
    
    // Set cursor position after the inserted text
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    });
  };

  // Manual save function
  const handleManualSave = async () => {
    if (!note) return;
    
    // Clear any pending debounced save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    setIsSaving(true);
    try {
      await updateNote(note.id, {
        title: localTitle.trim() || 'Untitled Note',
        content: localContent,
        word_count: localContent.split(/\s+/).filter(word => word.length > 0).length,
        updated_at: new Date().toISOString(),
      });

      // Trigger AI analysis
      if (localContent.trim()) {
        analyzeWithAI(localContent);
      }
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Save when leaving the component
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFavorite = () => {
    if (note) {
      updateNote(note.id, {
        is_favorite: !note.is_favorite,
        updated_at: new Date().toISOString(),
      });
    }
  };

  const handleArchive = () => {
    if (note) {
      updateNote(note.id, {
        is_archived: !note.is_archived,
        updated_at: new Date().toISOString(),
      });
      setShowMoreMenu(false);
    }
  };

  const handleDelete = () => {
    if (note && confirm('Are you sure you want to delete this note?')) {
      deleteNote(note.id);
      setShowMoreMenu(false);
    }
  };

  const handleCopy = () => {
    if (note) {
      navigator.clipboard.writeText(`${localTitle}\n\n${localContent}`);
      setShowMoreMenu(false);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.max(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [localContent]);

  // Calculate word count from local content
  const wordCount = localContent.split(/\s+/).filter(word => word.length > 0).length;

  // Enhanced mood display with wheel of emotions
  const getMoodDisplay = (mood?: string) => {
    const emotionMap: Record<string, { emoji: string; color: string; bg: string; description: string }> = {
      // Primary emotions
      'joy': { emoji: '😊', color: 'text-yellow-600', bg: 'bg-yellow-100', description: 'Joyful' },
      'trust': { emoji: '🤝', color: 'text-blue-600', bg: 'bg-blue-100', description: 'Trusting' },
      'fear': { emoji: '😨', color: 'text-purple-600', bg: 'bg-purple-100', description: 'Fearful' },
      'surprise': { emoji: '😲', color: 'text-orange-600', bg: 'bg-orange-100', description: 'Surprised' },
      'sadness': { emoji: '😢', color: 'text-blue-700', bg: 'bg-blue-200', description: 'Sad' },
      'disgust': { emoji: '🤢', color: 'text-green-700', bg: 'bg-green-200', description: 'Disgusted' },
      'anger': { emoji: '😠', color: 'text-red-600', bg: 'bg-red-100', description: 'Angry' },
      'anticipation': { emoji: '🤗', color: 'text-emerald-600', bg: 'bg-emerald-100', description: 'Anticipating' },
      
      // Secondary emotions
      'optimism': { emoji: '🌟', color: 'text-yellow-500', bg: 'bg-yellow-50', description: 'Optimistic' },
      'love': { emoji: '❤️', color: 'text-pink-600', bg: 'bg-pink-100', description: 'Loving' },
      'submission': { emoji: '🙏', color: 'text-indigo-600', bg: 'bg-indigo-100', description: 'Submissive' },
      'awe': { emoji: '😍', color: 'text-purple-500', bg: 'bg-purple-50', description: 'Awestruck' },
      'disappointment': { emoji: '😞', color: 'text-gray-600', bg: 'bg-gray-100', description: 'Disappointed' },
      'remorse': { emoji: '😔', color: 'text-slate-600', bg: 'bg-slate-100', description: 'Remorseful' },
      'contempt': { emoji: '😤', color: 'text-red-700', bg: 'bg-red-200', description: 'Contemptuous' },
      'aggressiveness': { emoji: '😡', color: 'text-red-800', bg: 'bg-red-300', description: 'Aggressive' },
      
      // Tertiary emotions
      'serenity': { emoji: '😌', color: 'text-teal-600', bg: 'bg-teal-100', description: 'Serene' },
      'ecstasy': { emoji: '🤩', color: 'text-yellow-700', bg: 'bg-yellow-200', description: 'Ecstatic' },
      'acceptance': { emoji: '🤲', color: 'text-blue-500', bg: 'bg-blue-50', description: 'Accepting' },
      'admiration': { emoji: '🥰', color: 'text-rose-600', bg: 'bg-rose-100', description: 'Admiring' },
      'apprehension': { emoji: '😰', color: 'text-amber-600', bg: 'bg-amber-100', description: 'Apprehensive' },
      'terror': { emoji: '😱', color: 'text-purple-800', bg: 'bg-purple-300', description: 'Terrified' },
      'distraction': { emoji: '😵', color: 'text-orange-500', bg: 'bg-orange-50', description: 'Distracted' },
      'amazement': { emoji: '🤯', color: 'text-orange-700', bg: 'bg-orange-200', description: 'Amazed' },
      'pensiveness': { emoji: '🤔', color: 'text-slate-500', bg: 'bg-slate-50', description: 'Pensive' },
      'grief': { emoji: '😭', color: 'text-blue-800', bg: 'bg-blue-300', description: 'Grieving' },
      'boredom': { emoji: '😑', color: 'text-gray-500', bg: 'bg-gray-50', description: 'Bored' },
      'loathing': { emoji: '🤮', color: 'text-green-800', bg: 'bg-green-300', description: 'Loathing' },
      'annoyance': { emoji: '😒', color: 'text-red-500', bg: 'bg-red-50', description: 'Annoyed' },
      'rage': { emoji: '🤬', color: 'text-red-900', bg: 'bg-red-400', description: 'Enraged' },
      'interest': { emoji: '🧐', color: 'text-emerald-500', bg: 'bg-emerald-50', description: 'Interested' },
      'vigilance': { emoji: '👀', color: 'text-emerald-700', bg: 'bg-emerald-200', description: 'Vigilant' },
      
      // Default
      'neutral': { emoji: '😐', color: 'text-gray-400', bg: 'bg-gray-50', description: 'Neutral' },
    };

    return emotionMap[mood || 'neutral'] || emotionMap['neutral'];
  };

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Select a note to edit</h3>
          <p>Choose a note from the sidebar or create a new one</p>
        </div>
      </div>
    );
  }

  const moodDisplay = getMoodDisplay(localSentiment || aiInsights.mood);
  const currentCategory = localCategory || aiInsights.category;

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 p-6 flex-shrink-0">
        {/* Title Row - Fixed Layout with proper constraints */}
        <div className="flex items-center mb-6">
          <div className="flex-1 min-w-0 mr-4">
            <input
              type="text"
              value={localTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full text-3xl font-bold text-gray-900 bg-transparent border-none outline-none placeholder-gray-400"
              placeholder="Untitled Note"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            />
          </div>
          
          {/* Fixed Action Buttons - will never move */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFavorite}
              className={note.is_favorite ? 'text-yellow-500' : ''}
              title={note.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`w-5 h-5 ${note.is_favorite ? 'fill-current' : ''}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleManualSave}
              disabled={isSaving}
              title="Save note"
            >
              <Save className={`w-5 h-5 ${isSaving ? 'animate-spin' : ''}`} />
            </Button>
            <div className="relative" ref={moreMenuRef}>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                title="More options"
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
              
              <AnimatePresence>
                {showMoreMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  >
                    <button
                      onClick={handleCopy}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy content</span>
                    </button>
                    <button
                      onClick={handleArchive}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Archive className="w-4 h-4" />
                      <span>{note.is_archived ? 'Unarchive' : 'Archive'}</span>
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete note</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <VoiceToText onTranscript={handleVoiceTranscript} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAIPanel(!showAIPanel)}
              className={showAIPanel ? 'bg-blue-50 text-blue-600' : ''}
              title="AI Insights"
            >
              <Brain className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            {isSaving && (
              <span className="flex items-center space-x-1 text-blue-600">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span>Saving...</span>
              </span>
            )}
            {isAnalyzingMood && (
              <span className="flex items-center space-x-1 text-purple-600">
                <Sparkles className="w-3 h-3 animate-pulse" />
                <span>Analyzing...</span>
              </span>
            )}
            
            {/* AI Mood Indicator */}
            {localSentiment && (
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full ${moodDisplay.bg}`}>
                <span className="text-sm">{moodDisplay.emoji}</span>
                <span className={`text-xs font-medium ${moodDisplay.color}`}>
                  {moodDisplay.description}
                </span>
              </div>
            )}
            
            {/* Category Display */}
            {currentCategory && (
              <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {currentCategory}
              </span>
            )}
            
            <span>{wordCount} words</span>
          </div>
        </div>
      </div>

      {/* Content Area - Made scrollable */}
      <div className="flex-1 flex overflow-hidden">
        {/* Simple Text Editor - Made scrollable */}
        <div className="flex-1 p-6 overflow-y-auto">
          <textarea
            ref={textareaRef}
            value={localContent}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Start writing your thoughts... (Use the microphone button to add voice input)"
            className="w-full resize-none border-none outline-none text-gray-900 placeholder-gray-400 bg-transparent"
            style={{ 
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '16px',
              lineHeight: '1.7',
              minHeight: '400px'
            }}
            spellCheck="true"
            autoFocus
          />
        </div>

        {/* AI Panel - Made scrollable */}
        <AnimatePresence>
          {showAIPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-gray-200 bg-gray-50 overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-blue-600" />
                    <h3 className="font-medium">AI Insights</h3>
                  </div>
                  <button
                    onClick={() => setShowAIPanel(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {/* Mood Analysis */}
                  {localSentiment && (
                    <div className="bg-white rounded-lg p-3 border">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{moodDisplay.emoji}</span>
                        <h4 className="font-medium text-gray-900">Mood Analysis</h4>
                      </div>
                      <p className={`text-sm ${moodDisplay.color} font-medium`}>
                        This note has a {moodDisplay.description.toLowerCase()} emotional tone
                      </p>
                    </div>
                  )}

                  {/* Category */}
                  {currentCategory && (
                    <div className="bg-white rounded-lg p-3 border">
                      <div className="flex items-center space-x-2 mb-2">
                        <Tag className="w-4 h-4 text-blue-600" />
                        <h4 className="font-medium text-gray-900">Category</h4>
                      </div>
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {currentCategory}
                      </span>
                    </div>
                  )}

                  {/* Summary */}
                  {aiInsights.summary && (
                    <div className="bg-white rounded-lg p-3 border">
                      <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                      <p className="text-sm text-gray-600">{aiInsights.summary}</p>
                    </div>
                  )}

                  {/* Key Points */}
                  {aiInsights.keyPoints && aiInsights.keyPoints.length > 0 && (
                    <div className="bg-white rounded-lg p-3 border">
                      <h4 className="font-medium text-gray-900 mb-2">Key Points</h4>
                      <ul className="space-y-1">
                        {aiInsights.keyPoints.map((point, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!localSentiment && !aiInsights.summary && localContent.length < 50 && (
                    <div className="bg-white rounded-lg p-3 border">
                      <p className="text-sm text-gray-600">
                        Write more content to get AI insights about mood, summary, and key points.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Bar */}
      <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 flex-shrink-0">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Last saved: {new Date(note.updated_at).toLocaleTimeString()}
          </span>
          <div className="flex items-center space-x-4">
            <span>{wordCount} words</span>
            <span>{Math.ceil(wordCount / 200) || 1} min read</span>
            {localSentiment && (
              <span className={`${moodDisplay.color}`}>
                {moodDisplay.emoji} {moodDisplay.description}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};