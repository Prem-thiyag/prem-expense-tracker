// File: src/Budgets/components/TotalBudgetCard.tsx

import React from 'react';
import { Lock, Unlock } from 'lucide-react';

interface TotalBudgetCardProps {
  totalBudget: number; // This will now be the user's target when unlocked
  onTotalBudgetChange: (newTotal: number | null) => void;
  isLocked: boolean;
  onToggleLock: () => void;
}

const TotalBudgetCard: React.FC<TotalBudgetCardProps> = ({
  totalBudget, onTotalBudgetChange, isLocked, onToggleLock
}) => {

  // This handler correctly handles empty inputs and prevents leading zeros.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      onTotalBudgetChange(null); // Set state to null for empty input
    } else {
      onTotalBudgetChange(Number(value));
    }
  };

  return (
    <div className={`bg-white p-4 rounded-lg shadow-md flex flex-col gap-2 border-2 ${!isLocked ? 'border-blue-500' : 'border-transparent'}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-500">Total Budget</h3>
        <button onClick={onToggleLock} className="text-gray-400 hover:text-gray-700">
          {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
        </button>
      </div>
      <input
        type="number"
        className="border-none text-3xl font-bold text-gray-800 p-0 focus:ring-0 disabled:bg-white"
        // If the value is 0, display an empty string to allow typing.
        value={totalBudget === 0 ? '' : totalBudget}
        onChange={handleChange}
        disabled={isLocked}
        placeholder="Set a Target"
      />
    </div>
  );
};

export default TotalBudgetCard;