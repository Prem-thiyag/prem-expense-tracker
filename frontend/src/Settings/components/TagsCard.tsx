// File: src/Settings/components/TagsCard.tsx

import React from 'react';
import { Pencil, Trash2, PlusCircle } from "lucide-react";
import type { Tag } from '../../types';

interface TagsCardProps {
    tags: Tag[];
    onAdd: () => void;
    onEdit: (tag: Tag) => void;
    onDelete: (tagId: number) => void;
}

const TagsCard: React.FC<TagsCardProps> = ({ tags = [], onAdd, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex flex-col h-80">
      <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Tags</h2>
          <button onClick={onAdd} className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800">
            <PlusCircle size={16} /> Add New
          </button>
      </div>
      {/* ✅ --- ADDED SCROLLBAR CONTAINER --- */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {tags.length > 0 ? (
          tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
            >
              <span className="text-sm font-medium">{tag.name}</span>
              <div className="flex items-center space-x-2">
                <button onClick={() => onEdit(tag)} className="p-1 text-gray-500 hover:text-blue-600">
                  <Pencil size={16} />
                </button>
                <button onClick={() => onDelete(tag.id)} className="p-1 text-gray-500 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 mt-4">No tags found. Add one to get started!</p>
        )}
      </div>
    </div>
  );
}

export default TagsCard;