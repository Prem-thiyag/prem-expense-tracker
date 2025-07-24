// File: src/Settings/components/CategorySettingsCard.tsx

import React from 'react';
import { Pencil, Trash2, PlusCircle } from 'lucide-react'; // Import PlusCircle
import type { Category } from '../../types';
import { getCategoryIcon } from '../../utils/iconHelper';

interface CategorySettingsCardProps {
  categories: Category[];
  onAdd: () => void; // Function to open the "Add New" modal
  onEdit: (category: Category) => void;
  onDelete: (categoryId: number) => void;
}

const CategorySettingsCard: React.FC<CategorySettingsCardProps> = ({ categories = [], onAdd, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex flex-col h-80">
      {/* ✅ --- "ADD NEW" BUTTON IS NOW HERE --- */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Category</h2>
        <button 
          onClick={onAdd} 
          className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800"
        >
          <PlusCircle size={16} /> Add New
        </button>
      </div>
      <div className="overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-300">
        {categories.length > 0 ? (
          categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2"
            >
              <div className="flex items-center gap-3">
                {getCategoryIcon(category.name, category.icon_name)}
                <span className="text-sm font-medium">{category.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => onEdit(category)} className="p-1 text-gray-500 hover:text-blue-600">
                  <Pencil size={16} />
                </button>
                <button onClick={() => onDelete(category.id)} className="p-1 text-gray-500 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 mt-4">No categories found.</p>
        )}
      </div>
    </div>
  );
};

export default CategorySettingsCard;