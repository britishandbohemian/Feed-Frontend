import React, { useEffect, useContext, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import ProtectedRoute from './utils/ProtectedRoutes'; // Import the ProtectedRoute

// Import components
import Login from './components/Login';
import SignUp from './components/SignUp';
import Home from './components/Home';
import Verify from './components/VerifyOTP';
import ViewTask from './components/ViewTask';
import TaskForm from './components/TaskForm';
import ResetPassword from './components/ResetPassword';
import ForgotPassword from './components/ForgotPassword';
import { UserProvider, UserContext } from './context/UserContext';

function App() {
  return (
    <UserProvider>
      <Router>
        <InactivityMonitor />
      </Router>
    </UserProvider>
  );
}

/**
 * This component wraps your routes in an "inactivity monitor".
 * It handles all the routing as well as the inactivity logic.
 */
function InactivityMonitor() {
  const navigate = useNavigate();
  const { logout } = useContext(UserContext);

  // Timer logic
  const inactivityTimerRef = useRef(null);

  const resetTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      console.log('User inactive. Logging out...'); // Debugging log
      logout();
      navigate('/login');
    }, 1800000); // 30 minutes
  }, [logout, navigate]);

  useEffect(() => {
    console.log('Inactivity monitor initialized'); // Debugging log
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart', 'touchmove', 'touchend'];
    const handleActivity = () => {
      console.log('Activity detected. Resetting timer.'); // Debugging log
      resetTimer();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    resetTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [resetTimer]);

  return (
    <div className="App">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-otp" element={<Verify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/task"
          element={
            <ProtectedRoute>
              <ViewTask />
            </ProtectedRoute>
          }
        />
        <Route
          path="/task/new"
          element={
            <ProtectedRoute>
              <TaskForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/task/edit/:id"
          element={
            <ProtectedRoute>
              <TaskForm />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;