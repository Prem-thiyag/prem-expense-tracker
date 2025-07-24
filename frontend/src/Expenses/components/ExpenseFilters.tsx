// File: src/Expenses/components/ExpenseFilters.tsx

import React from 'react';
import type { Category, Account } from '../../types';

interface ExpenseFiltersProps {
  onApplyFilters: () => void;
  onResetFilters: () => void; // Add the new reset prop
  allCategories: Category[];
  allAccounts: Account[];
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  accountId: string;
  setAccountId: (value: string) => void;
  categoryId: string;
  setCategoryId: (value: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  type: string;
  setType: (value: string) => void;
}

const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({ 
    onApplyFilters, onResetFilters, // Use the new reset prop
    allCategories, allAccounts,
    startDate, setStartDate, endDate, setEndDate,
    accountId, setAccountId, categoryId, setCategoryId,
    searchTerm, setSearchTerm, type, setType
}) => {
  // The component is now fully controlled by the parent.
  // The handlers just call the functions passed in as props.

  return (
    <div className="bg-white border rounded-xl p-4 space-y-4 shadow-sm">
      <h2 className="font-bold text-lg">Filters</h2>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-700">Date From</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full mt-1 border rounded-md px-2 py-1.5 text-sm" />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-700">Date To</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full mt-1 border rounded-md px-2 py-1.5 text-sm" />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-700">Account</label>
          <select value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full mt-1 border rounded-md px-2 py-1.5 text-sm bg-white">
            <option value="">All Accounts</option>
            {allAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-700">Category</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full mt-1 border rounded-md px-2 py-1.5 text-sm bg-white">
            <option value="">All Categories</option>
            {allCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
        <div className="md:col-span-1">
          <label className="text-sm font-medium text-gray-700">Type</label>
          <select value={type} onChange={e => setType(e.target.value)} className="w-full mt-1 border rounded-md px-2 py-1.5 text-sm bg-white">
            <option value="">All</option>
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
          </select>
        </div>
        <div className="md:col-span-3">
          <label className="text-sm font-medium text-gray-700">Search</label>
          <div className="flex mt-1">
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search..." className="border rounded-l-md px-2 py-1.5 w-full text-sm" />
            {/* ✅ These buttons now correctly call their respective parent handlers */}
            <button onClick={onResetFilters} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 rounded-r-md border-y border-r font-semibold">Reset</button>
            <button onClick={onApplyFilters} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md ml-2 font-semibold">Apply</button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ExpenseFilters;