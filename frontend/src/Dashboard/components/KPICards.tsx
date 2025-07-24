// File: src/Dashboard/components/KPICards.tsx

import React from 'react';
// Import a few more icons for visual variety
import { ArrowUp, CalendarDays, BarChartBig } from 'lucide-react';

// Define the new shape of the props this component expects
interface KPICardsProps {
  totalSpent: number;
  dailyAverage: number;
  projectedSpend: number;
  percentChange: number;
}

// Helper to format numbers with commas and currency symbol
const formatCurrency = (value: number) => (
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
);

const KPICards: React.FC<KPICardsProps> = ({ totalSpent, dailyAverage, projectedSpend, percentChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Total Spent Card (with % change) */}
      <div className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
        <div>
          <p className="text-sm font-semibold text-gray-500">Total Spent (This Month)</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{formatCurrency(totalSpent)}</p>
          <p className={`text-xs mt-1 font-semibold ${percentChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>
            {percentChange >= 0 ? '▲' : '▼'} {Math.abs(percentChange).toFixed(1)}% From Last Month
          </p>
        </div>
        <div className={`p-2 rounded-lg ${percentChange >= 0 ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-500'}`}>
          <ArrowUp size={20} />
        </div>
      </div>

      {/* Daily Average Spend Card */}
      <div className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
        <div>
          <p className="text-sm font-semibold text-gray-500">Daily Average</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{formatCurrency(dailyAverage)}</p>
          <p className="text-xs text-gray-400 mt-1">Your current burn rate.</p>
        </div>
         <div className="bg-yellow-100 p-2 rounded-lg text-yellow-500">
          <CalendarDays size={20} />
        </div>
      </div>

      {/* Projected Monthly Spend Card */}
      <div className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
        <div>
          <p className="text-sm font-semibold text-gray-500">Projected Spend</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{formatCurrency(projectedSpend)}</p>
          <p className="text-xs text-gray-400 mt-1">Forecast based on current pace.</p>
        </div>
        <div className="bg-blue-100 p-2 rounded-lg text-blue-500">
          <BarChartBig size={20} />
        </div>
      </div>
    </div>
  );
};

export default KPICards;