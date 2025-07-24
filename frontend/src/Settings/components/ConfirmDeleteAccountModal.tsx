// File: src/Settings/components/ConfirmDeleteAccountModal.tsx

import React, { useState } from 'react';
import Modal from '../../components/ui/Modal';
import { ShieldAlert } from 'lucide-react';

interface ConfirmDeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  // This function will now pass the password back to the parent
  onConfirm: (password: string) => void; 
}

const ConfirmDeleteAccountModal: React.FC<ConfirmDeleteAccountModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    // We do a basic check here, but the real validation is on the backend
    if (!password) {
      setError("Password is required to confirm deletion.");
      return;
    }
    onConfirm(password);
  };

  // Reset password field and error when modal is closed
  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Delete Your Account">
      <div className="space-y-4">
        <div className="flex items-center p-4 bg-red-50 text-red-700 rounded-lg">
          <ShieldAlert className="w-10 h-10 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-bold">This action is permanent and cannot be undone.</h3>
            <p className="text-sm">All of your data, including transactions, budgets, and categories, will be permanently erased.</p>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Please enter your password to confirm.
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button onClick={handleClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300">
            Cancel
          </button>
          <button 
            onClick={handleConfirm} 
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700"
          >
            Confirm & Delete Account
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteAccountModal;