// File: src/components/ui/Modal.tsx

import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  // If the modal is not open, render nothing.
  if (!isOpen) {
    return null;
  }

  return (
    // Backdrop: a semi-transparent overlay that covers the whole screen.
    // Clicking it will close the modal.
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* 
        Modal Content Container: the white box.
        e.stopPropagation() prevents a click inside the modal from bubbling up to the backdrop and closing it.
      */}
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        
        {/* 
          ✅ --- THIS IS THE UPDATED PART ---
          Modal Body: A simple container with padding.
          All scrolling logic (`overflow-y-auto`, `max-h-[80vh]`, `flex-col`) has been removed.
        */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;