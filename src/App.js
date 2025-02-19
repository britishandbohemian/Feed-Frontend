import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import VerifyOTP from './components/VerifyOTP';
import TaskForm from './components/TaskForm';
import Home from './components/Home';
import ProtectedRoute from './utils/ProtectedRoutes';

const App = () => (
  <Router>
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<Home />} />
        <Route path="/new-task" element={<TaskForm />} />
        <Route path="/task/:id" element={<TaskForm />} />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  </Router>
);

export default App;
