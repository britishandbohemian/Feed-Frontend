import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useUser } from '../context/UserContext.js';
import { loginUser } from '../services/authService'; // Import the loginUser function

const Login = () => {
  const { setUserInfo } = useUser();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const errorRef = useRef(null);

  // Scroll to error message when it changes
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [error]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
  
    try {
      const credentials = {
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      };
  
      // Call login service
      const { data } = await loginUser(credentials);
  
      if (data.success) {
        // Extract token and user data
        const { token, ...userData } = data.data;
        
        // Store token in localStorage
        localStorage.setItem('token', token);
        
        // Update user context
        setUserInfo(userData);
  
        // Handle "Remember Me"
        if (formData.rememberMe) {
          localStorage.setItem('rememberedEmail', credentials.email);
        }
  
        // Redirect to home
        navigate('/home');
      }
    } catch (err) {
      // Error handling remains the same
    } finally {
      setIsLoading(false);
    }
  };

  // Check for remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true,
      }));
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 bg-gray-100 font-['Poppins']">
      {/* Loading Bar */}
      {isLoading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
          <div className="h-full bg-black animate-loading-bar"></div>
        </div>
      )}

      <div className="w-full max-w-md">
        <div className="text-center mb-4">
          <h1 className="font-['Milonga'] text-3xl mb-2">feed</h1>
          <h2 className="text-xl font-medium mb-8">Login</h2>
        </div>

        {/* Error Message */}
        {error && (
          <div
            ref={errorRef}
            className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium mb-2">E-mail</label>
            <div className="relative">
              <input
                type="email"
                placeholder="Your Email"
                className={`w-full p-3 pl-10 border-2 rounded-lg bg-white font-normal ${
                  error ? 'border-red-500' : 'border-gray-200'
                }`}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Your Password"
                className={`w-full p-3 pl-10 border-2 rounded-lg bg-white font-normal ${
                  error ? 'border-red-500' : 'border-gray-200'
                }`}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Remember Me / Forgot Password */}
          <div className="flex items-center justify-between mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={formData.rememberMe}
                onChange={(e) =>
                  setFormData({ ...formData, rememberMe: e.target.checked })
                }
              />
              <span className="text-sm">Remember Me</span>
            </label>
            <Link to="/forgot-password" className="text-sm text-black font-medium">
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-black text-white p-3 rounded-lg mt-6 font-medium disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Social Login */}
        <div className="text-center mt-6">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500">or continue with</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Google Button */}
          <button className="p-3 border rounded-lg bg-white hover:bg-gray-50">
            <img
              src="https://cdnjs.cloudflare.com/ajax/libs/simple-icons/4.25.0/google.svg"
              alt="Google"
              className="w-6 h-6"
            />
          </button>

          {/* Signup Link */}
          <div className="mt-6 text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-black font-medium">
              Signup
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;