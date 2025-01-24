import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, bypassRoutes = [] }) => {
  const { user, loading } = useAuth(); // Get authentication state from context
  const location = useLocation(); // Get current location

  // Show loading screen while authentication state is being checked
  if (loading) {
    return <div>Loading...</div>;
  }

  // Allow access to bypass routes (e.g., login, signup, verify-otp)
  if (bypassRoutes.includes(location.pathname)) {
    return children;
  }

  // If user is not authenticated, redirect to login page
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  // If authenticated, allow access to the route
  return children;
};

export default ProtectedRoute;
