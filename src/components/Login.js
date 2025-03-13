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
  //const API_URL = 'https://feed-api-7rj8.onrender.com';
  const API_URL = 'https://feed-api-7rj8.onrender.com';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setShowLoadingBar(true);

    try {
      const response = await loginUser(formData);

      // Corrected response structure handling
      if (response.data) {
        const userData = response.data.user;
        const token = response.data.token;

        if (token) {
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('token', token);

          if (!userData.isEmailVerified) {
            setIsVerified(false);
            setError('Your email is not verified. Please verify your account.');
          } else {
            navigate('/home'); // This should now execute properly
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
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 relative">
      {showLoadingBar && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-violet-600/20">
          <div className="h-full w-1/3 bg-violet-600 animate-loading-bar"></div>
        </div>
      )}
      <div className={`fixed top-4 right-4 h-3 w-3 rounded-full transition-colors duration-200 ${isApiConnected ? 'bg-green-500' : 'bg-red-500'}`} />

      <div className="w-full max-w-md space-y-8 bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800/50 backdrop-blur-sm">
        <div className="text-center">
          <h1 className="font-['Milonga'] text-4xl mb-4 text-violet-400 animate-fade-in">feed</h1>
          <p className="text-zinc-400 text-lg font-light">Welcome back</p>
        </div>

        {error && (
          <div className="p-4 text-sm text-red-200 rounded-lg bg-red-950/50 border border-red-800/50 backdrop-blur-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-4 bg-transparent border-b-2 border-violet-500 placeholder-zinc-500 text-zinc-100 focus:outline-none focus:border-violet-400 font-['Poppins']"
            placeholder="Email"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-4 bg-transparent border-b-2 border-violet-500 placeholder-zinc-500 text-zinc-100 focus:outline-none focus:border-violet-400 font-['Poppins']"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="w-full bg-violet-600 text-white p-4 rounded-xl font-medium transition-all duration-200 hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50 disabled:hover:bg-violet-600 font-['Poppins']"
            disabled={isLoading}
          >
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

        <div className="text-center text-zinc-400">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/signup')}
            className="text-violet-400 font-medium hover:text-violet-300 transition-colors duration-200 focus:outline-none hover:underline"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;