// File: src/Analytics/components/MonthlyBreakdownChart.tsx

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatCurrency } from '../../utils/formatter';
import type { MonthlyBreakdownPoint } from '../../types';

interface Props {
  data: MonthlyBreakdownPoint[];
}

const MonthlyBreakdownChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm h-80 flex flex-col">
      <h3 className="font-semibold mb-4">Monthly Spending Breakdown</h3>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tickFormatter={(m) => new Date(m + '-02').toLocaleString('default', { month: 'short' })} />
            <YAxis tickFormatter={(val) => `₹${val/1000}k`} />
            <Tooltip formatter={(value: number) => [formatCurrency(value), "Total Spend"]} />
            <Bar dataKey="spend" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyBreakdownChart;