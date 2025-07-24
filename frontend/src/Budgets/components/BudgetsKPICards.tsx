// File: src/Budgets/components/BudgetsKPICards.tsx

import React from 'react';

// Define the shape of the props this component expects
interface BudgetsKPICardsProps {
  totalBudget: number;
  totalSpent: number;
  moneyRemaining: number;
}

const BudgetsKPICards: React.FC<BudgetsKPICardsProps> = ({
  totalBudget,
  totalSpent,
  moneyRemaining,
}) => {
  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN')}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Budget Card */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-sm font-semibold text-gray-500">Total Budget</h3>
        <p className="text-3xl font-bold text-gray-800 mt-2">{formatCurrency(totalBudget)}</p>
      </div>

      {/* Total Spent Card */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-sm font-semibold text-gray-500">Total Spent</h3>
        <p className="text-3xl font-bold text-gray-800 mt-2">{formatCurrency(totalSpent)}</p>
      </div>

      {/* Money Remaining Card */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-sm font-semibold text-gray-500">Money Remaining</h3>
        <p className={`text-3xl font-bold mt-2 ${moneyRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(moneyRemaining)}
        </p>
      </div>
    </div>
  );
};

export default BudgetsKPICards;