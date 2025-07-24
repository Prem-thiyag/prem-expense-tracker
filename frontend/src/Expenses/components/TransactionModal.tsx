// File: src/Expenses/components/TransactionModal.tsx

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Modal from '../../components/ui/Modal';
import { createTransaction, updateTransaction } from '../../api/apiClient';
import type { Transaction, Category, Account, Tag } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  transactionToEdit: Transaction | null;
  categories: Category[];
  accounts: Account[];
  allTags: Tag[];
}

const TransactionModal: React.FC<Props> = ({ isOpen, onClose, onSave, transactionToEdit, categories, accounts, allTags }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [txnDate, setTxnDate] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [accountId, setAccountId] = useState<number | ''>('');
  const [type, setType] = useState<'debit' | 'credit'>('debit');
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditMode = !!transactionToEdit;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && transactionToEdit) {
        setDescription(transactionToEdit.description);
        setAmount(transactionToEdit.amount);
        setTxnDate(transactionToEdit.txn_date.substring(0, 10));
        setCategoryId(transactionToEdit.category_id ?? '');
        setAccountId(transactionToEdit.account_id);
        setType(transactionToEdit.type);
        setSelectedTagIds(transactionToEdit.tags ? transactionToEdit.tags.map(t => t.id) : []);
      } else {
        setDescription('');
        setAmount('');
        const today = new Date();
        today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
        setTxnDate(today.toISOString().split('T')[0]);
        setCategoryId('');
        setAccountId(accounts[0]?.id || '');
        setType('debit');
        setSelectedTagIds([]);
      }
      setError(null);
    }
  }, [transactionToEdit, isOpen, isEditMode, accounts]);
  
  const tagOptions = allTags.map(tag => ({ value: tag.id, label: tag.name }));

  const handleSave = async () => {
    if (!description || amount === '' || !txnDate || !accountId) { setError('Please fill out all required fields.'); return; }
    const toastId = toast.loading(isEditMode ? "Updating..." : "Creating...");
    try {
      setIsSaving(true);
      setError(null);
      
      const payload = {
        description,
        amount: Number(amount),
        txn_date: new Date(txnDate).toISOString(),
        category_id: categoryId === '' ? null : Number(categoryId),
        account_id: Number(accountId),
        type,
        source: 'Manual',
        tag_ids: selectedTagIds,
      };

      if (isEditMode && transactionToEdit) {
        await updateTransaction(transactionToEdit.id, payload);
        toast.success("Transaction updated!", { id: toastId });
      } else {
        await createTransaction(payload as any);
        toast.success("Transaction created!", { id: toastId });
      }
      onSave();
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "An error occurred.";
      toast.error(errorMessage, { id: toastId });
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Edit Transaction" : "Add New Transaction"}>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Description</label>
          <input value={description} onChange={e => setDescription(e.target.value)} className="mt-1 w-full border rounded p-2" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Amount (₹)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))} className="mt-1 w-full border rounded p-2" />
          </div>
          <div>
            <label className="text-sm font-medium">Type</label>
            <select value={type} onChange={e => setType(e.target.value as 'debit' | 'credit')} className="mt-1 w-full border rounded p-2 bg-white">
              <option value="debit">Expense (Debit)</option>
              <option value="credit">Income (Credit)</option>
            </select>
          </div>
        </div>
        <div>
            <label className="text-sm font-medium">Date</label>
            <input type="date" value={txnDate} onChange={e => setTxnDate(e.target.value)} className="mt-1 w-full border rounded p-2" />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-sm font-medium">Category</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 w-full border rounded p-2 bg-white">
                    <option value="">Uncategorized</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
            </div>
            <div>
                <label className="text-sm font-medium">Account</label>
                <select value={accountId} onChange={e => setAccountId(Number(e.target.value))} className="mt-1 w-full border rounded p-2 bg-white">
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
            </div>
        </div>
        <div>
            <label className="text-sm font-medium">Tags</label>
            <Select
                isMulti
                options={tagOptions}
                value={tagOptions.filter(option => selectedTagIds.includes(option.value))}
                onChange={(selectedOptions) => { setSelectedTagIds(selectedOptions.map(option => option.value)); }}
                className="mt-1"
                classNamePrefix="select"
            />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex justify-end space-x-2 pt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-md">
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TransactionModal;