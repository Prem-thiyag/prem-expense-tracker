// File: src/Settings/components/AccountsCard.tsx

import React from 'react';
import { Pencil, Trash2, Landmark, Wallet, PlusCircle } from "lucide-react";
import type { Account } from '../../types';

// ✅ --- THIS IS THE FIX: Update the props interface ---
interface AccountsCardProps {
    accounts: Account[];
    onAdd: () => void;
    onEdit: (account: Account) => void;
    onDelete: (accountId: number) => void;
}

const getAccountIcon = (type: string) => {
    if (type.toLowerCase().includes('bank')) {
        return <Landmark size={20} className="text-gray-500" />;
    }
    return <Wallet size={20} className="text-gray-500" />;
};

const AccountsCard: React.FC<AccountsCardProps> = ({ accounts = [], onAdd, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex flex-col h-80">
      <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Accounts</h2>
          {/* ✅ Connect the onAdd handler */}
          <button onClick={onAdd} className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800">
            <PlusCircle size={16} /> Add New
          </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {accounts.length > 0 ? (
          accounts.map((account) => (
            <div
              key={account.id}
              className="flex justify-between items-center bg-gray-50 rounded-md px-4 py-2"
            >
              <div className="flex items-center gap-3">
                {getAccountIcon(account.type)}
                <div>
                  <p className="text-sm font-medium text-gray-800">{account.name}</p>
                  <p className="text-xs text-gray-500">{account.provider}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onEdit(account)} className="p-1 text-gray-500 hover:text-blue-600">
                  <Pencil size={16} />
                </button>
                {/* ✅ Connect the onDelete handler */}
                <button onClick={() => onDelete(account.id)} className="p-1 text-gray-500 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 mt-4">No accounts found.</p>
        )}
      </div>
    </div>
  );
}

export default AccountsCard;