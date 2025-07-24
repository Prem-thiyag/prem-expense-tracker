// File: src/Budgets/components/MonitoringView.tsx

import React from 'react';
import type { BudgetPlanItem, BudgetPacingPoint } from '../../types';
import { formatCurrency } from '../../utils/formatter';
import { getCategoryIcon } from '../../utils/iconHelper';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, BarChart, Bar, ReferenceLine } from "recharts";
import { Trash2, Edit } from 'lucide-react'; // Using Edit icon for clarity

interface Props {
  data: BudgetPlanItem[];
  pacingData: BudgetPacingPoint[];
  onEdit: () => void;
  onDelete: () => void;
  isPastMonth: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943', '#A1A1AA'];

const MonitoringView: React.FC<Props> = ({ data, pacingData, onEdit, onDelete, isPastMonth }) => {
    const totalBudget = data.reduce((sum, item) => sum + item.budget, 0);
    const totalSpent = data.reduce((sum, item) => sum + item.spent, 0);
    const moneyRemaining = totalBudget - totalSpent;

    const daysInMonth = pacingData.length > 0 ? pacingData.length : 30;
    const idealDailySpend = totalBudget > 0 ? totalBudget / daysInMonth : 0;
    const chartPacingData = pacingData.map(p => ({
        ...p,
        budgetPace: p.day * idealDailySpend
    }));
    
    const sortedByBudget = [...data].sort((a,b) => b.budget - a.budget);
    const topCategoriesForDonut = sortedByBudget.slice(0, 5);
    const otherBudget = sortedByBudget.slice(5).reduce((sum, item) => sum + item.budget, 0);
    const donutChartData = [...topCategoriesForDonut.map(c => ({ name: c.categoryName, value: c.budget }))];
    if (otherBudget > 0) {
        donutChartData.push({ name: 'Other', value: otherBudget });
    }

    // ✅ --- THIS IS THE FIX ---
    // 1. Filter out items that will last indefinitely or have no budget.
    // 2. Sort by which budget will deplete fastest.
    // 3. Take only the top 6-7 categories to display.
    const depletionData = [...data]
        .filter(item => item.daysLeft !== null && item.daysLeft !== undefined && item.daysLeft >= 0 && item.daysLeft < 999)
        .sort((a, b) => (a.daysLeft ?? 999) - (b.daysLeft ?? 999))
        .slice(0, 7); // Show the 7 most at-risk categories

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm">
                <h2 className="text-xl font-bold">Budget Overview</h2>
                <div className="flex items-center gap-2">
                    <button onClick={onDelete} disabled={isPastMonth} className="text-red-500 font-semibold py-2 px-3 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                        <Trash2 size={16} /> Delete Plan
                    </button>
                    <button onClick={onEdit} disabled={isPastMonth} className="bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        <Edit size={16}/> {isPastMonth ? 'Archived' : 'Edit Budget'}
                    </button>
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-md text-center">
                    <h3 className="text-sm font-semibold text-gray-500">Total Budget</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{formatCurrency(totalBudget)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md text-center">
                    <h3 className="text-sm font-semibold text-gray-500">Total Spent</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{formatCurrency(totalSpent)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md text-center">
                    <h3 className="text-sm font-semibold text-gray-500">Money Remaining</h3>
                    <p className={`text-3xl font-bold mt-2 ${moneyRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(moneyRemaining)}
                    </p>
                </div>
            </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-4 h-80 flex flex-col">
                    <h2 className="text-lg font-semibold mb-2">Budget vs. Actual Spend</h2>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartPacingData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis tickFormatter={(val) => `₹${val/1000}k`} />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                            <Line type="monotone" dataKey="actualSpend" name="Actual Spend" stroke="#EA3C53" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="budgetPace" name="Ideal Pace" stroke="#8884d8" strokeDasharray="5 5" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                 <div className="bg-white rounded-lg shadow-md p-4 h-80 flex flex-col">
                    <h2 className="text-lg font-semibold mb-2">Budget Composition</h2>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={donutChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                {donutChartData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 h-80 flex flex-col">
                    <h2 className="text-lg font-semibold mb-2">Projected Budget Depletion</h2>
                    {/* The container no longer needs to scroll */}
                    <div className="flex-grow">
                        <ResponsiveContainer width="100%" height="100%">
                            {/* ✅ The chart now uses the filtered `depletionData` */}
                            <BarChart data={depletionData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" domain={[0, 'dataMax + 10']} unit=" days"/>
                                <YAxis type="category" dataKey="categoryName" width={100} tick={{ fontSize: 12 }} interval={0} />
                                <Tooltip formatter={(value: number) => [`${value} days`, 'Projected to last']} />
                                <ReferenceLine x={daysInMonth} stroke="#f43f5e" strokeWidth={2} label={{ value: "End of Month", position: "insideTopRight", fill: '#f43f5e' }} />
                                <Bar dataKey="daysLeft" name="Days Left">
                                    {depletionData.map((entry) => (
                                        <Cell key={entry.categoryId} fill={entry.daysLeft && entry.daysLeft < daysInMonth ? "#ef4444" : "#22c55e"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                 <div className="bg-white rounded-lg shadow-md p-4 h-80 flex flex-col">
                    <h2 className="text-lg font-semibold mb-2">Full Budget Breakdown</h2>
                    <div className="flex-grow overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300">
                         {data.map(item => (
                            <div key={item.categoryId} className="py-2">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium flex items-center gap-2">{getCategoryIcon(item.categoryName, item.icon_name)} {item.categoryName}</span>
                                    <span className="font-sans">{formatCurrency(item.spent)} / {formatCurrency(item.budget)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="h-2.5 rounded-full" style={{width: `${Math.min(item.progress, 100)}%`, backgroundColor: '#55C7FF'}}></div>
                                </div>
                            </div>
                         ))}
                    </div>
                </div>
             </div>
        </div>
    );
};

export default MonitoringView;