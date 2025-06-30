import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Loader2, X, Lightbulb, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { dappier } from '../../lib/dappier';
import { useNotesStore } from '../../stores/notesStore';

interface AICopilotProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AICopilot: React.FC<AICopilotProps> = ({ isOpen, onClose }) => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<Array<{
    type: 'user' | 'assistant';
    content: string;
    suggestions?: string[];
  }>>([]);
  const { notes } = useNotesStore();

  const handleAsk = async () => {
    if (!question.trim() || isLoading) return;

    const userQuestion = question.trim();
    setQuestion('');
    setIsLoading(true);

    // Add user message to conversation
    setConversation(prev => [...prev, { type: 'user', content: userQuestion }]);

    try {
      // Get relevant context from notes
      const context = notes
        .filter(note => 
          note.title.toLowerCase().includes(userQuestion.toLowerCase()) ||
          note.content.toLowerCase().includes(userQuestion.toLowerCase()) ||
          (note.category && note.category.toLowerCase().includes(userQuestion.toLowerCase()))
        )
        .slice(0, 5)
        .map(note => `Title: ${note.title}\nContent: ${note.content.substring(0, 300)}...`);

      const response = await dappier.askCopilot(userQuestion, context);
      
      setConversation(prev => [...prev, {
        type: 'assistant',
        content: response.response,
        suggestions: response.suggestions,
      }]);
    } catch (error) {
      console.error('Copilot error:', error);
      setConversation(prev => [...prev, {
        type: 'assistant',
        content: 'I apologize, but I encountered an error while processing your question. Please make sure the Dappier API is configured correctly.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuestion(suggestion);
  };

  const quickQuestions = [
    "What are my most important notes?",
    "Summarize my recent thoughts",
    "Find connections between my ideas",
    "What patterns do you see in my notes?",
    "Help me organize my thoughts",
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 h-[600px] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">AI Copilot</h2>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                Powered by Dappier
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Conversation */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversation.length === 0 && (
              <div className="text-center py-8">
                <Lightbulb className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ask me anything about your notes
                </h3>
                <p className="text-gray-600 mb-6">
                  I can help you find insights, connections, and patterns in your knowledge base.
                </p>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Quick questions:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {quickQuestions.map((q, index) => (
                      <button
                        key={index}
                        onClick={() => setQuestion(q)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {conversation.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-600 mb-2">Suggestions:</p>
                      <div className="space-y-1">
                        {message.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="block text-xs text-left text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                placeholder="Ask me about your notes..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <Button
                onClick={handleAsk}
                disabled={!question.trim() || isLoading}
                variant="primary"
                size="sm"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};