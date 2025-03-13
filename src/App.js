// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/SignUp';
import Home from './components/Home';
import Header from './components/Header';
import TaskForm from './components/TaskForm';
import './styles/header.css';

// Import other components as needed

const App = () => {
  // Check if user is logged in
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected routes with Header */}
        <Route path="/home" element={
          <ProtectedRoute>
            <>
              <Header />
              <Home />
            </>
          </ProtectedRoute>
        } />
        
        {/* Add other routes as needed */}
        
        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" />} />
        // Make sure the route for new-task is properly defined
        <Route path="/new-task" element={<TaskForm />} />
      </Routes>
    </Router>
  );
};

export default App;