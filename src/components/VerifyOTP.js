import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { verifyOtp, resendOtp } from '../services/authService';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState('');
  const [resendSuccess, setResendSuccess] = useState('');

  useEffect(() => {
    const verificationEmail = sessionStorage.getItem('pendingVerificationEmail');
    if (!verificationEmail) {
      navigate('/signup');
      return;
    }
    setEmail(verificationEmail);
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

    try {
      const { data } = await verifyOtp({ email, otp: otpString });

      if (data.success) {
        localStorage.setItem('token', data.token);
        setUser({
          isAuthenticated: true,
          userData: data.user
        });
        
        setResendSuccess('Verification successful! Redirecting...');
        sessionStorage.removeItem('pendingVerificationEmail');

        setTimeout(() => {
          navigate('/home');
        }, 1500);
      }
    } catch (error) {
      setError(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendError('');
    setResendSuccess('');
    setResendLoading(true);

    try {
      const { data } = await resendOtp(email);
      
      if (data.success) {
        setResendSuccess('A new OTP has been sent to your email!');
        setOtp(['', '', '', '', '', '']);
      }
    } catch (error) {
      setResendError(error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

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

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (pasteData.length === 6 && /^\d+$/.test(pasteData)) {
      const otpArray = pasteData.split('');
      setOtp(otpArray);
      const lastInput = document.getElementById(`otp-5`);
      if (lastInput) lastInput.focus();
    } else {
      setError('Invalid OTP format. Please paste a 6-digit code.');
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

        {resendError && (
          <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200">
            {resendError}
          </div>
        )}

        {resendSuccess && (
          <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 border border-green-200">
            {resendSuccess}
          </div>
        )}

        <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-gray-50 border">
          <Mail className="text-gray-400" size={20} />
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
                onPaste={handlePaste}
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

        <div className="text-center mt-6 text-gray-600">
          Didn't receive the code?{' '}
          <button 
            onClick={handleResendOtp}
            className="text-black font-medium disabled:opacity-50"
            disabled={resendLoading}
          >
            {resendLoading ? 'Sending...' : 'Resend OTP'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;