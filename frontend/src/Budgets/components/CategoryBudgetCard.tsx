// File: src/Budgets/components/CategoryBudgetCard.tsx

import React from 'react';
import type { BudgetPlanItem } from '../../types';
import { getCategoryIcon } from '../../utils/iconHelper';
import { formatCurrency } from '../../utils/formatter';

interface CategoryBudgetCardProps {
  item: BudgetPlanItem;
  onBudgetChange: (categoryId: number, newBudget: number) => void;
}

const CategoryBudgetCard: React.FC<CategoryBudgetCardProps> = ({ item, onBudgetChange }) => {
  const remaining = item.budget - item.spent;
  const isOverspent = remaining < 0;

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border p-3 flex items-center justify-between gap-4">
      <div className="flex items-center space-x-3 w-1/4">
        {getCategoryIcon(item.categoryName, item.icon_name)}
        <span className="font-medium text-gray-800">{item.categoryName}</span>
      </div>
      <div className="flex-1 grid grid-cols-3 items-center gap-4 text-sm text-center">
        <div>
          <label className="text-xs text-gray-500">Budget</label>
          <input
            type="number"
            value={item.budget === 0 ? '' : item.budget}
            onChange={(e) => onBudgetChange(item.categoryId, Number(e.target.value) || 0)}
            className="w-full text-center border rounded-md p-1 mt-1 font-semibold placeholder:text-sm placeholder:font-normal"
            placeholder={item.suggestedBudget ? `e.g., ${item.suggestedBudget}` : 'Set Budget'}
            onWheel={(e) => (e.target as HTMLElement).blur()}
          />
        </div>
        <div>
          <p className="text-xs text-gray-500">Spent (This Month)</p>
          <p className="mt-1 p-1 font-semibold">{formatCurrency(item.spent)}</p>
        </div>
        <div>
          <p className={`text-xs font-semibold ${isOverspent ? 'text-red-500' : 'text-green-600'}`}>
            {isOverspent ? 'Overspent' : 'Remaining'}
          </p>
          <p className={`mt-1 p-1 font-bold ${isOverspent ? 'text-red-500' : 'text-green-600'}`}>
            {formatCurrency(remaining)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CategoryBudgetCard;