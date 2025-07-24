// File: src/Dashboard/Dashboard.tsx

import React, { useState, useEffect } from 'react';
// We still need getCategories for the RecentTransactionsTable
import { getDashboardData, getCategories } from '../api/apiClient'; 
import type { DashboardData, Category } from '../types';

// Import all the real dashboard components
import KPICards from './components/KPICards';
import MonthFilter from './components/MonthFilter';
import TopSpendCategoriesChart from './components/TopSpendCategoriesChart';
import RecentTransactionsTable from './components/RecentTransactionsTable';
import SpendingTrendChart from './components/SpendingTrendChart'; 

const Dashboard: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [data, setData] = useState<DashboardData | null>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState('2025-07');

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [dashboardData, categoriesData] = await Promise.all([
          getDashboardData(currentMonth),
          getCategories()
        ]);
        
        console.log("✅ Dashboard Data received:", dashboardData);
        setData(dashboardData);
        setAllCategories(categoriesData);

      } catch (err) {
        console.error("❌ Failed to fetch data:", err);
        setError("Could not load dashboard data. Please ensure the backend is running and try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [currentMonth]);

  // --- RENDER LOGIC ---
  if (isLoading) return <div className="p-8 text-center font-semibold">Loading Dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-500 bg-red-100 rounded-md">{error}</div>;
  if (!data) return <div className="p-8 text-center">No data available for the selected month.</div>;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <MonthFilter currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />
        <h1 className="hidden md:block text-2xl font-bold text-gray-800">Expense Tracker</h1>
        <div className="w-48"></div>
      </div>

      <KPICards
        totalSpent={data.totalSpent}
        dailyAverage={data.dailyAverageSpend}
        projectedSpend={data.projectedMonthlySpend}
        percentChange={data.percentChangeFromLastMonth}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-64">
        <SpendingTrendChart data={data.spendingTrend} />
        {/* ✅ Pass the currentMonth prop to the chart */}
        <TopSpendCategoriesChart data={data.topSpendingCategories} currentMonth={currentMonth} />
      </div>

      <RecentTransactionsTable 
        transactions={data.recentTransactions} 
        categories={allCategories}
      />
      
    </div>
  );
};

export default Dashboard;