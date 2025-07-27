// File: src/Dashboard/components/TopSpendCategoriesChart.tsx

import React, { useRef } from 'react'; // ✅ 1. Import useRef
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import type { TopCategory } from '../../types';
import html2canvas from 'html2canvas'; // ✅ 2. Import html2canvas

interface TopSpendCategoriesChartProps {
  data: TopCategory[];
  currentMonth: string;
}

const CATEGORY_COLORS: { [key: string]: string } = {
  'Food': '#10B981', 'Shopping': '#3B82F6', 'Travel': '#EF4444', 'Bills': '#64748B', 'Entertainment': '#8B5CF6',
  'Transportation': '#F97316', 'Healthcare': '#EC4899', 'Miscellaneous': '#F59E0B', 'Services': '#14B8A6',
  'Transfers': '#6366F1', 'default': '#A1A1AA',
};

const generateHslColorForId = (id: number): string => {
  const hue = (id * 37) % 360;
  const saturation = 75;
  const lightness = 45;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const getCategoryColor = (category: TopCategory): string => {
  if (CATEGORY_COLORS[category.category]) {
    return CATEGORY_COLORS[category.category];
  }
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
  const chartRef = useRef<HTMLDivElement>(null); // ✅ 3. Create a ref for the chart container

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

  // ✅ 4. Implement the download handler function
  const handleDownload = () => {
    if (chartRef.current) {
      html2canvas(chartRef.current, {
        // Optional: Improve image quality on high-res screens
        scale: 2, 
        // Optional: Ensure the background is captured (useful if it's not white)
        backgroundColor: '#ffffff', 
      }).then(canvas => {
        // Create a temporary link element
        const link = document.createElement('a');
        // Set a dynamic filename based on the current month
        link.download = `top-spending-categories-${currentMonth}.png`;
        // Set the link's href to the image data from the canvas
        link.href = canvas.toDataURL('image/png');
        // Programmatically click the link to trigger the download
        link.click();
      });
    }
  };

  return (
    // ✅ 5. Attach the ref to the main container div
    <div ref={chartRef} className="w-full h-full p-4 bg-white rounded-lg shadow-md flex flex-col">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Top Spending Categories</h3>
        {/* ✅ 6. Connect the handler to the button's onClick event */}
        <button 
          onClick={handleDownload} 
          className="text-gray-400 hover:text-gray-600 p-1"
          aria-label="Download Chart"
        >
          <Download size={18} />
        </button>
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