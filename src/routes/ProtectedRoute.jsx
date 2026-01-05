import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}



// Redirect to home which handles role-based landing
export function GuestRoute({ children }) {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}