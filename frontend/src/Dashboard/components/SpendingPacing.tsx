// File: src/Dashboard/components/SpendingPacing.tsx
import React from 'react';
import { TrendingUp, Target } from 'lucide-react';

interface Props {
  dailyAverage: number;
  projectedSpend: number;
}

const formatCurrency = (value: number) => (
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(value)
);

const SpendingPacing: React.FC<Props> = ({ dailyAverage, projectedSpend }) => {
  return (
    <div className="w-full h-full p-4 bg-white rounded-lg shadow-md flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-800">Spending Pace</h3>
        <p className="text-sm text-gray-500">Your current spending habits this month.</p>
      </div>
      <div className="flex justify-around items-center mt-4">
        <div className="text-center">
          <TrendingUp size={28} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Daily Average</p>
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(dailyAverage)}</p>
        </div>
        <div className="text-center">
          <Target size={28} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Projected Spend</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(projectedSpend)}</p>
        </div>
      </div>
    </div>
  );
};
export default SpendingPacing;