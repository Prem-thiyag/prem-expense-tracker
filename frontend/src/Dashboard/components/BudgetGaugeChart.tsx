// File: src/Dashboard/components/BudgetGaugeChart.tsx

import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { Download, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BudgetVsSpendData {
  spent: number;
  budget: number;
  percentUsed: number;
}

interface BudgetGaugeChartProps {
  data: BudgetVsSpendData;
}

// ✅ --- THIS IS THE FIX ---
// Using an implicit return with parentheses ensures the function returns a string.
const formatCurrency = (value: number) => (
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
);

const BudgetGaugeChart: React.FC<BudgetGaugeChartProps> = ({ data }) => {
  if (!data || data.budget <= 0) {
    return (
      <div className="w-full h-full p-4 bg-white rounded-lg shadow-md flex flex-col items-center justify-center text-center">
        <Info size={32} className="text-gray-400 mb-2" />
        <h3 className="text-lg font-semibold text-gray-800">No Budget Set</h3>
        <p className="text-sm text-gray-500 mb-4">
          Set a budget to track your spending progress.
        </p>
        <Link 
          to="/budgets" 
          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
        >
          Go to Budgets
        </Link>
      </div>
    );
  }
  
  const chartData = [{ name: "Used Budget", value: Math.min(data.percentUsed, 100) }];

  return (
    <div className="w-full h-full p-4 bg-white rounded-lg shadow-md flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-800">Budget Vs Spend</h3>
        <button className="text-gray-400 hover:text-gray-600"><Download size={18} /></button>
      </div>
      <div className="flex-1 w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="60%"
            innerRadius="70%" outerRadius="95%"
            barSize={15}
            data={chartData}
            startAngle={180} endAngle={0}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} axisLine={false} />
            <RadialBar background dataKey="value" angleAxisId={0} cornerRadius={10} fill="#3b82f6" />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center -mt-10">
        <p className="text-sm text-gray-500">{formatCurrency(data.spent)} spent of {formatCurrency(data.budget)}</p>
        <p className="font-bold text-gray-700 text-xl">{data.percentUsed.toFixed(0)}% Used</p>
      </div>
    </div>
  );
};

export default BudgetGaugeChart;