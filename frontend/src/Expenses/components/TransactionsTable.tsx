// File: src/Expenses/components/TransactionsTable.tsx

import React from 'react';
import TransactionItem from "./TransactionItem";
import { PlusCircle } from "lucide-react";
import type { Transaction, Category, Tag } from '../../types'; // Adjusted path if needed

interface TransactionsTableProps {
  transactions: Transaction[];
  totalCount: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  limit: number;
  isLoading: boolean;
  error: string | null;
  allCategories: Category[];
  allTags: Tag[]; // ✅ Accept 'allTags' prop
  onAdd: () => void;
  onDelete: (id: number) => void;
  onEdit: (transaction: Transaction) => void;
  onUpdate: () => void;
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions, totalCount, currentPage, setCurrentPage, limit, isLoading,
  error, allCategories, allTags, onAdd, onDelete, onEdit, onUpdate
}) => {
  const totalPages = Math.ceil(totalCount / limit);
  const startItem = totalCount > 0 ? (currentPage - 1) * limit + 1 : 0;
  const endItem = Math.min(currentPage * limit, totalCount);

  return (
    <div className="bg-white border rounded-xl p-4 space-y-4 shadow-sm flex flex-col flex-grow">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-md">Transactions Table</h2>
        <button onClick={onAdd} className="flex items-center bg-black text-white px-3 py-1.5 rounded-full text-sm hover:bg-gray-800">
          <PlusCircle size={16} className="mr-1" /> Add Transaction
        </button>
      </div>

      <div className="flex-grow flex flex-col">
        {isLoading && <div className="m-auto text-center p-8 font-semibold">Loading...</div>}
        {error && <div className="m-auto text-center p-8 text-red-500 bg-red-50">{error}</div>}

        {!isLoading && !error && (
          <>
            <div className="space-y-2 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300">
              {transactions.length > 0 ? (
                transactions.map((txn) => (
                  <TransactionItem 
                    key={txn.id} 
                    transaction={txn} 
                    categories={allCategories} 
                    allTags={allTags} // ✅ Pass 'allTags' down to each item
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onUpdate={onUpdate}
                  />
                ))
              ) : (
                <div className="text-center p-8 text-gray-500">No transactions found for the selected filters.</div>
              )}
            </div>
          </>
        )}
      </div>

      {!isLoading && !error && totalCount > 0 && (
        <div className="flex justify-between items-center text-sm text-gray-600 pt-2">
          <span>Showing {startItem} to {endItem} of {totalCount} Transactions</span>
          <div className="flex justify-end items-center space-x-2">
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1 rounded hover:bg-gray-200 disabled:opacity-50">First</button>
            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded hover:bg-gray-200 disabled:opacity-50">Previous</button>
            <span className="px-2 font-semibold">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 rounded hover:bg-gray-200 disabled:opacity-50">Next</button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1 rounded hover:bg-gray-200 disabled:opacity-50">Last</button>
          </div>
        </div>
      )}
    </div>
  );
}
export default TransactionsTable;