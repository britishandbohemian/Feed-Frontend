import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

      if (response?.data?.success) {
        // ✅ Store email for OTP verification
        localStorage.setItem('pendingVerificationEmail', userData.email);

        // ✅ Redirect to OTP verification page
        navigate('/verify-otp');
      } else {
        setError(response?.data?.message || 'Signup failed');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800/50 backdrop-blur-sm">
        <div className="text-center">
          <h1 className="font-['Milonga'] text-6xl mb-4 text-violet-400 animate-fade-in">feed</h1>
          <p className="text-zinc-400 text-lg font-light">Create your account</p>
        </div>

        {error && (
          <div className="p-4 text-sm text-red-200 rounded-lg bg-red-950/50 border border-red-800/50 backdrop-blur-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              className="w-full p-4 bg-transparent border-b-2 border-violet-500 placeholder-zinc-500 text-zinc-100 focus:outline-none focus:border-violet-400 font-['Poppins']"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              className="w-full p-4 bg-transparent border-b-2 border-violet-500 placeholder-zinc-500 text-zinc-100 focus:outline-none focus:border-violet-400 font-['Poppins']"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-4 bg-transparent border-b-2 border-violet-500 placeholder-zinc-500 text-zinc-100 focus:outline-none focus:border-violet-400 font-['Poppins']"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-4 bg-transparent border-b-2 border-violet-500 placeholder-zinc-500 text-zinc-100 focus:outline-none focus:border-violet-400 font-['Poppins']"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={8}
          />
          <p className="text-xs text-zinc-500 pl-1">Minimum 8 characters</p>

          <button
            type="submit"
            className="w-full bg-violet-600 text-white p-4 rounded-xl font-medium transition-all duration-200 hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50 disabled:hover:bg-violet-600 font-['Poppins']"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center text-zinc-400">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-violet-400 font-medium hover:text-violet-300 transition-colors duration-200 focus:outline-none hover:underline"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
