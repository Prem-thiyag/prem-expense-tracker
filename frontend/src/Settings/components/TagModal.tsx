// File: src/Settings/components/TagModal.tsx
import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import { createTag, updateTag } from '../../api/apiClient';
import type { Tag } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  tagToEdit?: Tag | null;
}

const TagModal: React.FC<Props> = ({ isOpen, onClose, onSave, tagToEdit }) => {
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(tagToEdit ? tagToEdit.name : '');
      setError(null);
    }
  }, [tagToEdit, isOpen]);

  const handleSave = async () => {
    if (!name.trim()) return setError('Tag name cannot be empty.');
    try {
      setIsSaving(true);
      setError(null);
      const payload = { name };
      if (tagToEdit) {
        await updateTag(tagToEdit.id, payload);
        toast.success("Tag updated successfully!");
      } else {
        await createTag(payload);
        toast.success("Tag created successfully!");
      }
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={tagToEdit ? "Edit Tag" : "Add New Tag"}>
      <div className="space-y-4">
        <div>
          <label htmlFor="tagName" className="block text-sm font-medium text-gray-700">Tag Name</label>
          <input type="text" id="tagName" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
        </div>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        <div className="flex justify-end space-x-3 pt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400">
            {isSaving ? 'Saving...' : 'Save Tag'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
export default TagModal;