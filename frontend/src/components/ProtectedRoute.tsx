import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ role, children }: { role: 'student' | 'teacher'; children: React.ReactNode }) {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  if (!user || !token) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={user.role === 'student' ? '/student/dashboard' : '/teacher/dashboard'} replace />;
  return <>{children}</>;
}
