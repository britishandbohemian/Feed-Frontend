import React, { useEffect, useContext, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';

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

    // Store a reference to the timer, so we can reset and clear it
    const inactivityTimerRef = useRef(null);

    // Helper function to clear the existing timer and set a new one
    const resetTimer = useCallback(() => {
        // Clear any existing timer
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
        }

        // Set a new timer: 10 minutes = 600,000 ms
        inactivityTimerRef.current = setTimeout(() => {
            // Call logout and redirect to login once user is inactive for 10 minutes
            logout();
            navigate('/login');
        }, 600000);
    }, [logout, navigate]);

    useEffect(() => {
        // Events that signify user activity on desktop and mobile
        const events = [
            'mousemove',  // Desktop mouse movement
            'keydown',    // Keyboard activity
            'click',      // Mouse clicks
            'scroll',     // Scroll activity
            'touchstart', // Mobile touch start
            'touchmove',  // Mobile touch move
            'touchend'    // Mobile touch end
        ];

        // Set up event listeners that reset the inactivity timer
        const handleActivity = () => resetTimer();

        events.forEach((event) => {
            window.addEventListener(event, handleActivity);
        });

        // Initialize the timer when component mounts
        resetTimer();

        // Cleanup: remove event listeners and clear the timer
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

                {/* Protected or other routes */}
                <Route path="/home" element={<Home />} />
                <Route path="/task" element={<ViewTask />} />
                <Route path="/task/new" element={<TaskForm />} />
                <Route path="/task/edit/:id" element={<TaskForm />} />
            </Routes>
        </div>
    );
}


export default App;
