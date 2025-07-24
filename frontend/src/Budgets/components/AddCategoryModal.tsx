import React, { useState } from 'react';
import { createCategory } from '../../api/apiClient'; // We'll use this API function
import Modal from '../../components/ui/Modal'; // Import our generic modal

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryAdded: () => void; // A function to tell the parent page to refresh its data
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ isOpen, onClose, onCategoryAdded }) => {
  const [categoryName, setCategoryName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!categoryName.trim()) {
      setError('Category name cannot be empty.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      // The is_income flag is false by default for expense tracking
      await createCategory({ name: categoryName, is_income: false });
      
      onCategoryAdded(); // Tell the Budgets page to refresh
      onClose(); // Close the modal on success
      setCategoryName(''); // Reset the input field

    } catch (err: any) {
      console.error("Failed to create category:", err);
      setError(err.response?.data?.detail || "An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Category">
      <div className="space-y-4">
        <div>
          <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">
            Category Name
          </label>
          <input
            type="text"
            id="categoryName"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., Pet Expenses"
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex justify-end space-x-2">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isSaving ? 'Saving...' : 'Save Category'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddCategoryModal;