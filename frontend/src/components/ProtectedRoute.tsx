import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to role-specific dashboard if trying to access generic dashboard
  if (window.location.pathname === '/dashboard' || window.location.pathname === '/') {
    if (user.role === 'teacher') {
      return <Navigate to="/teacher-dashboard" replace />;
    } else if (user.role === 'student') {
      return <Navigate to="/student-dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;