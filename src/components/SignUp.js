import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store email temporarily for OTP verification
        sessionStorage.setItem('verificationEmail', formData.email);
        navigate('/verify-otp');
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Unable to connect to the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 bg-gray-100 font-['Poppins']">
      <div className="w-full max-w-md">
        <div className="text-center mb-4">
          <h1 className="font-['Milonga'] text-3xl mb-2">feed</h1>
          <h2 className="text-xl font-medium mb-8">Sign up</h2>
        </div>

        {error && (
          <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
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

          <div className="text-sm mt-4">
            By signing up you agree to our{' '}
            <Link to="/terms" className="text-black font-medium">Terms & Condition</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-black font-medium">Privacy Policy</Link>.*
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white p-3 rounded-lg mt-6 font-medium disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

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