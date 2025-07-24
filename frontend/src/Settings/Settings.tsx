// File: src/Settings/Settings.tsx

import React, { useState, useEffect } from 'react';
// ✅ Import all necessary API functions, including the new deleteMyAccount
import { getCategories, deleteCategory, getTags, getAccounts, deleteTag, deleteAccount, deleteMyAccount } from '../api/apiClient';
import type { Category, Tag, Account } from '../types';
import { availableIcons } from '../utils/iconHelper';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Import all components
import SettingsHeader from './components/SettingsHeader';
import CategorySettingsCard from './components/CategorySettingsCard';
import TagsCard from './components/TagsCard';
import AccountsCard from './components/AccountsCard';
import DataSyncCard from './components/DataSyncCard';
import CategoryModal from './components/CategoryModal';
import TagModal from './components/TagModal';
import AccountModal from './components/AccountModal';
import ConfirmModal from '../components/ui/ConfirmModal';
import ConfirmDeleteAccountModal from './components/ConfirmDeleteAccountModal';

const Settings: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // --- Modal States ---
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [tagToEdit, setTagToEdit] = useState<Tag | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number; type: 'category' | 'tag' | 'account' } | null>(null);
  const [isConfirmDeleteAccountModalOpen, setIsConfirmDeleteAccountModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      if (isLoading) setIsLoading(true);
      const [categoriesData, tagsData, accountsData] = await Promise.all([
        getCategories(), getTags(), getAccounts()
      ]);
      setCategories(categoriesData);
      setTags(tagsData);
      setAccounts(accountsData);
    } catch (err) {
      setError("Failed to load settings data. Please ensure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- Handlers ---
  const handleAddNewCategory = () => { setCategoryToEdit(null); setIsCategoryModalOpen(true); };
  const handleEditCategory = (category: Category) => { setCategoryToEdit(category); setIsCategoryModalOpen(true); };
  const handleDeleteCategory = (id: number) => { setItemToDelete({ id, type: 'category' }); setIsConfirmModalOpen(true); };
  const handleSaveCategory = () => { fetchData(); };

  const handleAddNewTag = () => { setTagToEdit(null); setIsTagModalOpen(true); };
  const handleEditTag = (tag: Tag) => { setTagToEdit(tag); setIsTagModalOpen(true); };
  const handleDeleteTag = (id: number) => { setItemToDelete({ id, type: 'tag' }); setIsConfirmModalOpen(true); };
  const handleSaveTag = () => { fetchData(); };
  
  const handleAddNewAccount = () => { setAccountToEdit(null); setIsAccountModalOpen(true); };
  const handleEditAccount = (account: Account) => { setAccountToEdit(account); setIsAccountModalOpen(true); };
  const handleDeleteAccount = (id: number) => { setItemToDelete({ id, type: 'account' }); setIsConfirmModalOpen(true); };
  const handleSaveAccount = () => { fetchData(); };

  // --- Delete Logic ---
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const toastId = toast.loading(`Deleting ${itemToDelete.type}...`);
    try {
      if (itemToDelete.type === 'category') await deleteCategory(itemToDelete.id);
      else if (itemToDelete.type === 'tag') await deleteTag(itemToDelete.id);
      else if (itemToDelete.type === 'account') await deleteAccount(itemToDelete.id);
      toast.success(`${itemToDelete.type.charAt(0).toUpperCase() + itemToDelete.type.slice(1)} deleted!`, { id: toastId });
      fetchData();
    } catch (err) {
      toast.error(`Failed to delete ${itemToDelete.type}.`, { id: toastId });
    } finally {
      setIsConfirmModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleAccountDeletion = async (password: string) => {
    const toastId = toast.loading("Deleting your account...");
    try {
      await deleteMyAccount({ password });
      toast.success("Account deleted successfully. Logging you out.", { id: toastId, duration: 4000 });
      localStorage.removeItem('accessToken');
      setTimeout(() => navigate('/login', { replace: true }), 1000);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to delete account. Incorrect password?", { id: toastId });
    } finally {
      setIsConfirmDeleteAccountModalOpen(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center font-semibold">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const usedIcons = new Set(categories.map(c => c.icon_name).filter((icon): icon is string => !!icon));
  if (categoryToEdit && categoryToEdit.icon_name) {
    usedIcons.delete(categoryToEdit.icon_name);
  }
  
  // ✅ --- FIX #1 & #2: Corrected variable name and added type annotation ---
  const iconsForPicker = availableIcons.filter((icon: string) => 
    !usedIcons.has(icon) || 
    (categoryToEdit && icon === categoryToEdit.icon_name)
  );

  return (
    <>
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        <SettingsHeader />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategorySettingsCard categories={categories} onAdd={handleAddNewCategory} onEdit={handleEditCategory} onDelete={handleDeleteCategory} />
          <TagsCard tags={tags} onAdd={handleAddNewTag} onEdit={handleEditTag} onDelete={handleDeleteTag} />
          <AccountsCard accounts={accounts} onAdd={handleAddNewAccount} onEdit={handleEditAccount} onDelete={handleDeleteAccount} />
          <DataSyncCard />
        </div>
        <div className="mt-8 p-4 border-2 border-red-500 border-dashed rounded-lg">
            <h3 className="text-lg font-bold text-red-600">Danger Zone</h3>
            <p className="text-sm text-gray-600 mt-1">Permanently delete your account and all associated data.</p>
            <button 
                onClick={() => setIsConfirmDeleteAccountModalOpen(true)}
                className="mt-4 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
            >
                Delete My Account
            </button>
        </div>
      </div>

      <CategoryModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} onSave={handleSaveCategory} categoryToEdit={categoryToEdit} availableIcons={iconsForPicker} />
      <TagModal isOpen={isTagModalOpen} onClose={() => setIsTagModalOpen(false)} onSave={handleSaveTag} tagToEdit={tagToEdit} />
      <AccountModal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} onSave={handleSaveAccount} accountToEdit={accountToEdit} />
      <ConfirmModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={handleConfirmDelete} title={`Delete ${itemToDelete?.type}`} message={`Are you sure? This cannot be undone.`} />
      
      <ConfirmDeleteAccountModal 
        isOpen={isConfirmDeleteAccountModalOpen}
        onClose={() => setIsConfirmDeleteAccountModalOpen(false)}
        onConfirm={handleAccountDeletion}
      />
    </>
  );
};

export default Settings;