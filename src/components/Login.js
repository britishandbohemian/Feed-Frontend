import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { useUser } from '../context/UserContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, userInfo } = useUser();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(true);
  const [showLoadingBar, setShowLoadingBar] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  // Check verification status when userInfo changes
  useEffect(() => {
    if (userInfo && !userInfo.isVerified) {
      setIsVerified(false);
    }
  }, [userInfo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setShowLoadingBar(true);

    try {
      const response = await loginUser(formData);

      if (response.success) {
        // Use the login function from UserContext
        login(response.data.token, response.data.user);
        navigate('/home');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
      setShowLoadingBar(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 font-['Poppins']">
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
              className="w-full p-4 bg-zinc-900 rounded-xl border-2 border-zinc-800 
                       placeholder-zinc-500 focus:border-violet-500 focus:outline-none
                       transition-colors duration-200"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <input
              type="password"
              placeholder="Password"
              className="w-full p-4 bg-zinc-900 rounded-xl border-2 border-zinc-800 
                       placeholder-zinc-500 focus:border-violet-500 focus:outline-none
                       transition-colors duration-200"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-violet-600 text-white p-4 rounded-xl font-medium
                     transition-all duration-200 hover:bg-violet-500
                     focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950
                     disabled:opacity-50 disabled:hover:bg-violet-600 flex items-center justify-center"
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
            onClick={() => navigate('/verify')}
            className="w-full bg-red-600 text-white p-4 rounded-xl font-medium
                     transition-all duration-200 hover:bg-red-500
                     focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-950
                     mt-4"
          >
            Verify Account
          </button>
        )}

        <div className="mt-8 text-center text-zinc-400">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/signup')}
            className="text-violet-400 font-medium hover:text-violet-300 
                     transition-colors duration-200 focus:outline-none"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;