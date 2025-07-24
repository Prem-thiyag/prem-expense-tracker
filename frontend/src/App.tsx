// File: src/App.tsx

import React, { lazy, Suspense } from 'react'; // ✅ 1. Import lazy and Suspense
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Core components that are needed immediately
import Navbar from './components/Navbar';
import ProtectedRoute from './auth/ProtectedRoute';

// ✅ 2. Change all page-level components to be lazy-loaded
// This tells React to fetch the code for these pages only when they are needed.
const Dashboard = lazy(() => import('./Dashboard/Dashboard'));
const Budgets = lazy(() => import('./Budgets/Budgets'));
const Expenses = lazy(() => import('./Expenses/Expenses'));
const Analytics = lazy(() => import('./Analytics/Analytics'));
const Settings = lazy(() => import('./Settings/Settings'));
const LoginPage = lazy(() => import('./auth/LoginPage'));
const RegisterPage = lazy(() => import('./auth/RegisterPage'));
const ProfilePage = lazy(() => import('./Profile/ProfilePage'));

// A simple loading component to show as a fallback while pages are being fetched.
const PageLoader: React.FC = () => (
  <div className="flex justify-center items-center h-screen bg-gray-50">
    <div className="font-semibold text-lg text-gray-700">Loading Page...</div>
  </div>
);

// The MainLayout component remains the same.
const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <>
      <Toaster 
        position="top-center" 
        toastOptions={{
          duration: 3500,
        }}
      />
      <BrowserRouter>
        {/* ✅ 3. Wrap your entire <Routes> component in a <Suspense> boundary. */}
        {/* This tells React what to render (the PageLoader) while it's waiting for a lazy component to load. */}
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} /> 

            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="budgets" element={<Budgets />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            
            {/* A fallback route to redirect any unknown paths to the dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
}

export default App;