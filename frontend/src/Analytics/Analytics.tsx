// File: src/Analytics/Analytics.tsx

import React, { useState, useEffect } from 'react';
import { getAnalyticsData } from '../api/apiClient';
import type { AnalyticsData } from '../types';

import AnalyticsHeader from "./components/AnalyticsHeader";
import SpendingVelocityChart from "./components/SpendingVelocityChart"; 
import HabitIdentifierChart from "./components/HabitIdentifierChart"; 
import TransactionHeatmap from "./components/CategorySpending"; 
import CategoryDistribution from "./components/CategoryDistribution";
import MonthlyBreakdownChart from './components/MonthlyBreakdownChart';

const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'trend' | 'month'>('month');
  // Default to a valid format for both modes initially
  const [timePeriod, setTimePeriod] = useState(new Date().toISOString().slice(0, 7)); 
  const [includeCapitalTransfers, setIncludeCapitalTransfers] = useState(false);

  useEffect(() => {
    // This effect ensures the timePeriod format is correct when switching views
    if (viewMode === 'month' && (timePeriod.endsWith('m') || timePeriod.endsWith('y') || timePeriod === 'all')) {
      setTimePeriod(new Date().toISOString().slice(0, 7));
    } else if (viewMode === 'trend' && !timePeriod.endsWith('m') && !timePeriod.endsWith('y') && timePeriod !== 'all') {
      setTimePeriod('6m');
    }
  }, [viewMode]);

  useEffect(() => {
    const fetchData = async () => {
      if (!timePeriod) return;
      setIsLoading(true);
      setError(null);
      try {
        const analyticsData = await getAnalyticsData(timePeriod, includeCapitalTransfers);
        setData(analyticsData);
      } catch (err) {
        setError("Failed to load analytics data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [timePeriod, includeCapitalTransfers]);

  if (isLoading) return <div className="p-8 text-center font-semibold">Loading Analytics...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  // Use a default object for overview to prevent crashes before data loads
  if (!data) return <div className="p-8 text-center">No data available for the selected period.</div>;

  return (
    <div className="p-6 space-y-6">
      <AnalyticsHeader 
        overview={data.overview} 
        viewMode={viewMode}
        setViewMode={setViewMode}
        timePeriod={timePeriod} 
        setTimePeriod={setTimePeriod} 
        includeCapitalTransfers={includeCapitalTransfers}
        setIncludeCapitalTransfers={setIncludeCapitalTransfers}
      />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-96">
        {/* //! THIS IS THE FIX: Use `|| []` to prevent passing null/undefined */}
        <SpendingVelocityChart 
            viewMode={viewMode} 
            velocityData={data.spendingVelocity || []}
            compositionData={data.spendingComposition || []}
            timePeriod={timePeriod}
        />
        <HabitIdentifierChart data={data.habitIdentifier || []} />
      </div>
      <div className={`grid grid-cols-1 ${viewMode === 'month' ? 'xl:grid-cols-2' : 'lg:grid-cols-2'} gap-6`}>
        {viewMode === 'month' ? (
          <TransactionHeatmap data={data.transactionHeatmap || []} timePeriod={timePeriod} />
        ) : (
          <MonthlyBreakdownChart data={data.monthlyBreakdown || []} />
        )}
        <CategoryDistribution data={data.categoryDistribution || []} />
      </div>
    </div>
  );
};
export default Analytics;