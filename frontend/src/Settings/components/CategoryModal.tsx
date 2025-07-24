// File: src/Settings/components/CategoryModal.tsx

import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import IconPicker from './IconPicker';
import { createCategory, updateCategory } from '../../api/apiClient';
import type { Category } from '../../types';

// ✅ --- FIX #1: Correct the prop name in the interface ---
interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  categoryToEdit?: Category | null;
  availableIcons: string[]; // Use 'availableIcons' to match what the parent provides
}

// ✅ --- FIX #2: Accept the correct prop name in the function signature ---
const CategoryModal: React.FC<CategoryModalProps> = ({ 
  isOpen, onClose, onSave, categoryToEdit, availableIcons 
}) => {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (categoryToEdit) {
        setName(categoryToEdit.name);
        setSelectedIcon(categoryToEdit.icon_name || null);
      } else {
        setName('');
        setSelectedIcon(null);
      }
      setError(null);
    }
  }, [categoryToEdit, isOpen]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Category name cannot be empty.');
      return;
    }

    // Note: The logic to check for used icons is now in the parent (Settings.tsx).
    // The `availableIcons` prop already contains only the valid choices.
    // However, we still need a backend check for race conditions.

    try {
      setIsSaving(true);
      setError(null);
      
      const payload = {
        name: name,
        icon_name: selectedIcon,
        is_income: false,
      };

      if (categoryToEdit) {
        await updateCategory(categoryToEdit.id, payload);
      } else {
        await createCategory(payload);
      }

      onSave();
      onClose();
    } catch (err: any) {
      console.error("Failed to save category:", err);
      setError(err.response?.data?.detail || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={categoryToEdit ? "Edit Category" : "Add New Category"}>
      <div className="space-y-4">
        <div>
          <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">Category Name</label>
          <input
            type="text"
            id="categoryName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        
        {/* ✅ --- FIX #3: Pass the correct prop down to the IconPicker --- */}
        <IconPicker 
          selectedValue={selectedIcon} 
          onIconSelect={setSelectedIcon} 
          availableIcons={availableIcons} 
        />

        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

        <div className="flex justify-end space-x-3 pt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isSaving ? 'Saving...' : (categoryToEdit ? 'Update Category' : 'Create Category')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CategoryModal;