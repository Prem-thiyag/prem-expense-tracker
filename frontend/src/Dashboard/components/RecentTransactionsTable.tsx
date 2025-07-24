// File: src/Dashboard/components/RecentTransactionsTable.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import type { RecentTransaction, Category } from '../../types'; // ✅ Import the full Category type
import { getCategoryIcon } from '../../utils/iconHelper';

// Define the shape of the props this component expects
interface RecentTransactionsTableProps {
  transactions: RecentTransaction[];
  // ✅ Now expecting the full Category object to access icon_name
  categories: Category[]; 
}

const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({ transactions, categories }) => {
  
  // ✅ This helper now finds the entire category object
  const getCategoryById = (id: number | null): Category | null => {
    if (id === null) return null;
    const category = categories.find(cat => cat.id === id);
    return category || null;
  };

  // Helper to format the currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(value);
  };
  
  // Helper to format the date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
        <Link to="/expenses" className="text-green-600 hover:underline text-sm font-medium">
          View All
        </Link>
      </div>

      <ul className="divide-y divide-gray-200">
        {transactions.length > 0 ? (
          transactions.map((tx, index) => {
            const category = getCategoryById(tx.category_id);
            const categoryName = category ? category.name : 'Uncategorized';
            
            return (
              <li key={index} className="flex justify-between items-center py-3">
                {/* Left Section: Icon and Description */}
                <div className="flex items-center space-x-4">
                  {/* ✅ --- THIS IS THE KEY CHANGE --- */}
                  {/* Pass both the name and the icon_name to the helper */}
                  {getCategoryIcon(category?.name, category?.icon_name)}
                  
                  <div>
                    <p className="font-medium text-gray-800">{tx.description}</p>
                    <p className="text-xs text-gray-500">{formatDate(tx.txn_date)}</p>
                  </div>
                </div>

                {/* Right Section: Amount and Category */}
                <div className="text-right">
                  <p className="font-bold text-gray-800">{formatCurrency(tx.amount)}</p>
                  <p className="text-xs text-gray-500">{categoryName}</p>
                </div>
              </li>
            );
          })
        ) : (
          <li className="text-center py-4 text-gray-500">No recent transactions found.</li>
        )}
      </ul>
    </div>
  );
};

export default RecentTransactionsTable;