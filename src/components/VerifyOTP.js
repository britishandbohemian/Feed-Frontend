// VerifyOTP.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyOtp } from '../services/authService';
import { useUser } from '../context/UserContext';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const { setUserInfo } = useUser();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const email = localStorage.getItem('pendingVerificationEmail');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const otpString = otp.join('');
      const response = await verifyOtp({ email, otp: otpString });

      if (response.data.success) {
        setUserInfo(response.data.user);
        localStorage.setItem('token', response.data.token);
        localStorage.removeItem('pendingVerificationEmail');
        navigate('/home');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 bg-gray-100 font-['Poppins']">
      <div className="w-full max-w-md">
        <div className="text-center mb-4">
          <h1 className="font-['Milonga'] text-3xl mb-2">feed</h1>
          <h2 className="text-xl font-medium mb-4">Verify OTP</h2>
          <p className="text-sm text-gray-600 mb-8">
            Please enter the verification code sent to your email
          </p>
        </div>

        {error && (
          <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                className="w-12 h-12 text-center border-2 rounded-lg bg-white font-medium text-lg"
                value={digit}
                onChange={(e) => {
                  const newOtp = [...otp];
                  newOtp[index] = e.target.value;
                  setOtp(newOtp);
                }}
                required
              />
            ))}
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white p-3 rounded-lg font-medium disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;