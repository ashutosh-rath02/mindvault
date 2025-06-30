import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Search, Settings, Download } from 'lucide-react';
import { AuthForm } from './components/auth/AuthForm';
import { Sidebar } from './components/layout/Sidebar';
import { NoteEditor } from './components/notes/NoteEditor';
import { NotesList } from './components/notes/NotesList';
import { KnowledgeGraph } from './components/knowledge/KnowledgeGraph';
import { Analytics } from './components/dashboard/Analytics';
import { CategoryManager } from './components/notes/CategoryManager';
import { ExportImport } from './components/features/ExportImport';
import { ToastContainer } from './components/ui/Toast';
import { useAuthStore } from './stores/authStore';
import { useNotesStore } from './stores/notesStore';

function App() {
  const { user, loading, initialize } = useAuthStore();
  const { notes, loadNotes, loadFolders, selectedNote, searchNotes, searchQuery, getFilteredNotes } = useNotesStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState<'notes' | 'graph' | 'analytics'>('notes');
  const [notesListWidth, setNotesListWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showExportImport, setShowExportImport] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error' | 'warning' | 'info'; title: string; message?: string }>>([]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (user) {
      loadNotes(user.id);
      loadFolders(user.id);
    }
  }, [user, loadNotes, loadFolders]);

  const addToast = (toast: Omit<typeof toasts[0], 'id'>) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Handle search
  const handleSearch = (query: string) => {
    searchNotes(query);
  };

  // Get filtered notes
  const filteredNotes = getFilteredNotes();

  // Handle resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = Math.max(280, Math.min(600, e.clientX - (sidebarCollapsed ? 64 : 280)));
      setNotesListWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, sidebarCollapsed]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Loading MindVault...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onSuccess={() => window.location.reload()} />;
  }

  const renderMainContent = () => {
    switch (currentView) {
      case 'graph':
        return <KnowledgeGraph notes={filteredNotes} />;
      case 'analytics':
        return <Analytics notes={notes} />;
      default:
        return (
          <div className="flex-1 flex overflow-hidden">
            <div 
              className="border-r border-gray-200 bg-gray-50 relative flex-shrink-0"
              style={{ width: notesListWidth }}
            >
              <NotesList notes={filteredNotes} />
              
              {/* Resize Handle */}
              <div
                className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors group"
                onMouseDown={handleMouseDown}
              >
                <div className="w-1 h-full bg-transparent group-hover:bg-blue-500"></div>
              </div>
            </div>
            <NoteEditor note={selectedNote} />
          </div>
        );
    }
  };

  return (
    <Router>
      <div className="h-screen bg-gray-100 flex overflow-hidden">
        <Sidebar 
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          currentView={currentView}
          onViewChange={setCurrentView}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Enhanced Top Navigation */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <nav className="flex space-x-1">
                  {[
                    { key: 'notes', label: 'Notes', icon: FileText },
                    { key: 'graph', label: 'Knowledge Graph', icon: FileText },
                    { key: 'analytics', label: 'Analytics', icon: FileText },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setCurrentView(item.key as any)}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-colors
                        ${currentView === item.key
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }
                      `}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
              
              {/* Search */}
              <div className="flex-1 max-w-md mx-8">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search across all notes... (⌘K)"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => handleSearch('')}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {filteredNotes.length} {searchQuery ? 'found' : 'notes'}
                </span>
                {searchQuery && (
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    Searching: "{searchQuery}"
                  </span>
                )}
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowCategoryManager(true)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    title="Manage categories"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowExportImport(true)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    title="Export & Share"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {renderMainContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Modals */}
        <CategoryManager 
          isOpen={showCategoryManager} 
          onClose={() => setShowCategoryManager(false)} 
        />
        <ExportImport 
          isOpen={showExportImport} 
          onClose={() => setShowExportImport(false)} 
        />

        {/* Toast Container */}
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    </Router>
  );
}

export default App;