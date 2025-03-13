import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyEmailOtp } from '../services/api';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const email = localStorage.getItem('pendingVerificationEmail');
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Prevent non-numeric input

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only allow one digit per box
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus(); // Move to next input
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus(); // Move back on delete
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setError('Please enter the full 6-digit OTP.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await verifyEmailOtp({ email, otp: enteredOtp });

      if (response?.data?.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
        localStorage.removeItem('pendingVerificationEmail');

        navigate('/home');
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'An error occurred during verification.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 font-['Poppins']">
      <div className="w-full max-w-md p-8">
        <div className="mb-12 text-center">
          <h1 className="font-['Milonga'] text-5xl mb-3 text-violet-400">feed</h1>
          <p className="text-zinc-400 text-lg">Enter your 6-digit OTP</p>
        </div>

        {error && (
          <div className="p-4 mb-6 text-sm text-red-200 rounded-lg bg-red-950 border border-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center space-x-3 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-lg font-medium bg-transparent border-b-2 border-violet-500 focus:border-violet-400 focus:outline-none transition-colors duration-200 font-['Poppins']"
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-violet-600 text-white p-4 rounded-xl font-medium transition-all duration-200 hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50 disabled:hover:bg-violet-600"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
