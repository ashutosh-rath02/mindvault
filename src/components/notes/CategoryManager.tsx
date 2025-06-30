import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Plus, X, Edit2, Trash2, Palette } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNotesStore } from '../../stores/notesStore';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Indigo', value: '#6366f1' },
];

export const CategoryManager: React.FC<CategoryManagerProps> = ({ isOpen, onClose }) => {
  const { notes, updateNote } = useNotesStore();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLORS[0].value);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  // Get categories with counts
  const categories = notes.reduce((acc, note) => {
    const category = note.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = { count: 0, notes: [] };
    }
    acc[category].count++;
    acc[category].notes.push(note);
    return acc;
  }, {} as Record<string, { count: number; notes: any[] }>);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    // For now, we'll just create the category by updating a note
    // In a full implementation, you might want a separate categories table
    setNewCategoryName('');
    onClose();
  };

  const handleRenameCategory = async (oldName: string, newName: string) => {
    if (!newName.trim() || oldName === newName) return;

    // Update all notes with the old category to use the new name
    const notesToUpdate = categories[oldName]?.notes || [];
    for (const note of notesToUpdate) {
      await updateNote(note.id, {
        category: newName,
        updated_at: new Date().toISOString(),
      });
    }

    setEditingCategory(null);
  };

  const handleDeleteCategory = async (categoryName: string) => {
    if (!confirm(`Are you sure you want to delete the "${categoryName}" category? Notes will become uncategorized.`)) {
      return;
    }

    // Remove category from all notes
    const notesToUpdate = categories[categoryName]?.notes || [];
    for (const note of notesToUpdate) {
      await updateNote(note.id, {
        category: null,
        updated_at: new Date().toISOString(),
      });
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
              <Tag className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Manage Categories</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Create New Category */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Create New Category</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <div>
                <label className="block text-xs text-gray-500 mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={`w-6 h-6 rounded-full border-2 ${
                        selectedColor === color.value ? 'border-gray-400' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <Button
                onClick={handleCreateCategory}
                disabled={!newCategoryName.trim()}
                variant="primary"
                size="sm"
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Category
              </Button>
            </div>
          </div>

          {/* Existing Categories */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Existing Categories</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Object.entries(categories).map(([categoryName, data]) => (
                <div
                  key={categoryName}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: categoryName === 'Work' ? '#3b82f6' :
                                       categoryName === 'Personal' ? '#10b981' :
                                       categoryName === 'Ideas' ? '#8b5cf6' :
                                       categoryName === 'Research' ? '#f97316' :
                                       categoryName === 'Learning' ? '#06b6d4' :
                                       categoryName === 'Health' ? '#84cc16' :
                                       categoryName === 'Finance' ? '#eab308' :
                                       categoryName === 'Travel' ? '#ec4899' :
                                       '#64748b'
                      }}
                    />
                    {editingCategory === categoryName ? (
                      <input
                        type="text"
                        defaultValue={categoryName}
                        onBlur={(e) => handleRenameCategory(categoryName, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleRenameCategory(categoryName, e.currentTarget.value);
                          } else if (e.key === 'Escape') {
                            setEditingCategory(null);
                          }
                        }}
                        className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        autoFocus
                      />
                    ) : (
                      <div>
                        <span className="text-sm font-medium text-gray-900">{categoryName}</span>
                        <span className="text-xs text-gray-500 ml-2">({data.count} notes)</span>
                      </div>
                    )}
                  </div>
                  
                  {categoryName !== 'Uncategorized' && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setEditingCategory(categoryName)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Rename category"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(categoryName)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete category"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};