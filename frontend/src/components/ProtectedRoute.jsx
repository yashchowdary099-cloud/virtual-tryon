import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <div className="w-8 h-8 border-4 border-[#1A1817] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    // Redirect to /login while preserving intended location and state (e.g. product)
    return <Navigate to="/login" state={{ from: location.pathname, product: location.state?.product }} replace />;
  }

  return children;
}
