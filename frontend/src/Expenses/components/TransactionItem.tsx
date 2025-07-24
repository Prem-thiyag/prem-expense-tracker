// File: src/Expenses/components/TransactionItem.tsx

import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import { Edit2, Trash2, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import type { Transaction, Category, Tag } from '../../types';
import { getCategoryIcon } from '../../utils/iconHelper';
import { updateTransaction } from '../../api/apiClient';
import toast from 'react-hot-toast';
import { formatDate, formatCurrency } from '../../utils/formatter';

interface TransactionItemProps {
  transaction: Transaction;
  categories: Category[];
  allTags: Tag[];
  onDelete: (id: number) => void;
  onEdit: (transaction: Transaction) => void;
  onUpdate: () => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, categories, allTags, onDelete, onEdit, onUpdate }) => {
  const category = categories.find(c => c.id === transaction.category_id);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(transaction.category_id);
  
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
    transaction.tags ? transaction.tags.map(t => t.id) : []
  );

  const tagOptions = useMemo(() => allTags.map(tag => ({ value: tag.id, label: tag.name })), [allTags]);
  
  const originalTagIdsJSON = useMemo(() => JSON.stringify((transaction.tags ? transaction.tags.map(t => t.id) : []).sort()), [transaction.tags]);

  // ✅ --- THIS IS THE FIX ---
  // This effect synchronizes the internal state with the props.
  // When the parent component refetches data, the `transaction` prop changes.
  // This hook sees that `transaction.tags` has changed and updates the
  // `selectedTagIds` state to match, which makes the UI show the correct tags.
  useEffect(() => {
    setSelectedTagIds(transaction.tags ? transaction.tags.map(t => t.id) : []);
  }, [transaction.tags]);


  // This effect handles CATEGORY updates (no changes needed here).
  useEffect(() => {
    if (selectedCategoryId === transaction.category_id) return;
    const handleCategoryUpdate = async () => {
        if (selectedCategoryId === undefined) return;
        const toastId = toast.loading("Updating category...");
        try {
            await updateTransaction(transaction.id, { category_id: selectedCategoryId });
            toast.success("Category updated!", { id: toastId });
            onUpdate();
        } catch (error) {
            toast.error("Failed to update category.", { id: toastId });
            setSelectedCategoryId(transaction.category_id);
        }
    };
    handleCategoryUpdate();
  }, [selectedCategoryId]);

  // This effect handles sending TAG updates to the backend.
  useEffect(() => {
    const haveTagsChanged = JSON.stringify(selectedTagIds.sort()) !== originalTagIdsJSON;
    if (!haveTagsChanged) return;

    const handleTagUpdate = async () => {
        const toastId = toast.loading("Updating tags...");
        try {
            await updateTransaction(transaction.id, { tag_ids: selectedTagIds });
            toast.success("Tags updated!", { id: toastId });
            onUpdate();
        } catch (error) {
            toast.error("Failed to update tags.", { id: toastId });
            setSelectedTagIds(JSON.parse(originalTagIdsJSON));
        }
    };
    
    const timerId = setTimeout(handleTagUpdate, 500); 
    return () => clearTimeout(timerId);

  }, [selectedTagIds, originalTagIdsJSON, transaction.id, onUpdate]);

  return (
    <div className="flex justify-between items-center bg-white border rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        {getCategoryIcon(category?.name, category?.icon_name)}
        <div>
          <p className="font-medium text-gray-800">{transaction.description}</p>
          <p className="text-sm text-gray-500">{formatDate(transaction.txn_date)}</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="w-48">
            <Select
                isMulti
                options={tagOptions}
                value={tagOptions.filter(option => selectedTagIds.includes(option.value))}
                onChange={(selectedOptions) => {
                    setSelectedTagIds(selectedOptions.map(option => option.value));
                }}
                className="text-xs"
                classNamePrefix="select"
                placeholder="Choose tag(s)..."
            />
        </div>

        <select 
            value={selectedCategoryId ?? ''} 
            onChange={(e) => setSelectedCategoryId(Number(e.target.value) || null)}
            className="bg-gray-100 text-xs px-2 py-1 rounded-full border-transparent focus:ring-2 focus:ring-blue-500 w-32"
        >
            <option value="">Uncategorized</option>
            {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
        </select>
        
        <div className="flex items-center gap-2 w-28 justify-end">
          {transaction.type === 'debit' ? (
            <>
              <ArrowUpCircle size={16} className="text-red-500" />
              <span className="font-semibold text-gray-800">
                {formatCurrency(transaction.amount)}
              </span>
            </>
          ) : (
            <>
              <ArrowDownCircle size={16} className="text-green-500" />
              <span className="font-semibold text-green-600">
                {formatCurrency(transaction.amount)}
              </span>
            </>
          )}
        </div>
        <button onClick={() => onEdit(transaction)} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 size={16} /></button>
        <button onClick={() => onDelete(transaction.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
      </div>
    </div>
  );
}
export default TransactionItem;