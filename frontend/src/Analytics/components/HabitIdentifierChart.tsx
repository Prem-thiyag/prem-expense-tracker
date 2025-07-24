// File: src/Analytics/components/HabitIdentifierChart.tsx

import React, { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  ReferenceArea
} from "recharts";
import type { HabitIdentifierPoint } from '../../types';
import { formatCurrency } from '../../utils/formatter';

const CATEGORY_COLORS: { [key: string]: string } = {
  'Bills': '#F87171', 'Food': '#EF4444', 'Travel': '#F59E0B',
  'Shopping': '#3B82F6', 'Miscellaneous': '#6B7280', 'Transfers': '#10B981',
  'Entertainment': '#A855F7', 'Groceries': '#84CC16', 'Health & Wellness': '#EC4899',
  'Education': '#6366F1', 'Personal Care': '#B91C1C', 'Rent': '#14B8A6',
  'Salary': '#0284C7', 'Services': '#64748B', 'default': '#A1A1AA',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg text-sm">
        <p className="font-bold mb-1">{data.category}</p>
        <p>Frequency: <span className="font-semibold">{data.transaction_count} transactions</span></p>
        <p>Avg. Cost: <span className="font-semibold">{formatCurrency(data.average_spend)}</span></p>
        <p>Total Spend: <span className="font-semibold">{formatCurrency(data.total_spend)}</span></p>
      </div>
    );
  }
  return null;
};

const CustomizedDot = (props: any) => {
  const { cx, cy, payload } = props;
  const color = CATEGORY_COLORS[payload.category] || CATEGORY_COLORS.default;
  return <circle cx={cx} cy={cy} r={8} stroke="#fff" strokeWidth={1} fill={color} />;
};

const CategoryLegend = ({ data }: { data: HabitIdentifierPoint[] }) => {
  const uniqueCategories = Array.from(new Set(data.map(item => item.category)));
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-600 mt-3 px-4">
      {uniqueCategories.map((category) => (
        <div key={category} className="flex items-center">
          <span className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: CATEGORY_COLORS[category] || CATEGORY_COLORS.default }} />
          <span>{category}</span>
        </div>
      ))}
    </div>
  );
};

const QuadrantLegend = () => (
  <div className="w-full border-t mt-4 pt-2">
    <div className="flex justify-around text-xs text-gray-700 font-medium">
      <div className="flex items-center"><span className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: '#dcfce7' }}></span>Low Cost / Low Freq</div>
      <div className="flex items-center"><span className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: '#fed7aa' }}></span>High Cost / Low Freq</div>
      <div className="flex items-center"><span className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: '#bae6fd' }}></span>Low Cost / High Freq (Habits)</div>
      <div className="flex items-center"><span className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: '#fecaca' }}></span>High Cost / High Freq (Problem)</div>
    </div>
  </div>
);

interface Props {
  data: HabitIdentifierPoint[];
}

const HabitIdentifierChart: React.FC<Props> = ({ data }) => {
  const zAxisDomain = data.length > 0 ? [0, Math.max(...data.map(p => p.total_spend))] : [0, 0];
  const avgX = data.length > 0 ? data.reduce((sum, p) => sum + p.transaction_count, 0) / data.length : 0;
  const avgY = data.length > 0 ? data.reduce((sum, p) => sum + p.average_spend, 0) / data.length : 0;

  const yAxisTicks = useMemo(() => {
    if (data.length === 0) return [0, 250, 500, 750, 1000];
    const maxY = Math.max(...data.map(d => d.average_spend));
    const step = 250;
    const ticks: number[] = [];
    for (let i = 0; i <= Math.ceil(maxY / step) * step; i += step) {
      ticks.push(i);
    }
    return ticks;
  }, [data]);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm h-full flex flex-col">
      <h3 className="font-semibold mb-2">Spending Habit Identifier</h3>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="transaction_count"
              name="Frequency"
              unit=" txns"
              domain={[0, 'dataMax + 2']}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              type="number"
              dataKey="average_spend"
              name="Avg. Cost"
              width={80}
              ticks={yAxisTicks}
              domain={[0, yAxisTicks[yAxisTicks.length - 1]]}
              tickFormatter={(val) => `₹${(val / 1000).toFixed(1)}k`}
              tick={{ fontSize: 12 }}
            />
            <ZAxis type="number" dataKey="total_spend" domain={zAxisDomain} range={[100, 1000]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />

            <ReferenceArea x1={0} x2={avgX} y1={0} y2={avgY} fill="#dcfce7" fillOpacity={0.6} ifOverflow="visible" />
            <ReferenceArea x1={0} x2={avgX} y1={avgY} fill="#fed7aa" fillOpacity={0.6} ifOverflow="visible" />
            <ReferenceArea x1={avgX} y1={0} y2={avgY} fill="#bae6fd" fillOpacity={0.6} ifOverflow="visible" />
            <ReferenceArea x1={avgX} y1={avgY} fill="#fecaca" fillOpacity={0.6} ifOverflow="visible" />

            <ReferenceLine y={avgY} stroke="#4b5563" strokeDasharray="4 4" strokeWidth={2} />
            <ReferenceLine x={avgX} stroke="#4b5563" strokeDasharray="4 4" strokeWidth={2} />

            <Scatter name="Categories" data={data} shape={<CustomizedDot />} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <CategoryLegend data={data} />
      <QuadrantLegend />
    </div>
  );
};

export default HabitIdentifierChart;
