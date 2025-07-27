// File: src/Dashboard/components/TopSpendCategoriesChart.tsx

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import type { TopCategory } from '../../types';

interface TopSpendCategoriesChartProps {
  data: TopCategory[];
  currentMonth: string;
}

// Your curated list of colors for the most common categories remains the same.
const CATEGORY_COLORS: { [key: string]: string } = {
  'Food': '#10B981', 'Shopping': '#3B82F6', 'Travel': '#EF4444', 'Bills': '#64748B', 'Entertainment': '#8B5CF6',
  'Transportation': '#F97316', 'Healthcare': '#EC4899', 'Miscellaneous': '#F59E0B', 'Services': '#14B8A6',
  'Transfers': '#6366F1', 'default': '#A1A1AA',
};

// ✅ --- NEW HELPER FUNCTION 1 ---
// This function takes a number (the category ID) and consistently generates a color.
// Using HSL (Hue, Saturation, Lightness) is an effective way to create visually distinct colors.
const generateHslColorForId = (id: number): string => {
  // Use the category ID to generate a hue value between 0 and 360.
  // Multiplying by a prime number like 37 helps distribute the colors more evenly.
  const hue = (id * 37) % 360;
  // We use fixed saturation and lightness to ensure all generated colors
  // have a similar, pleasant tone that fits with the existing palette.
  const saturation = 75;
  const lightness = 45; // 45% is a good balance, not too dark or light.
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// ✅ --- NEW HELPER FUNCTION 2 ---
// This function decides whether to use a pre-defined color or generate a new one.
const getCategoryColor = (category: TopCategory): string => {
  // If the category's name is in our curated list, use that specific color.
  if (CATEGORY_COLORS[category.category]) {
    return CATEGORY_COLORS[category.category];
  }
  // Otherwise, generate a unique and persistent color based on its ID.
  return generateHslColorForId(category.id);
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
  const navigate = useNavigate();

  const handlePieClick = (data: any) => {
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
              className="cursor-pointer"
            >
              {/* ✅ --- THIS IS THE FINAL CHANGE --- */}
              {/* Instead of using the old map directly, we now call our new helper function */}
              {/* for each category to get the appropriate color. */}
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getCategoryColor(entry)} />
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