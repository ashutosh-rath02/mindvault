import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Star, Calendar, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Note } from '../../types';
import { useNotesStore } from '../../stores/notesStore';

interface NotesListProps {
  notes: Note[];
}

export const NotesList: React.FC<NotesListProps> = ({ notes }) => {
  const { selectNote, selectedNote } = useNotesStore();

  const truncateContent = (content: string, maxLength: number = 100) => {
    const text = content.replace(/<[^>]+>/g, '').trim();
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Enhanced mood emoji with wheel of emotions
  const getMoodEmoji = (sentiment?: string) => {
    const emotionMap: Record<string, string> = {
      // Primary emotions
      'joy': '😊',
      'trust': '🤝',
      'fear': '😨',
      'surprise': '😲',
      'sadness': '😢',
      'disgust': '🤢',
      'anger': '😠',
      'anticipation': '🤗',
      
      // Secondary emotions
      'optimism': '🌟',
      'love': '❤️',
      'submission': '🙏',
      'awe': '😍',
      'disappointment': '😞',
      'remorse': '😔',
      'contempt': '😤',
      'aggressiveness': '😡',
      
      // Tertiary emotions
      'serenity': '😌',
      'ecstasy': '🤩',
      'acceptance': '🤲',
      'admiration': '🥰',
      'apprehension': '😰',
      'terror': '😱',
      'distraction': '😵',
      'amazement': '🤯',
      'pensiveness': '🤔',
      'grief': '😭',
      'boredom': '😑',
      'loathing': '🤮',
      'annoyance': '😒',
      'rage': '🤬',
      'interest': '🧐',
      'vigilance': '👀',
      'neutral': '😐',
    };

    return emotionMap[sentiment || 'neutral'] || null;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">
          All Notes ({notes.length})
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="space-y-2">
            {notes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => selectNote(note)}
                className={`
                  p-4 rounded-lg border cursor-pointer transition-all duration-200
                  hover:shadow-md hover:border-blue-200
                  ${selectedNote?.id === note.id 
                    ? 'bg-blue-50 border-blue-300 shadow-sm' 
                    : 'bg-white border-gray-200'
                  }
                `}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <h3 className="font-medium text-gray-900 truncate">
                      {note.title || 'Untitled Note'}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    {getMoodEmoji(note.sentiment) && (
                      <span className="text-sm" title={`${note.sentiment} mood`}>
                        {getMoodEmoji(note.sentiment)}
                      </span>
                    )}
                    {note.is_favorite && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                </div>

                {/* Content Preview */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {truncateContent(note.content)}
                </p>

                {/* Meta Information */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDistanceToNow(new Date(note.updated_at))} ago</span>
                    </div>
                    {note.category && (
                      <div className="flex items-center space-x-1">
                        <Tag className="w-3 h-3" />
                        <span>{note.category}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span>{note.word_count || 0} words</span>
                  </div>
                </div>

                {/* Tags */}
                {(note.tags || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(note.tags || []).slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                    {(note.tags || []).length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{(note.tags || []).length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {notes.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
              <p className="text-gray-600">Create your first note to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};