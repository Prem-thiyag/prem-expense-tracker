// File: src/Analytics/components/SpendingVelocityChart.tsx

import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import type { SpendingVelocityPoint, SpendingCompositionPoint } from '../../types';

interface Props {
  viewMode: 'month' | 'trend';
  velocityData?: SpendingVelocityPoint[];
  compositionData?: SpendingCompositionPoint[];
  timePeriod?: string; // ✅ 1. Add timePeriod to the props
}

const SpendingVelocityChart: React.FC<Props> = ({ viewMode, velocityData, compositionData, timePeriod }) => {
  
  // ✅ --- 2. DYNAMIC LEGEND LABEL LOGIC ---
  const getAverageLabel = () => {
    switch(timePeriod) {
        case '3m': return "3-Month Average";
        case '1y': return "This Year's Average";
        case 'all': return "All-Time Average";
        default: return "6-Month Average";
    }
  };

  if (viewMode === 'trend') {
    return (
      <div className="bg-white p-4 rounded-xl shadow-sm h-full flex flex-col">
        <h3 className="font-semibold mb-2">Spending Velocity</h3>
        <div className="flex-grow">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={velocityData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(val) => `₹${Number(val/1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
              <Legend />
              <Line type="monotone" dataKey="current" name="This Month" stroke="#1d4ed8" strokeWidth={3} dot={false} connectNulls={true} />
              <Line type="monotone" dataKey="previous" name="Last Month" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              {/* ✅ 3. Use the dynamic label for the 'average' line's name */}
              <Line type="monotone" dataKey="average" name={getAverageLabel()} stroke="#f97316" strokeWidth={2} strokeDasharray="2 6" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // --- RENDERER FOR "MONTH" VIEW ---
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm h-full flex flex-col">
      <h3 className="font-semibold mb-2">Spending Composition</h3>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={compositionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(val) => `₹${Number(val/1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
            <Legend />
            <Line type="monotone" dataKey="cumulative_small" name="Small Transactions (< ₹1000)" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="cumulative_large" name="Large Transactions (>= ₹1000)" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SpendingVelocityChart;