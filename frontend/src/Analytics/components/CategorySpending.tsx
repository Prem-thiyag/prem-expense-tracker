// File: src/Analytics/components/CategorySpending.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ 1. Import useNavigate
import type { TransactionHeatmapPoint } from '../../types';
import { formatCurrency } from '../../utils/formatter';

interface Props {
  data: TransactionHeatmapPoint[];
  timePeriod: string; 
}

const TransactionHeatmap: React.FC<Props> = ({ data = [], timePeriod }) => {
    const navigate = useNavigate(); // ✅ 2. Initialize navigate function

    // ✅ 3. Handler to navigate to the expenses page with the date
    const handleDayClick = (dateStr: string) => {
        if (!dateStr) return;
        navigate('/expenses', { state: { filterDate: dateStr } });
    };

    const year = parseInt(timePeriod.substring(0, 4));
    const month = parseInt(timePeriod.substring(5, 7)) - 1;

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    const numDays = endDate.getDate();
    const startDayOfWeek = startDate.getDay();

    const calendarDays = [];
    for (let i = 0; i < startDayOfWeek; i++) {
        calendarDays.push({ key: `empty-${i}`, isEmpty: true });
    }
    for (let day = 1; day <= numDays; day++) {
        const dateStr = `${timePeriod}-${String(day).padStart(2, '0')}`;
        const dayData = data.find(d => d.date === dateStr);
        calendarDays.push({
            key: `day-${day}`,
            day,
            date: dateStr,
            spend: dayData ? dayData.spend : 0,
            isEmpty: false,
        });
    }

    const maxSpend = data.length > 0 ? Math.max(...data.map(d => d.spend)) : 0;
    const getColor = (spend: number) => {
        if (spend <= 0) return 'bg-gray-100 hover:bg-gray-200';
        const intensity = Math.min(spend / (maxSpend * 0.75), 1);
        if (intensity < 0.2) return 'bg-blue-100 hover:bg-blue-200';
        if (intensity < 0.4) return 'bg-blue-200 hover:bg-blue-300';
        if (intensity < 0.6) return 'bg-blue-300 hover:bg-blue-400';
        if (intensity < 0.8) return 'bg-blue-400 hover:bg-blue-500';
        return 'bg-blue-500 hover:bg-blue-600';
    };
    
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm h-80 flex flex-col">
            <h3 className="font-semibold text-gray-800 mb-2">Spending Calendar</h3>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-500">
                {weekDays.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 flex-grow mt-1">
                {calendarDays.map(dayInfo => {
                    if (dayInfo.isEmpty) {
                        return <div key={dayInfo.key} className="rounded-md" />;
                    }
                    const spendAmount = dayInfo.spend || 0;
                    const color = getColor(spendAmount);
                    const textColor = spendAmount > maxSpend * 0.6 ? 'text-white' : 'text-gray-700';

                    return (
                        // ✅ 4. Use a <button> and attach the onClick handler
                        <button 
                            key={dayInfo.key}
                            className={`p-1 rounded-md flex items-center justify-center transition-colors duration-150 w-full h-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 ${color}`}
                            title={`Spent: ${formatCurrency(spendAmount)}`}
                            onClick={() => handleDayClick(dayInfo.date as string)}
                        >
                            <span className={`font-semibold text-sm ${textColor}`}>{dayInfo.day}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default TransactionHeatmap;