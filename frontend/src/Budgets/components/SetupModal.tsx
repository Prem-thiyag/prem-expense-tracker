// File: src/Budgets/components/SetupModal.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LargeModal from '../../components/ui/LargeModal'; 
import TotalBudgetCard from './TotalBudgetCard';
import CategoryBudgetCard from './CategoryBudgetCard';
import type { BudgetPlanItem } from '../../types';
import { formatCurrency } from '../../utils/formatter';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: BudgetPlanItem[]) => void;
  initialData: BudgetPlanItem[];
  month: string;
}

const SetupModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialData, month }) => {
    const [plan, setPlan] = useState<BudgetPlanItem[]>([]);
    const [totalTargetBudget, setTotalTargetBudget] = useState<number | null>(null);
    const [isLocked, setIsLocked] = useState(true);

    // ✅ --- THIS IS THE FIX for the scrolling bug ---
    // This effect now ONLY depends on `isOpen`. It runs ONLY when the modal opens.
    useEffect(() => {
        if (isOpen) {
            setPlan(initialData);
            const initialTotal = initialData.reduce((sum, item) => sum + item.budget, 0);
            setTotalTargetBudget(initialTotal > 0 ? initialTotal : null);
            setIsLocked(initialTotal > 0); 
        }
    }, [isOpen]);

    const handleBudgetChange = (categoryId: number, newBudget: number) => {
        setPlan(currentPlan => currentPlan.map(item => item.categoryId === categoryId ? { ...item, budget: newBudget } : item));
    };

    const handleSave = () => {
        onSave(plan);
    };

    const totalBudgetFromCategories = plan.reduce((sum, item) => sum + item.budget, 0);

    return (
        <LargeModal isOpen={isOpen} onClose={onClose} title={`Budget for ${new Date(month + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}`}>
            <div className="space-y-4">
                <TotalBudgetCard 
                    totalBudget={isLocked ? totalBudgetFromCategories : (totalTargetBudget ?? 0)}
                    onTotalBudgetChange={setTotalTargetBudget}
                    isLocked={isLocked}
                    onToggleLock={() => setIsLocked(!isLocked)}
                />
                {!isLocked && totalTargetBudget !== null && (
                    <div className="text-center text-sm">
                        Target: <span className="font-bold">{formatCurrency(totalTargetBudget)}</span> / 
                        Allocated: <span className="font-bold">{formatCurrency(totalBudgetFromCategories)}</span>
                        <span className={totalBudgetFromCategories - totalTargetBudget !== 0 ? 'text-red-500' : 'text-green-500'}>
                            {' '}(Difference: {formatCurrency(totalBudgetFromCategories - totalTargetBudget)})
                        </span>
                    </div>
                )}
                <div className="flex justify-between items-center border-t pt-4">
                    <h3 className="font-semibold text-lg">Category Budgets</h3>
                    <Link to="/settings" className="text-sm font-medium text-blue-600 hover:underline">
                        + Add New Category in Settings
                    </Link>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg space-y-2 max-h-[45vh] overflow-y-auto pr-2">
                    {plan.map(item => <CategoryBudgetCard key={item.categoryId} item={item} onBudgetChange={handleBudgetChange} />)}
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save All Changes</button>
                </div>
            </div>
        </LargeModal>
    );
};

export default SetupModal;