// File: src/Dashboard/components/MonthFilter.tsx

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Step 1: Define the shape of the props the component expects from its parent.
// - currentMonth: The month to display (e.g., "2025-07")
// - setCurrentMonth: The function to call when the user clicks a button
interface MonthFilterProps {
  currentMonth: string;
  setCurrentMonth: (newMonth: string) => void;
}

const MonthFilter: React.FC<MonthFilterProps> = ({ currentMonth, setCurrentMonth }) => {
  // The component no longer has its own useState. It receives state from its parent.

  // Helper function to format the "YYYY-MM" string into "Month Year" for display
  const formatDisplayDate = (monthString: string): string => {
    // We create a date object ensuring it's parsed as UTC to avoid timezone issues
    const date = new Date(`${monthString}-01T12:00:00Z`);
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  };

  const handlePrevMonth = () => {
    const date = new Date(`${currentMonth}-01T12:00:00Z`);
    // Go to the previous month
    date.setMonth(date.getMonth() - 1);
    // Format the new date back to "YYYY-MM" and call the parent's state update function
    setCurrentMonth(date.toISOString().slice(0, 7));
  };

  const handleNextMonth = () => {
    const date = new Date(`${currentMonth}-01T12:00:00Z`);
    // Go to the next month
    date.setMonth(date.getMonth() + 1);
    // Format the new date back to "YYYY-MM" and call the parent's state update function
    setCurrentMonth(date.toISOString().slice(0, 7));
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handlePrevMonth}
        className="p-2 rounded-md bg-gray-100 hover:bg-gray-200"
      >
        <ChevronLeft />
      </button>
      <span className="text-lg font-semibold w-36 text-center">
        {formatDisplayDate(currentMonth)}
      </span>
      <button
        onClick={handleNextMonth}
        className="p-2 rounded-md bg-gray-100 hover:bg-gray-200"
      >
        <ChevronRight />
      </button>
    </div>
  );
};

export default MonthFilter;