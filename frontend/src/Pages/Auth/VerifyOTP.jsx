import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AiOutlineCheckCircle, AiOutlineMail } from 'react-icons/ai';

const VerifyOTP = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract email from query parameters
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const queryEmail = query.get('email');
    if (queryEmail) {
      setEmail(queryEmail);
    }
    // Set countdown for resend button (10 minutes = 600 seconds)
    setTimeLeft(600);
  }, [location.search]);

  // Countdown timer for OTP expiration
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!email || !otp) {
      toast.error('Email and verification code are required');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API}/api/auth/verify-otp`,
        { email, otp }
      );

      if (response.data.success) {
        setVerificationSuccess(true);
        toast.success('Email verified successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || 'Failed to verify email'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      toast.error('Email is required');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API}/api/auth/resend-otp`,
        { email }
      );

      if (response.data.success) {
        toast.success('Verification code sent. Please check your inbox.');
        setTimeLeft(600); // Reset countdown timer
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || 'Failed to send verification code'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Image Section */}
      <div
        className="hidden lg:flex w-1/2 bg-cover bg-center relative"
        style={{
          backgroundImage: `url(${require('../../img/register.png')})`,
        }}
      >
        <div className="absolute inset-0 bg-blue-900 bg-opacity-50"></div>
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full text-white text-center px-6">
          <h1 className="text-5xl font-bold mb-4">Verify Your Email</h1>
          <p className="text-lg">Complete your registration by verifying your email address.</p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 bg-white px-8 py-12">
        <div className="w-full max-w-md">
          {verificationSuccess ? (
            <div className="text-center p-6 bg-green-50 rounded-lg border border-green-100">
              <AiOutlineCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Verification Successful!</h3>
              <p className="text-gray-600 mb-4">
                Your email has been verified successfully. You can now log in to your account.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Redirecting to login page...
              </p>
              <NavLink to="/login">
                <button className="inline-flex justify-center w-full py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Go to Login
                </button>
              </NavLink>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Verify Your Email</h2>
              <p className="text-center text-gray-600 mb-6">
                We've sent a verification code to <strong>{email}</strong>. 
                Please enter the code below to verify your email address.
              </p>
              
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                {/* Email Field (Read-only) */}
                <div className="input-group">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="relative mt-2">
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="p-3 w-full pl-10 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      readOnly={!!location.search.includes('email=')}
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <AiOutlineMail className="text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* OTP Input */}
                <div className="input-group">
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                    Verification Code
                  </label>
                  <div className="relative mt-2">
                    <input
                      type="text"
                      id="otp"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="p-3 w-full text-center text-lg tracking-widest font-mono border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                {/* Timer and Resend */}
                <div className="text-center text-sm text-gray-600">
                  {timeLeft > 0 ? (
                    <p>Code expires in {formatTime(timeLeft)}</p>
                  ) : (
                    <p>Verification code has expired</p>
                  )}
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={timeLeft > 0 || loading}
                    className={`mt-2 font-medium ${
                      timeLeft > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-500'
                    }`}
                  >
                    Resend verification code
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify Email'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Return to{' '}
                  <NavLink to="/login" className="text-blue-600 hover:underline">
                    Login
                  </NavLink>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;