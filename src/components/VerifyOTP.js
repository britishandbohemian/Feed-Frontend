import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyEmailOtp } from '../services/api';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingBar, setShowLoadingBar] = useState(false);
  const email = localStorage.getItem('pendingVerificationEmail');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setShowLoadingBar(true);

    try {
      const response = await verifyEmailOtp({ email, otp });

      if (response?.data?.success) {
        // ✅ Save user info & token
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token); // ✅ Save auth token
        localStorage.removeItem('pendingVerificationEmail'); // ✅ Remove email after verification

        // ✅ Redirect to home
        navigate('/home');
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'An error occurred during verification.');
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
          <p className="text-zinc-400 text-lg">Verify your account</p>
        </div>

        {error && (
          <div className="p-4 mb-6 text-sm text-red-200 rounded-lg bg-red-950 border border-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center space-x-2 mb-8">
            <input
              type="number"
              min="0"
              max="999999"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              className="w-full p-4 bg-zinc-900 rounded-xl border-2 border-zinc-800 placeholder-zinc-500 focus:border-violet-500 focus:outline-none transition-colors duration-200 text-center"
              required
              style={{ width: '48%', maxWidth: '192px' }}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-violet-600 text-white p-4 rounded-xl font-medium transition-all duration-200 hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50 disabled:hover:bg-violet-600 flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> : null}
            {isLoading ? 'Verifying...' : 'Verify Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
