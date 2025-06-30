import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Upload, FileText, Database, Share, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNotesStore } from '../../stores/notesStore';
import { useAuthStore } from '../../stores/authStore';

interface ExportImportProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportImport: React.FC<ExportImportProps> = ({ isOpen, onClose }) => {
  const { notes } = useNotesStore();
  const { user } = useAuthStore();
  const [exportFormat, setExportFormat] = useState<'json' | 'markdown' | 'csv'>('json');
  const [isExporting, setIsExporting] = useState(false);

  const exportData = async () => {
    setIsExporting(true);
    
    try {
      let content = '';
      let filename = '';
      let mimeType = '';

      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          totalNotes: notes.length,
          userEmail: user?.email,
          version: '1.0.0',
        },
        notes: notes.map(note => ({
          id: note.id,
          title: note.title,
          content: note.content,
          category: note.category,
          sentiment: note.sentiment,
          tags: note.tags,
          wordCount: note.word_count,
          isFavorite: note.is_favorite,
          isArchived: note.is_archived,
          createdAt: note.created_at,
          updatedAt: note.updated_at,
        })),
      };

      switch (exportFormat) {
        case 'json':
          content = JSON.stringify(exportData, null, 2);
          filename = `mindvault-export-${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
          break;
          
        case 'markdown':
          content = `# MindVault Export\n\nExported on: ${new Date().toLocaleDateString()}\nTotal Notes: ${notes.length}\n\n---\n\n`;
          content += notes.map(note => {
            let noteContent = `## ${note.title || 'Untitled Note'}\n\n`;
            if (note.category) noteContent += `**Category:** ${note.category}\n`;
            if (note.sentiment) noteContent += `**Mood:** ${note.sentiment}\n`;
            if (note.tags && note.tags.length > 0) noteContent += `**Tags:** ${note.tags.join(', ')}\n`;
            noteContent += `**Created:** ${new Date(note.created_at).toLocaleDateString()}\n`;
            noteContent += `**Words:** ${note.word_count || 0}\n\n`;
            noteContent += `${note.content}\n\n---\n\n`;
            return noteContent;
          }).join('');
          filename = `mindvault-export-${new Date().toISOString().split('T')[0]}.md`;
          mimeType = 'text/markdown';
          break;
          
        case 'csv':
          const csvHeaders = ['Title', 'Content', 'Category', 'Sentiment', 'Tags', 'Word Count', 'Is Favorite', 'Created At', 'Updated At'];
          const csvRows = notes.map(note => [
            `"${(note.title || '').replace(/"/g, '""')}"`,
            `"${note.content.replace(/"/g, '""')}"`,
            `"${note.category || ''}"`,
            `"${note.sentiment || ''}"`,
            `"${(note.tags || []).join(', ')}"`,
            note.word_count || 0,
            note.is_favorite ? 'Yes' : 'No',
            new Date(note.created_at).toISOString(),
            new Date(note.updated_at).toISOString(),
          ]);
          content = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');
          filename = `mindvault-export-${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
          break;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const shareData = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My MindVault Notes',
          text: `I've been organizing my thoughts with MindVault! I have ${notes.length} notes across ${new Set(notes.map(n => n.category).filter(Boolean)).size} categories.`,
          url: window.location.origin,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `I've been organizing my thoughts with MindVault! I have ${notes.length} notes across ${new Set(notes.map(n => n.category).filter(Boolean)).size} categories. Check it out at ${window.location.origin}`;
      navigator.clipboard.writeText(shareText);
    }
  };

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
          className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Export & Share</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Export Section */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Export Your Notes</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-2">Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'json', label: 'JSON', desc: 'Complete data' },
                    { value: 'markdown', label: 'Markdown', desc: 'Readable format' },
                    { value: 'csv', label: 'CSV', desc: 'Spreadsheet' },
                  ].map((format) => (
                    <button
                      key={format.value}
                      onClick={() => setExportFormat(format.value as any)}
                      className={`p-3 text-center border rounded-lg transition-colors ${
                        exportFormat === format.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-medium">{format.label}</div>
                      <div className="text-xs text-gray-500">{format.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">
                  <strong>Export includes:</strong>
                  <ul className="mt-1 text-xs space-y-1">
                    <li>• {notes.length} notes with full content</li>
                    <li>• Categories and emotional analysis</li>
                    <li>• Tags and metadata</li>
                    <li>• Creation and modification dates</li>
                  </ul>
                </div>
              </div>

              <Button
                onClick={exportData}
                disabled={isExporting}
                variant="primary"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : `Export as ${exportFormat.toUpperCase()}`}
              </Button>
            </div>
          </div>

          {/* Share Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Share Your Progress</h3>
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-100">
                <div className="text-sm text-gray-700">
                  <strong>Your MindVault Stats:</strong>
                  <ul className="mt-1 text-xs space-y-1">
                    <li>📝 {notes.length} total notes</li>
                    <li>📂 {new Set(notes.map(n => n.category).filter(Boolean)).size} categories</li>
                    <li>⭐ {notes.filter(n => n.is_favorite).length} favorites</li>
                    <li>🧠 {notes.filter(n => n.sentiment).length} with emotion analysis</li>
                    <li>📊 {notes.reduce((sum, n) => sum + (n.word_count || 0), 0).toLocaleString()} total words</li>
                  </ul>
                </div>
              </div>

              <Button
                onClick={shareData}
                variant="secondary"
                className="w-full"
              >
                <Share className="w-4 h-4 mr-2" />
                Share Your Journey
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};