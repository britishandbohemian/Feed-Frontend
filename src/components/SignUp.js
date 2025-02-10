import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { registerUser } from '../services/authService'; // Import the registerUser function

const SignUp = () => {
  const navigate = useNavigate();
  const errorRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      // Prepare user data for registration
      const userData = {
        username: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
      };
  
      // Call the registerUser function from authService
      const response = await registerUser(userData);
  
      // Check if the response indicates success
      if (response.success) {
        // Store the email in sessionStorage for OTP verification
        sessionStorage.setItem('pendingVerificationEmail', formData.email);
  
        // Redirect to the OTP verification page
        navigate('/verify-otp');
      } else {
        // Handle backend errors
        throw new Error(response.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      // Handle errors
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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
          <h2 className="text-xl font-medium mb-8">Sign up</h2>
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

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium mb-2">First Name</label>
            <input
              type="text"
              placeholder="Your First Name"
              className="w-full p-3 border-2 rounded-lg bg-white font-normal"
              value={formData.firstName}
              onChange={(e) => {
                setError('');
                setFormData({ ...formData, firstName: e.target.value });
              }}
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Last Name</label>
            <input
              type="text"
              placeholder="Your Last Name"
              className="w-full p-3 border-2 rounded-lg bg-white font-normal"
              value={formData.lastName}
              onChange={(e) => {
                setError('');
                setFormData({ ...formData, lastName: e.target.value });
              }}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">E-mail</label>
            <div className="relative">
              <input
                type="email"
                placeholder="Your Email"
                className="w-full p-3 pl-10 border-2 rounded-lg bg-white font-normal"
                value={formData.email}
                onChange={(e) => {
                  setError('');
                  setFormData({ ...formData, email: e.target.value });
                }}
                required
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Your Password"
                className="w-full p-3 pl-10 border-2 rounded-lg bg-white font-normal"
                value={formData.password}
                onChange={(e) => {
                  setError('');
                  setFormData({ ...formData, password: e.target.value });
                }}
                required
                minLength={8}
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

          {/* Terms and Conditions */}
          <div className="text-sm mt-4">
            By signing up you agree to our{' '}
            <Link to="/terms" className="text-black font-medium">
              Terms & Condition
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-black font-medium">
              Privacy Policy
            </Link>
            .*
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-black text-white p-3 rounded-lg mt-6 font-medium disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-6 text-gray-600">
          Already signed up?{' '}
          <Link to="/" className="text-black font-medium">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;