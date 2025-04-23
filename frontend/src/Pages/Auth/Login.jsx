import React, { useState } from 'react';
import { AiOutlineUser, AiOutlineLock } from 'react-icons/ai';
import axios from 'axios';
import { useAuth } from '../../context/auth';
import { useNavigate, useLocation, NavLink } from 'react-router-dom'; 
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);  
  const navigate = useNavigate(); 
  const location = useLocation();
  
  // Access the auth context and setAuth function
  const [auth, setAuth] = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!email || !password) {
      toast.error("Please fill in both fields");
      return;
    }
  
    try {
      setLoading(true);
      setNeedsVerification(false); // Reset verification state
  
      const response = await axios.post(
        `${process.env.REACT_APP_API}/api/auth/login`,
        { email, password }
      );
  
      if (response.data.success) {
        const { accessToken, user } = response.data;
  
        setAuth({
          user,
          token: accessToken,
        });
  
        toast.success("Login successful!");
        setLoading(false);
  
        // Redirect based on role
        if (user.role === "Admin") {
          navigate("/dashboard/admin"); // Redirect to admin dashboard
        } else {
          navigate("/dashboard/user"); // Redirect to user dashboard
        }
      } else {
        setLoading(false);
        // Show backend error message
        toast.error(response.data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
  
      // Check if this is an email verification issue
      if (error.response?.data?.needsVerification) {
        setNeedsVerification(true);
        setError(error.response.data.message);
        toast.error(error.response.data.message);
        
        // Check if there's a redirect URL for OTP verification
        if (error.response?.data?.redirect) {
          setTimeout(() => {
            navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
          }, 2000);
        }
      }
      // Check if the error has a response and display that specific error message
      else if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };
  
  const handleResendVerification = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API}/api/auth/resend-otp`,
        { email }
      );
      
      if (response.data.success) {
        toast.success("Verification code sent. Please check your inbox.");
        // Redirect to OTP verification page
        navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        toast.error(response.data.message || "Failed to send verification code");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to send verification code"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Image Section */}
      <div className="hidden lg:flex w-1/2 bg-cover bg-center relative" style={{ backgroundImage: `url(${require('../../img/login.png')})` }}>
        <div className="absolute inset-0 bg-blue-900 bg-opacity-50"></div>
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full text-white text-center px-6">
          <h1 className="text-5xl font-bold mb-4">TaskiFY</h1>
          <p className="text-lg">Organize your tasks and boost your productivity with ease.</p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 bg-white px-8 py-12">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Welcome Back</h2>
          <p className="text-center text-gray-600 mb-4">Please login to your account</p>
          
          {/* Verification Notice */}
          {needsVerification && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
              <p className="font-medium">Email verification required</p>
              <p className="text-sm mt-1">Please verify your email before logging in.</p>
              <button
                onClick={handleResendVerification}
                className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Resend verification code
              </button>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Email</label>
              <div className="flex items-center mt-2 p-3 border border-gray-300 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                <AiOutlineUser className="text-gray-400 mr-2" />
                <input
                  type="text"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow focus:outline-none"
                  placeholder="john@gmail.com"
                  required
                />
              </div>
            </div>
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <div className="flex items-center mt-2 p-3 border border-gray-300 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                <AiOutlineLock className="text-gray-400 mr-2" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-grow focus:outline-none"
                  placeholder="*******"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className="mt-4 text-center">
            <NavLink to='/forget-pass'><p className="text-sm text-gray-600">Forgot Password?</p></NavLink>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <NavLink to="/register"><span className="text-blue-600 hover:underline cursor-pointer">
                Signup
              </span></NavLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;