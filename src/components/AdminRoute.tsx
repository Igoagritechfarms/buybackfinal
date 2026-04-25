import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Redirects non-admins to /admin login page.
 */
export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAdmin, loading, checkingRole } = useAdminAuth();

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-lime-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};
