import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  // ✅ Public pages that don't require authentication
  const publicRoutes = ['/login', '/signup', '/verify-otp'];

  // ✅ If token is missing or invalid, clean it
  if (!token || token === "null" || token === "undefined") {
    localStorage.removeItem('token'); // Clean invalid token

    // ✅ Allow access if the user is already on a public page
    if (publicRoutes.some(route => location.pathname.startsWith(route))) {
      return <Outlet />;
    }

    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
