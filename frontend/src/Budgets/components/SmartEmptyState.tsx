// File: src/Budgets/components/SmartEmptyState.tsx

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { BudgetEmptyStateData } from '../../types';
import { formatCurrency } from '../../utils/formatter';
import { getCategoryIcon } from '../../utils/iconHelper';

// ✅ 1. UPDATE THE PROPS INTERFACE
interface Props {
  data: BudgetEmptyStateData;
  onCreate: () => void;
  isPastMonth: boolean;
}

const SmartEmptyState: React.FC<Props> = ({ data, onCreate, isPastMonth }) => {
    return (
        <div className="space-y-6">
            <div className="text-center bg-white p-4 rounded-xl shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800">Ready to Take Control of Your Spending?</h2>
                <p className="text-gray-600 mt-1">Let's build a smart budget for this month based on your recent habits.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <h3 className="font-semibold text-lg flex items-center gap-2"><TrendingUp size={20} /> Insights From Your History</h3>
                    <p className="text-sm text-gray-500 mb-4">Based on your spending in the last 3 months.</p>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.historicalSpend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <XAxis dataKey="month" tickFormatter={(m) => new Date(m + '-02').toLocaleString('default', { month: 'short' })} />
                                <YAxis tickFormatter={(val) => `₹${val/1000}k`} />
                                <Tooltip formatter={(value: number) => [formatCurrency(value), "Total Spend"]} />
                                <Bar dataKey="totalSpend" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-center mt-2">Your average monthly spend was: <span className="font-bold">{formatCurrency(data.averageTotalSpend)}</span></p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <h3 className="font-semibold text-lg">Your Suggested Starting Plan</h3>
                    <p className="text-sm text-gray-500 mb-4">Use these as a starting point to build your budget.</p>
                    <div className="space-y-2 overflow-y-auto max-h-56 pr-2">
                        {data.suggestedBudgets.map(s => (
                            <div key={s.categoryId} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                                <div className="flex items-center gap-3">{getCategoryIcon(s.categoryName, s.icon_name)} <span>{s.categoryName}</span></div>
                                <span className="font-semibold">{formatCurrency(s.suggestedAmount)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="text-center">
                {/* ✅ 2. USE THE PROP TO DISABLE THE BUTTON */}
                <button 
                    onClick={onCreate} 
                    disabled={isPastMonth}
                    className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPastMonth ? 'Cannot Budget for Past Months' : 'Create Monthly Budget'}
                </button>
            </div>
        </div>
    );
};

export default SmartEmptyState;