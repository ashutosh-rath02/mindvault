import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Plus,
  FileText,
  Folder,
  Star,
  Archive,
  BarChart3,
  ChevronRight,
  ChevronDown,
  User,
  LogOut,
  Menu,
  Network,
  Clock,
  Tag,
  Zap,
  Settings,
  Filter,
  Database,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useNotesStore } from '../../stores/notesStore';
import { useAuthStore } from '../../stores/authStore';
import { addDummyData } from '../../lib/dummyData';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  currentView: 'notes' | 'graph' | 'analytics';
  onViewChange: (view: 'notes' | 'graph' | 'analytics') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed, 
  onToggle, 
  currentView, 
  onViewChange 
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [isAddingDummyData, setIsAddingDummyData] = useState(false);
  const { folders, notes, createNote, setFilter } = useNotesStore();
  const { user, signOut } = useAuthStore();

  const handleCreateNote = async () => {
    if (user) {
      try {
        await createNote({
          title: 'Untitled Note',
          content: '',
          content_type: 'markdown',
          user_id: user.id,
          importance: 0,
          is_favorite: false,
          is_archived: false,
          word_count: 0,
          tags: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to create note:', error);
      }
    }
  };

  const handleAddDummyData = async () => {
    if (!user) return;
    
    setIsAddingDummyData(true);
    try {
      await addDummyData(user.id, createNote);
    } catch (error) {
      console.error('Failed to add dummy data:', error);
    } finally {
      setIsAddingDummyData(false);
    }
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  // Quick access items with filtering functionality
  const quickAccessItems = [
    { 
      icon: Star, 
      label: 'Favorites', 
      count: notes.filter(n => n.is_favorite).length,
      color: 'text-yellow-600',
      bgColor: 'hover:bg-yellow-50',
      filter: 'favorites',
      description: 'Your starred notes'
    },
    { 
      icon: Clock, 
      label: 'Recent', 
      count: notes.filter(n => {
        const dayAgo = new Date();
        dayAgo.setDate(dayAgo.getDate() - 1);
        return new Date(n.updated_at) > dayAgo;
      }).length,
      color: 'text-blue-600',
      bgColor: 'hover:bg-blue-50',
      filter: 'recent',
      description: 'Notes from last 24 hours'
    },
    { 
      icon: Archive, 
      label: 'Archive', 
      count: notes.filter(n => n.is_archived).length,
      color: 'text-gray-600',
      bgColor: 'hover:bg-gray-50',
      filter: 'archived',
      description: 'Archived notes'
    },
  ];

  // Enhanced categories with counts and better organization
  const categories = notes.reduce((acc, note) => {
    const category = note.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryItems = Object.entries(categories)
    .sort(([,a], [,b]) => b - a) // Sort by count descending
    .map(([category, count]) => ({
      name: category,
      count,
      color: category === 'Work' ? 'text-blue-600' :
             category === 'Personal' ? 'text-green-600' :
             category === 'Ideas' ? 'text-purple-600' :
             category === 'Research' ? 'text-orange-600' :
             category === 'Learning' ? 'text-cyan-600' :
             category === 'Health' ? 'text-lime-600' :
             category === 'Finance' ? 'text-yellow-600' :
             category === 'Travel' ? 'text-pink-600' :
             'text-gray-600'
    }));

  const handleQuickAccessClick = (filter: string) => {
    setFilter(filter);
    onViewChange('notes');
  };

  const handleCategoryClick = (category: string) => {
    setFilter(`category:${category}`);
    onViewChange('notes');
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 64 : 280 }}
      className="bg-white border-r border-gray-200 flex flex-col h-full relative z-10"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h1 className="font-bold text-lg text-gray-900">MindVault</h1>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 space-y-2 flex-shrink-0">
        <Button
          onClick={handleCreateNote}
          variant="primary"
          size={isCollapsed ? 'sm' : 'md'}
          className={`w-full ${isCollapsed ? 'px-2' : ''}`}
          title="Create new note"
        >
          <Plus className="w-5 h-5" />
          {!isCollapsed && <span className="ml-2">New Note</span>}
        </Button>
        
        {/* Add Dummy Data Button - Only show when there are few notes */}
        {!isCollapsed && notes.length < 5 && (
          <Button
            onClick={handleAddDummyData}
            disabled={isAddingDummyData}
            variant="secondary"
            size="sm"
            className="w-full"
            title="Add sample notes to test features"
          >
            <Database className="w-4 h-4" />
            <span className="ml-2">
              {isAddingDummyData ? 'Adding...' : 'Add Sample Data'}
            </span>
          </Button>
        )}
      </div>

      {/* Main Navigation - Only show in collapsed mode */}
      {isCollapsed && (
        <div className="px-4 py-2 flex-shrink-0">
          <nav className="space-y-2">
            <button
              onClick={() => onViewChange('notes')}
              className={`
                w-full flex items-center justify-center p-3 rounded-lg transition-colors
                ${currentView === 'notes'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
              title="All Notes"
            >
              <FileText className="w-6 h-6" />
            </button>
            <button
              onClick={() => onViewChange('graph')}
              className={`
                w-full flex items-center justify-center p-3 rounded-lg transition-colors
                ${currentView === 'graph'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
              title="Knowledge Graph"
            >
              <Network className="w-6 h-6" />
            </button>
            <button
              onClick={() => onViewChange('analytics')}
              className={`
                w-full flex items-center justify-center p-3 rounded-lg transition-colors
                ${currentView === 'analytics'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
              title="Analytics"
            >
              <BarChart3 className="w-6 h-6" />
            </button>
          </nav>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Quick Access */}
        {!isCollapsed && (
          <div className="px-4 py-2">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              Quick Access
            </h3>
            <div className="space-y-1">
              {quickAccessItems.map((item) => (
                <motion.button
                  key={item.label}
                  whileHover={{ x: 2 }}
                  onClick={() => handleQuickAccessClick(item.filter)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-700 transition-colors group ${item.bgColor}`}
                  title={item.description}
                >
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full group-hover:bg-white">
                    {item.count}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Categories Section */}
        {!isCollapsed && categoryItems.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categories
              </h3>
              <button
                onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                className="text-gray-400 hover:text-gray-600"
                title="Filter categories"
              >
                <Filter className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-1">
              {categoryItems.slice(0, showCategoryFilter ? categoryItems.length : 6).map((category) => (
                <button
                  key={category.name}
                  onClick={() => handleCategoryClick(category.name)}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors group"
                >
                  <Tag className={`w-4 h-4 ${category.color}`} />
                  <span className="flex-1 text-left text-sm">{category.name}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full group-hover:bg-white">
                    {category.count}
                  </span>
                </button>
              ))}
              {!showCategoryFilter && categoryItems.length > 6 && (
                <button 
                  onClick={() => setShowCategoryFilter(true)}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors text-sm"
                >
                  <span className="flex-1 text-left">+{categoryItems.length - 6} more categories</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Folders Section */}
        {!isCollapsed && folders.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-200">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              Folders
            </h3>
            <div className="space-y-1">
              {folders.map((folder) => (
                <div key={folder.id} className="space-y-1">
                  <button
                    onClick={() => toggleFolder(folder.id)}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                  >
                    {expandedFolders.has(folder.id) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <Folder className="w-4 h-4" style={{ color: folder.color }} />
                    <span className="text-sm flex-1 text-left">{folder.name}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Features Section */}
        {!isCollapsed && (
          <div className="px-4 py-2 border-t border-gray-200">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              AI Features
            </h3>
            <div className="space-y-2">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">Smart Analysis</span>
                </div>
                <p className="text-xs text-gray-600">
                  AI automatically analyzes mood using the wheel of emotions, categorizes content, and extracts key insights.
                </p>
              </div>
              
              {/* Emotion Statistics */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900">Emotion Tracking</span>
                </div>
                <p className="text-xs text-gray-600">
                  Track your emotional journey with {notes.filter(n => n.sentiment).length} analyzed notes across the emotion spectrum.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-500">
                  {notes.length} notes • {notes.filter(n => n.is_favorite).length} favorites
                </p>
              </div>
              <button
                onClick={signOut}
                className="text-gray-400 hover:text-gray-600 p-1"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};