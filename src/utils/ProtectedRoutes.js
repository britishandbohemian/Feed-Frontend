import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useUser();

  // Show loading state while checking authentication
  if (isLoading) {
    return <div>Loading...</div>;
  }


  return <Outlet />;
};

export default ProtectedRoute;