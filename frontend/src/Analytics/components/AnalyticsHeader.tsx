// File: src/Analytics/components/AnalyticsHeader.tsx
import React from 'react';
import type { AnalyticsOverview } from '../../types';
import { ChevronLeft, ChevronRight, TrendingUp, BarChart } from 'lucide-react';
import { formatCurrency } from '../../utils/formatter';

interface AnalyticsHeaderProps {
  overview: AnalyticsOverview;
  viewMode: 'trend' | 'month';
  setViewMode: (mode: 'trend' | 'month') => void;
  timePeriod: string;
  setTimePeriod: (period: string) => void;
  includeCapitalTransfers: boolean;
  setIncludeCapitalTransfers: (value: boolean) => void;
}

const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({ 
  overview, viewMode, setViewMode, timePeriod, setTimePeriod, 
  includeCapitalTransfers, setIncludeCapitalTransfers
}) => {
  const handleMonthChange = (direction: 'prev' | 'next') => {
    const date = new Date(`${timePeriod}-15T12:00:00Z`);
    if (direction === 'prev') { date.setMonth(date.getMonth() - 1); } 
    else { date.setMonth(date.getMonth() + 1); }
    setTimePeriod(date.toISOString().slice(0, 7));
  };

  const formatMonth = (monthStr: string) => {
    const date = new Date(`${monthStr}-15`);
    return date.toLocaleString('default', { month: 'short' });
  };

  return (
    <div className="flex flex-col bg-white p-4 rounded-xl shadow-sm gap-4">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
        <h2 className="font-semibold text-lg whitespace-nowrap">Analytics Overview</h2>
        
        {/* Filter Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Include Capital Transfers</label>
              <button
                  role="switch"
                  aria-checked={includeCapitalTransfers}
                  onClick={() => setIncludeCapitalTransfers(!includeCapitalTransfers)}
                  className={`${includeCapitalTransfers ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
              >
                  <span className={`${includeCapitalTransfers ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}/>
              </button>
          </div>
          <div className="flex rounded-md bg-gray-100 p-1">
            <button onClick={() => setViewMode('trend')} className={`px-3 py-1 text-sm font-semibold rounded ${viewMode === 'trend' ? 'bg-white shadow' : 'text-gray-600'}`}>Trend</button>
            <button onClick={() => setViewMode('month')} className={`px-3 py-1 text-sm font-semibold rounded ${viewMode === 'month' ? 'bg-white shadow' : 'text-gray-600'}`}>Month</button>
          </div>
          {viewMode === 'trend' ? (
            <select value={timePeriod} onChange={e => setTimePeriod(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white">
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">This Year</option>
              <option value="all">All Time</option>
            </select>
          ) : (
            <div className="flex items-center space-x-2 border rounded-md p-1">
              <button onClick={() => handleMonthChange('prev')} className="p-1 rounded-md hover:bg-gray-100"><ChevronLeft size={20}/></button>
              <span className="text-sm font-semibold w-28 text-center">
                {new Date(timePeriod + '-15').toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={() => handleMonthChange('next')} className="p-1 rounded-md hover:bg-gray-100"><ChevronRight size={20}/></button>
            </div>
          )}
        </div>
      </div>

      {/* //! THIS IS THE NEW KPI SECTION */}
      <div className="border-t border-gray-200 mt-2 pt-4 flex justify-center items-center gap-8 text-center">
        <div>
          <p className="text-sm text-gray-500 font-medium flex items-center gap-2"><BarChart size={16}/> Highest Spend</p>
          <p className="text-xl font-bold text-gray-800 mt-1">
            {overview.highestSpendMonth 
              ? `${formatMonth(overview.highestSpendMonth.month)} (${formatCurrency(overview.highestSpendMonth.actual)})`
              : 'N/A'
            }
          </p>
        </div>
        <div className="border-l h-10 border-gray-200"></div>
        <div>
          <p className="text-sm text-gray-500 font-medium flex items-center gap-2"><TrendingUp size={16}/> Average Spend/Month</p>
          <p className="text-xl font-bold text-gray-800 mt-1">
            {formatCurrency(overview.averageSpendPerMonth)}
          </p>
        </div>
      </div>
    </div>
  );
};
export default AnalyticsHeader;