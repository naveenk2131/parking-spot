import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';

/**
 * Protects a route — redirects to /login if not authenticated.
 * Optionally restricts to specific roles.
 */
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="ps-spinner ps-spinner-lg mb-3"></div>
          <p className="text-muted small">Loading ParkingSpot...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
