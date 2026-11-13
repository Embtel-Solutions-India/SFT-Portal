import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    // Redirect to the appropriate role login page based on path
    const path = location.pathname;
    let targetLogin = '/admin/login';
    if (path.startsWith('/recruiter')) targetLogin = '/recruiter/login';
    else if (path.startsWith('/partner-admin')) targetLogin = '/partner-admin/login';
    else if (path.startsWith('/partner-staff')) targetLogin = '/partner-staff/login';

    return <Navigate to={targetLogin} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" state={{ from: location, requiredRoles: allowedRoles }} replace />;
  }

  return <>{children}</>;
};

