import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AiOutlineUser, AiOutlineMail, AiOutlinePhone, AiOutlineLock } from 'react-icons/ai';

const Register = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Extract query parameters
  const query = new URLSearchParams(location.search);
  const invitedEmail = query.get('email') || '';
  const redirect = query.get('redirect') || '';
  const token = query.get('token') || '';

  // Set email state based on query parameter for invitation-based registration
  useEffect(() => {
    if (redirect === 'approve-invite' && invitedEmail) {
      setEmail(invitedEmail);
    }
  }, [invitedEmail, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if password and confirmPassword are the same
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Check if password is at least 6 characters long
    if (password.length < 6) {
      toast.error('Password should be at least 6 characters long');
      return;
    }
    // Check if phone number is exactly 10 digits
    if (phone.length !== 10) {
      toast.error('Phone number should be 10 digits');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      // Construct the registration URL with query parameters for invitation-based registration
      const registerUrl =
        redirect === 'approve-invite' && token
          ? `${process.env.REACT_APP_API}/api/auth/register?redirect=approve-invite&token=${encodeURIComponent(token)}`
          : `${process.env.REACT_APP_API}/api/auth/register`;

      const res = await axios.post(registerUrl, {
        name,
        email,
        phone,
        password,
        confirmPassword,
        phone,
      });

      if (res.data.success) {
        toast.success('Registration successful!');
        // Check if the response includes a redirect (for invitation-based registration)
        if (res.data.redirect) {
          navigate('/login', { state: { fromInvitation: true } });
        } else {
          navigate('/login');
        }
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Something went wrong');
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
          <h1 className="text-5xl font-bold mb-4">Join Us Today</h1>
          <p className="text-lg">Experience the best platform for task management and collaboration.</p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 bg-white px-8 py-12">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Signup</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* name Field */}
            <div className="input-group">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="relative mt-2">
                <input
                  type="text"
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="p-3 w-full pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <AiOutlineUser className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div className="input-group">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative mt-2">
                <input
                  type="email"
                  id="email"
                  placeholder="john@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={redirect === 'approve-invite' && invitedEmail !== ''}
                  className={`p-3 w-full pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${redirect === 'approve-invite' && invitedEmail !== '' ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  required
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <AiOutlineMail className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Phone Field */}
            <div className="input-group">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <div className="relative mt-2">
                <input
                  type="text"
                  id="phone"
                  placeholder="9812345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="p-3 w-full pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <AiOutlinePhone className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="input-group">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-2">
                <input
                  type="password"
                  id="password"
                  placeholder="*******"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="p-3 w-full pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <AiOutlineLock className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="input-group">
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative mt-2">
                <input
                  type="password"
                  id="confirm-password"
                  placeholder="*******"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="p-3 w-full pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <AiOutlineLock className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Signup
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <NavLink to="/login" className="text-blue-600 hover:underline">
                Log in
              </NavLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;