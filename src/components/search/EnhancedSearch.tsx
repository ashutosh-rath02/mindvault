import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Sparkles, Clock, Star, Tag } from 'lucide-react';
import { dappier } from '../../lib/dappier';
import { useNotesStore } from '../../stores/notesStore';

interface EnhancedSearchProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearch: (query: string) => void;
}

export const EnhancedSearch: React.FC<EnhancedSearchProps> = ({
  isOpen,
  onClose,
  searchQuery,
  onSearch,
}) => {
  const [query, setQuery] = useState(searchQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [semanticResults, setSemanticResults] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { notes, selectNote } = useNotesStore();

  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('mindvault_recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const handleSemanticSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await dappier.semanticSearch(searchQuery, notes);
      setSemanticResults(results);
      
      // Save to recent searches
      const newRecentSearches = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(newRecentSearches);
      localStorage.setItem('mindvault_recent_searches', JSON.stringify(newRecentSearches));
    } catch (error) {
      console.error('Semantic search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (searchQuery: string) => {
    onSearch(searchQuery);
    handleSemanticSearch(searchQuery);
  };

  const handleResultClick = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      selectNote(note);
      onClose();
    }
  };

  const quickFilters = [
    { label: 'Favorites', icon: Star, filter: 'favorites' },
    { label: 'Recent', icon: Clock, filter: 'recent' },
    { label: 'Work', icon: Tag, filter: 'category:Work' },
    { label: 'Personal', icon: Tag, filter: 'category:Personal' },
    { label: 'Ideas', icon: Tag, filter: 'category:Ideas' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -20 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(query);
                    } else if (e.key === 'Escape') {
                      onClose();
                    }
                  }}
                  placeholder="Search with AI-powered semantic search..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  autoFocus
                />
                {isSearching && (
                  <div className="absolute right-3 top-3">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 mt-3">
              {quickFilters.map((filter) => (
                <button
                  key={filter.filter}
                  onClick={() => {
                    onSearch('');
                    // Apply filter logic here
                    onClose();
                  }}
                  className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
                >
                  <filter.icon className="w-3 h-3" />
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto">
            {query && semanticResults.length > 0 && (
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <h3 className="font-medium text-gray-900">AI-Powered Results</h3>
                  <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                    Semantic Search
                  </span>
                </div>
                <div className="space-y-2">
                  {semanticResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result.id)}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <h4 className="font-medium text-gray-900 mb-1">{result.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {result.content.substring(0, 150)}...
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-purple-600 font-medium">
                          {Math.round(result.relevance * 100)}% match
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {!query && recentSearches.length > 0 && (
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Recent Searches</span>
                </h3>
                <div className="space-y-1">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setQuery(search);
                        handleSearch(search);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-gray-100 text-gray-700 text-sm"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!query && recentSearches.length === 0 && (
              <div className="p-8 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Enhanced Search
                </h3>
                <p className="text-gray-600 mb-4">
                  Use AI-powered semantic search to find notes by meaning, not just keywords.
                </p>
                <div className="text-sm text-gray-500">
                  <p>Try searching for:</p>
                  <ul className="mt-2 space-y-1">
                    <li>"notes about productivity"</li>
                    <li>"ideas for new projects"</li>
                    <li>"meeting notes from last week"</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Press Enter to search • Esc to close</span>
              <span className="flex items-center space-x-1">
                <span>Powered by</span>
                <span className="font-medium text-purple-600">Dappier AI</span>
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};