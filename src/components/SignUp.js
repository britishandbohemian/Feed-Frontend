import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const userData = {
        username: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      };

      const response = await registerUser(userData);

      if (response.success) {
        localStorage.setItem('pendingVerificationEmail', userData.email);
        navigate('/verify-otp');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      // Add your resend OTP logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      setError('New OTP has been sent to your email');
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 font-['Poppins']">
      <div className="w-full max-w-md p-8">
        <div className="mb-12 text-center">
          <h1 className="font-['Milonga'] text-5xl mb-3 text-violet-400">feed</h1>
          <p className="text-zinc-400 text-lg">Create your account</p>
        </div>

        {error && (
          <div className="p-4 mb-6 text-sm text-red-200 rounded-lg bg-red-950 border border-red-800">
            {error}
            {error.toLowerCase().includes('otp') && (
              <button
                onClick={handleResendOTP}
                disabled={isResending}
                className="mt-2 w-full p-2 text-violet-400 border border-violet-400 rounded-lg
                         hover:bg-violet-400 hover:text-zinc-900 transition-colors duration-200"
              >
                {isResending ? 'Resending...' : 'Resend OTP'}
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="First Name"
                className="w-full p-4 bg-zinc-900 rounded-xl border-2 border-zinc-800 
                         placeholder-zinc-500 focus:border-violet-500 focus:outline-none
                         transition-colors duration-200"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Last Name"
                className="w-full p-4 bg-zinc-900 rounded-xl border-2 border-zinc-800 
                         placeholder-zinc-500 focus:border-violet-500 focus:outline-none
                         transition-colors duration-200"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

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
              minLength={8}
            />
            <p className="text-xs text-zinc-500">Minimum 8 characters</p>
          </div>

          <button
            type="submit"
            className="w-full bg-violet-600 text-white p-4 rounded-xl font-medium
                     transition-all duration-200 hover:bg-violet-500
                     focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950
                     disabled:opacity-50 disabled:hover:bg-violet-600
                     flex items-center justify-center space-x-2"
            disabled={isLoading}
          >
            {isLoading && (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>{isLoading ? 'Creating Account...' : 'Sign Up'}</span>
          </button>
        </form>

        <div className="mt-8 text-center text-zinc-400">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-violet-400 font-medium hover:text-violet-300 
                     transition-colors duration-200 focus:outline-none"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;