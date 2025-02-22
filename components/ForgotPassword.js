import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/users/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem('forgotPasswordEmail', email);
        navigate('/reset-password');
      } else {
        setError(data.message || 'Unable to send password reset email. Please try again.');
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
          <h2 className="text-xl font-medium mb-4">Forgot Password</h2>
          <p className="text-sm text-gray-600 mb-8">
            Enter your email to receive a password reset link
          </p>
        </div>

        {error && (
          <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border">
            <Mail className="text-gray-400" size={20} />
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-transparent text-sm text-gray-600 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white p-3 rounded-lg font-medium disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Reset Password'}
          </button>
        </form>

        <div className="text-center mt-6 text-gray-600">
          Remembered your password?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-black font-medium"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;