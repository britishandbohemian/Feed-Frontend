import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginUser } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(true);
  const [showLoadingBar, setShowLoadingBar] = useState(false);
  const [isApiConnected, setIsApiConnected] = useState(false); // State for API connectivity
  const API_URL = 'https://orange-parakeet-wg447765vj6h5qp7-5000.app.github.dev';

  // Check API connectivity when the component mounts
  useEffect(() => {
    const checkApiConnectivity = async () => {
      try {
        const response = await fetch(`${API_URL}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          setIsApiConnected(true); // API is reachable
        } else {
          setIsApiConnected(false); // API is not reachable
        }
      } catch (err) {
        setIsApiConnected(false); // API is not reachable
      }
    };
  
    checkApiConnectivity();
  }, []);

  // Ensure localStorage data is valid before parsing
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (user) {
        setIsVerified(user.isEmailVerified);
        const from = location.state?.from?.pathname || "/home";
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }, [navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setShowLoadingBar(true);

    try {
      const response = await loginUser(formData);

      if (response?.data?.data) {
        const userData = response.data.data;
        const token = userData.token; // Extract token

        if (token) {
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('token', token); // Save token

          if (!userData.isEmailVerified) {
            setIsVerified(false);
            setError('Your email is not verified. Please verify your account.');
          } else {
            navigate('/home');
          }
        } else {
          setError('Authorization token is missing.');
        }
      } else {
        setError(response?.data?.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
      setShowLoadingBar(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 font-['Poppins']">
      {/* Dot indicator */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: isApiConnected ? 'green' : 'red',
        }}
      ></div>

      {showLoadingBar && <div className="w-full h-1 bg-zinc-800 animate-loading"></div>}

      <div className="w-full max-w-md p-8">
        <div className="mb-12 text-center">
          <h1 className="font-['Milonga'] text-5xl mb-3 text-violet-400">feed</h1>
          <p className="text-zinc-400 text-lg">Welcome back</p>
        </div>

        {error && (
          <div className="p-4 mb-6 text-sm text-red-200 rounded-lg bg-red-950 border border-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <input
              type="email"
              placeholder="Email"
              className="w-full p-4 bg-zinc-900 rounded-xl border-2 border-zinc-800 placeholder-zinc-500 focus:border-violet-500 focus:outline-none transition-colors duration-200"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <input
              type="password"
              placeholder="Password"
              className="w-full p-4 bg-zinc-900 rounded-xl border-2 border-zinc-800 placeholder-zinc-500 focus:border-violet-500 focus:outline-none transition-colors duration-200"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-violet-600 text-white p-4 rounded-xl font-medium transition-all duration-200 hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50 disabled:hover:bg-violet-600 flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : null}
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {!isVerified && (
          <button
            onClick={() => navigate('/verify-otp')}
            className="w-full bg-red-600 text-white p-4 rounded-xl font-medium transition-all duration-200 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-950 mt-4"
          >
            Verify Account
          </button>
        )}

        <div className="mt-8 text-center text-zinc-400">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/signup')}
            className="text-violet-400 font-medium hover:text-violet-300 transition-colors duration-200 focus:outline-none"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;