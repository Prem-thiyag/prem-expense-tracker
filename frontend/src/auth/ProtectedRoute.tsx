// File: src/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// This function now checks sessionStorage
const isAuthenticated = (): boolean => {
    const token = sessionStorage.getItem('accessToken');
    return !!token;
};

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const location = useLocation();

    if (!isAuthenticated()) {
        // If the user is not authenticated, redirect them to the /login page
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If the user is authenticated, render the children (the MainLayout)
    return <>{children}</>;
};

export default ProtectedRoute;