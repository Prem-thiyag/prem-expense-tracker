// File: src/utils/iconHelper.tsx

import React from 'react';
// ✅ --- ADDING MANY NEW ICONS ---
import { 
    Utensils, ShoppingBag, Car, Ticket, Zap, Heart, Home, Plane, Building, 
    Leaf, PawPrint, Package, HelpCircle, Briefcase, Gift, Landmark, 
    PiggyBank, Dumbbell, Shapes, Receipt, GraduationCap, Pizza,
    Train, Bus, Clapperboard, Shirt, Gamepad2, Pill, Ambulance,
    University, Laptop, Phone, Sprout, Cat, Dog, Coffee
} from 'lucide-react';

// --- The Massively Expanded Icon Map ---
const iconRegistry: { [key: string]: { component: React.ReactElement, color: string } } = {
    // --- Standard Categories ---
    'utensils':     { component: <Utensils />,     color: 'bg-red-500' },       // Food
    'pizza':        { component: <Pizza />,         color: 'bg-orange-500' },   // Food
    'shopping-bag': { component: <ShoppingBag />,  color: 'bg-blue-500' },     // Shopping
    'shirt':        { component: <Shirt />,         color: 'bg-sky-500' },      // Shopping
    'car':          { component: <Car />,          color: 'bg-yellow-500' },   // Transport
    'train':        { component: <Train />,         color: 'bg-amber-500' },    // Transport
    'bus':          { component: <Bus />,           color: 'bg-orange-400' },   // Transport
    'ticket':       { component: <Ticket />,       color: 'bg-purple-500' },   // Entertainment
    'clapperboard': { component: <Clapperboard />, color: 'bg-violet-500' },   // Entertainment
    'gamepad-2':    { component: <Gamepad2 />,     color: 'bg-fuchsia-500' },  // Entertainment
    'zap':          { component: <Zap />,          color: 'bg-rose-500' },     // Bills
    'receipt':      { component: <Receipt />,      color: 'bg-red-400' },      // Bills
    'heart':        { component: <Heart />,        color: 'bg-pink-500' },     // Health
    'pill':         { component: <Pill />,         color: 'bg-pink-400' },     // Health
    'ambulance':    { component: <Ambulance />,    color: 'bg-red-600' },      // Health
    'graduation-cap': { component: <GraduationCap />,color: 'bg-indigo-500' }, // Education
    'university':   { component: <University />,   color: 'bg-indigo-400' },   // Education
    'home':         { component: <Home />,         color: 'bg-teal-500' },     // Rent
    'plane':        { component: <Plane />,        color: 'bg-cyan-500' },     // Travel / Transfers
    'building':     { component: <Building />,     color: 'bg-orange-600' },   // Services
    'leaf':         { component: <Leaf />,         color: 'bg-lime-500' },     // Groceries
    'sprout':       { component: <Sprout />,       color: 'bg-green-400' },    // Groceries
    'paw-print':    { component: <PawPrint />,     color: 'bg-amber-700' },    // Pets
    'cat':          { component: <Cat />,           color: 'bg-stone-500' },    // Pets
    'dog':          { component: <Dog />,           color: 'bg-yellow-800' },   // Pets
    'briefcase':    { component: <Briefcase />,    color: 'bg-sky-600' },      // Salary / Work
    'laptop':       { component: <Laptop />,       color: 'bg-gray-700' },     // Work / Tech
    'phone':        { component: <Phone />,        color: 'bg-blue-400' },     // Communication
    'gift':         { component: <Gift />,         color: 'bg-rose-400' },     // Gifts
    'dumbbell':     { component: <Dumbbell />,     color: 'bg-red-700' },      // Personal Care / Gym
    'coffee':       { component: <Coffee />,       color: 'bg-yellow-900' },   // Personal Care
    'piggy-bank':   { component: <PiggyBank />,    color: 'bg-fuchsia-600' },  // Savings
    'landmark':     { component: <Landmark />,     color: 'bg-emerald-500' },  // Investments
    'shapes':       { component: <Shapes />,       color: 'bg-slate-500' },    // Miscellaneous
    'package':      { component: <Package />,      color: 'bg-gray-500' },     // Miscellaneous
    'default':      { component: <HelpCircle />,   color: 'bg-gray-400' },
};

// This helper function renders the final icon component (no change needed)
const renderIcon = (iconKey: string): React.ReactNode => {
    const iconData = iconRegistry[iconKey] || iconRegistry['default'];
    const iconProps = { size: 20, className: 'text-white' };
    const iconComponent = React.cloneElement(iconData.component, iconProps);
    return (
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconData.color}`}>
            {iconComponent}
        </div>
    );
};

// The main exported function (no change needed)
export const getCategoryIcon = (categoryName?: string | null, iconName?: string | null): React.ReactNode => {
    if (iconName && iconRegistry[iconName]) { return renderIcon(iconName); }
    if (categoryName) {
        const lowerCategory = categoryName.toLowerCase();
        if (lowerCategory.includes('salary')) return renderIcon('briefcase');
        // ... all other fallbacks remain the same ...
        if (lowerCategory.includes('food')) return renderIcon('utensils');
        if (lowerCategory.includes('groceries')) return renderIcon('leaf');
    }
    return renderIcon('default');
};

// Export ALL available icons, the parent component will handle filtering.
export const availableIcons = Object.keys(iconRegistry).filter(key => key !== 'default');