// File: src/Settings/components/IconPicker.tsx

import React from 'react';
import { getCategoryIcon } from '../../utils/iconHelper';
import { Ban } from 'lucide-react';

interface IconPickerProps {
  selectedValue: string | null;
  onIconSelect: (iconName: string | null) => void;
  availableIcons: string[]; 
}

const IconPicker: React.FC<IconPickerProps> = ({ selectedValue, onIconSelect, availableIcons = [] }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Choose an Icon
      </label>

      {/* ✅ --- THIS IS THE UPDATED CONTAINER --- */}
      {/* 
        - `h-32`: Sets a fixed height for the container (tailwind's h-32 is 8rem or 128px), which is perfect for two rows of icons.
        - `overflow-y-auto`: Adds a vertical scrollbar ONLY if the content overflows.
        - `pr-2`: Adds a little padding on the right so the scrollbar doesn't overlap the icons.
        - `scrollbar-thin...`: (Optional) These classes style the scrollbar to look nicer.
      */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 p-4 border rounded-md h-32 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        
        {/* "No Icon" Button */}
        <button
            onClick={() => onIconSelect(null)}
            type="button"
            className={`
              flex items-center justify-center w-12 h-12 p-2 rounded-lg 
              transition-all transform hover:scale-110 focus:outline-none 
              ${selectedValue === null ? 'ring-2 ring-blue-500 ring-offset-1' : 'bg-gray-200'}
            `}
            aria-label="No Icon"
            title="No Icon"
          >
            <Ban size={24} className="text-gray-500" />
        </button>

        {/* The available icons */}
        {availableIcons.map(iconName => (
          <button
            key={iconName}
            onClick={() => onIconSelect(iconName)}
            type="button"
            className={`
              flex items-center justify-center w-12 h-12 p-2 rounded-lg 
              transition-all transform hover:scale-110 focus:outline-none 
              ${selectedValue === iconName ? 'ring-2 ring-blue-500 ring-offset-1' : 'bg-gray-100'}
            `}
            aria-label={iconName}
            title={iconName}
          >
            {getCategoryIcon(null, iconName)}
          </button>
        ))}
      </div>
      
      {availableIcons.length === 0 && (
        <p className="text-xs text-gray-500 mt-2">All available icons are currently in use.</p>
      )}
    </div>
  );
};

export default IconPicker;