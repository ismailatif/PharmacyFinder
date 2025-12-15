import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')] opacity-5 dark:opacity-5"></div>
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-900 border-t-emerald-500 rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (isAuthenticated) {
        // If user is already logged in, redirect to the main app area (e.g. search)
        return <Navigate to="/search" replace />;
    }

    return children;
};

export default PublicRoute;
