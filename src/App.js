// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext'; // Import UserProvider
import Login from './components/Login';
import SignUp from './components/SignUp';
import VerifyOTP from './components/VerifyOTP';
import TaskForm from './components/TaskForm';
import Home from './components/Home';
import ProtectedRoute from './utils/ProtectedRoutes';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/NewTask" element={<TaskForm />} />
          </Route>
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;