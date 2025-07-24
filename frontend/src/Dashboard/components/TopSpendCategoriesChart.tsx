// File: src/Dashboard/components/TopSpendCategoriesChart.tsx

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom'; // ✅ 1. Import useNavigate
import { Download } from 'lucide-react';
import type { TopCategory } from '../../types';

// ✅ 2. Update props to accept the current month
interface TopSpendCategoriesChartProps {
  data: TopCategory[];
  currentMonth: string;
}

const CATEGORY_COLORS: { [key: string]: string } = {
  'Food': '#10B981', 'Shopping': '#3B82F6', 'Travel': '#EF4444', 'Bills': '#64748B', 'Entertainment': '#8B5CF6',
  'Transportation': '#F97316', 'Healthcare': '#EC4899', 'Miscellaneous': '#F59E0B', 'Services': '#14B8A6',
  'Transfers': '#6366F1', 'default': '#A1A1AA',
};

const CustomLegend = (props: any) => {
  const { payload } = props;
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-4 text-xs text-gray-600 mt-2">
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center">
          <span className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: entry.color }} />
          <span>{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

const TopSpendCategoriesChart: React.FC<TopSpendCategoriesChartProps> = ({ data, currentMonth }) => {
  const navigate = useNavigate(); // ✅ 3. Initialize the navigate function

  // ✅ 4. Create the click handler
  const handlePieClick = (data: any) => {
    // The clicked slice's data is in the payload property
    const { id: categoryId } = data.payload;
    if (categoryId) {
        navigate('/expenses', { 
            state: { 
                filterCategoryId: categoryId,
                filterMonth: currentMonth 
            } 
        });
    }
  };

  return (
    <div className="w-full h-full p-4 bg-white rounded-lg shadow-md flex flex-col">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Top Spending Categories</h3>
        <button className="text-gray-400 hover:text-gray-600"><Download size={18} /></button>
      </div>

      <div className="flex-grow w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {/* ✅ 5. Add the onClick handler to the Pie component */}
            <Pie 
              data={data} 
              cx="50%" 
              cy="50%" 
              innerRadius="65%"
              outerRadius="85%"
              paddingAngle={5} 
              dataKey="amount" 
              nameKey="category"
              onClick={handlePieClick}
              className="cursor-pointer" // Add a pointer to indicate it's clickable
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.default} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)} 
            />
            <Legend content={<CustomLegend />} verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TopSpendCategoriesChart;