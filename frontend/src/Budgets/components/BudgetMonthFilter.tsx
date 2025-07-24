// File: src/Budgets/components/BudgetMonthFilter.tsx

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BudgetMonthFilterProps {
  currentMonth: string;
  setCurrentMonth: (newMonth: string) => void;
}

const BudgetMonthFilter: React.FC<BudgetMonthFilterProps> = ({ currentMonth, setCurrentMonth }) => {
  const formatDisplayDate = (monthString: string): string => {
    const date = new Date(`${monthString}-01T12:00:00Z`);
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  };

  const handlePrevMonth = () => {
    const date = new Date(`${currentMonth}-01T12:00:00Z`);
    date.setMonth(date.getMonth() - 1);
    setCurrentMonth(date.toISOString().slice(0, 7));
  };

  const handleNextMonth = () => {
    const date = new Date(`${currentMonth}-01T12:00:00Z`);
    date.setMonth(date.getMonth() + 1);
    setCurrentMonth(date.toISOString().slice(0, 7));
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white py-4 rounded-xl shadow-sm border px-6">
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-6 text-xl font-semibold text-gray-800">
          <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-gray-100"><ChevronLeft className="w-6 h-6" /></button>
          <span>{formatDisplayDate(currentMonth)}</span>
          <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-gray-100"><ChevronRight className="w-6 h-6" /></button>
        </div>
        <p className="text-sm text-gray-500">Budget Planning Period</p>
      </div>
    </div>
  );
};

export default BudgetMonthFilter;