// File: src/Dashboard/Dashboard.tsx

import React, { useState, useEffect } from 'react';
import { getDashboardData, getCategories } from '../api/apiClient'; 
import type { DashboardData, Category } from '../types';

import KPICards from './components/KPICards';
import MonthFilter from './components/MonthFilter';
import TopSpendCategoriesChart from './components/TopSpendCategoriesChart';
import RecentTransactionsTable from './components/RecentTransactionsTable';
import SpendingTrendChart from './components/SpendingTrendChart'; 

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ --- THIS IS THE FIX for the default month ---
  // It now dynamically gets the current month in 'YYYY-MM' format instead of being hardcoded.
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));

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