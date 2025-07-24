// File: src/Analytics/components/CategoryDistribution.tsx

import React from 'react';
import type { CategoryDistributionPoint } from '../../types';
import { formatCurrency } from '../../utils/formatter';

interface Props {
  data: CategoryDistributionPoint[];
}

const CategoryDistribution: React.FC<Props> = ({ data = [] }) => {
  const totalSpend = data.reduce((sum, cat) => sum + cat.total, 0);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm h-80 flex flex-col">
      <h3 className="font-semibold mb-2">Category Distribution</h3>
      <div className="space-y-3 overflow-y-auto pr-2 flex-1 scrollbar-thin">
        {data.sort((a,b) => b.percentage - a.percentage).map((cat) => (
          <div key={cat.category}>
            <div className="flex justify-between items-center text-sm mb-1">
              {/* ✅ --- THIS IS THE CHANGE --- */}
              {/* The category name now includes the total spend */}
              <div>
                <span className="font-medium text-gray-800">{cat.category}</span>
                <span className="text-xs text-gray-500 ml-2">
                  ({formatCurrency(cat.total)})
                </span>
              </div>
              <span className="font-semibold text-gray-700">{cat.percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${cat.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-right text-sm font-semibold border-t pt-2">
        Total Spend: {formatCurrency(totalSpend)}
      </div>
    </div>
  );
};
export default CategoryDistribution;