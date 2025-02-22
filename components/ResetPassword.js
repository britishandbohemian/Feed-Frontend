import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const forgotPasswordEmail = sessionStorage.getItem('forgotPasswordEmail');
    if (!forgotPasswordEmail) {
      navigate('/forgot-password');
      return;
    }
    setEmail(forgotPasswordEmail);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter all digits of the OTP');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: otpString,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        sessionStorage.removeItem('forgotPasswordEmail');
        navigate('/login');
      } else {
        setError(data.message || 'Invalid OTP or an error occurred. Please try again.');
      }
    } catch (err) {
      setError('Unable to connect to the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 bg-gray-100 font-['Poppins']">
      <div className="w-full max-w-md">
        <div className="text-center mb-4">
          <h1 className="font-['Milonga'] text-3xl mb-2">feed</h1>
          <h2 className="text-xl font-medium mb-4">Reset Password</h2>
          <p className="text-sm text-gray-600 mb-8">
            Enter the OTP and your new password
          </p>
        </div>

        {error && (
          <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200" role="alert">
            {error}
          </div>
        )}

        <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-gray-50 border">
          <Key className="text-gray-400" size={20} />
          <span className="text-sm text-gray-600">{email}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                className="w-12 h-12 text-center border-2 rounded-lg bg-white font-medium text-lg"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                required
              />
            ))}
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border">
            <Key className="text-gray-400" size={20} />
            <input
              type="password"
              placeholder="New Password"
              className="w-full bg-transparent text-sm text-gray-600 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border">
            <Key className="text-gray-400" size={20} />
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full bg-transparent text-sm text-gray-600 focus:outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white p-3 rounded-lg font-medium disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;