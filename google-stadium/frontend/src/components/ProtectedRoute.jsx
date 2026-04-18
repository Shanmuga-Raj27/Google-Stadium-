import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { token, user } = useAuthStore();
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on role if they try accessing another dashboard
    if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (user.role === 'vendor') return <Navigate to="/vendor-dashboard" replace />;
    return <Navigate to="/fan-dashboard" replace />;
  }

  return children;
}
