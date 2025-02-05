import React, { useState } from 'react';
import { AiOutlineUser, AiOutlineLock } from 'react-icons/ai';
import axios from 'axios';
import { useAuth } from '../../context/auth';
import { useNavigate, NavLink } from 'react-router-dom'; 
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);  
  const navigate = useNavigate(); 
  
  // Access the auth context and setAuth function
  const [auth, setAuth] = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in both fields'); 
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${process.env.REACT_APP_API}/api/auth/login`, 
        { email, password }
      );

      // If login is successful
      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data; // accessToken is sent in response
        setAuth({
          user,
          token: accessToken, // Store the access token in the auth context
          refreshToken: refreshToken, 
        });
        toast.success('Login successful!');
        setLoading(false);
        navigate('/dashboard');
      } else {
        setLoading(false);
        toast.error(response.data.message);
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
      toast.error('Something went wrong. Please try again.');
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
            >
              Login
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
