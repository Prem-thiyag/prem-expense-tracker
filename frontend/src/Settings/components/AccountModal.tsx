// File: src/Settings/components/AccountModal.tsx

import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
// ✅ Import createAccount along with updateAccount
import { createAccount, updateAccount } from '../../api/apiClient';
import type { Account } from '../../types';
import toast from 'react-hot-toast';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  // This prop can be an Account object (for editing) or null (for adding)
  accountToEdit: Account | null; 
}

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, onSave, accountToEdit }) => {
  // --- State for all form fields ---
  const [name, setName] = useState('');
  const [type, setType] = useState('Bank'); // Default to 'Bank'
  const [provider, setProvider] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine if we are in "edit" mode
  const isEditMode = !!accountToEdit;

  // Pre-fill the form when the modal opens in edit mode
  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setName(accountToEdit.name);
        setType(accountToEdit.type);
        setProvider(accountToEdit.provider);
      } else {
        // Reset the form for "add new" mode
        setName('');
        setType('Bank');
        setProvider('');
      }
      setError(null); // Clear previous errors
    }
  }, [accountToEdit, isOpen, isEditMode]);

  const handleSave = async () => {
    if (!name.trim() || !type.trim() || !provider.trim()) {
      setError('All fields are required.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      const payload = { name, type, provider };

      if (isEditMode) {
        // If we are editing, call the UPDATE endpoint
        await updateAccount(accountToEdit.id, payload);
        toast.success("Account updated successfully!");
      } else {
        // Otherwise, call the CREATE endpoint
        await createAccount(payload);
        toast.success("Account created successfully!");
      }
      
      onSave(); // Refresh the data on the parent page
      onClose(); // Close the modal

    } catch (err: any) {
      console.error("Failed to save account:", err);
      setError(err.response?.data?.detail || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    // The title is now dynamic
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Edit Account" : "Add New Account"}>
      <div className="space-y-4">
        {/* Account Name Input */}
        <div>
          <label htmlFor="accountName" className="block text-sm font-medium text-gray-700">Account Name</label>
          <input
            type="text"
            id="accountName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="e.g., My HDFC Savings"
          />
        </div>

        {/* Provider Input (Bank Name) */}
        <div>
          <label htmlFor="provider" className="block text-sm font-medium text-gray-700">Provider</label>
          <input
            type="text"
            id="provider"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="e.g., HDFC, ICICI, Cash"
          />
        </div>
        
        {/* Type Selector */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Account Type</label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option>Bank</option>
            <option>Cash</option>
            <option>Wallet</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

        <div className="flex justify-end space-x-3 pt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400">
            {isSaving ? 'Saving...' : (isEditMode ? 'Update Account' : 'Create Account')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AccountModal;