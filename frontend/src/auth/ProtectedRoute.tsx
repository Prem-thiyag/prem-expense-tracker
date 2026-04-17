// File: src/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// Checks both storages: localStorage for "Remember Me" sessions, sessionStorage for tab sessions
const isAuthenticated = (): boolean => {
    return !!(localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken'));
};

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const location = useLocation();

    if (!isAuthenticated()) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
