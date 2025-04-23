import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from '../../context/auth';
import { FaBell } from 'react-icons/fa';
import { FiUser, FiLogOut } from "react-icons/fi";

export default function Navbar() {
  const [auth, setAuth] = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSignOut = () => {
    localStorage.removeItem('auth');
    setAuth({ user: null, token: '' });
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex justify-between items-center bg-white border-b border-gray-300 p-4 shadow-sm">
      {/* Left: Logo and Search Bar */}
      <div className="flex items-center space-x-6">
        {/* <input
          type="text"
          placeholder="Search..."
          className="border p-2 rounded-2xl w-full max-w-md bg-gray-50 focus:ring-2 focus:ring-indigo-400 transition duration-300 ease-in-out"
        /> */}
      </div>

      {/* Right: Notifications, Calendar, Profile */}
      <div className="flex space-x-6 items-center relative" ref={dropdownRef}>
        <NavLink to="/dashboard/notifications">
          <button className="text-xl text-gray-600 hover:text-indigo-500 transition-colors duration-200 ease-in-out">
            <FaBell />
          </button>
        </NavLink>

        {/* Profile Icon with Dropdown */}
        <div
          className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition duration-200 ease-in-out"
          onClick={toggleDropdown}
        >
          {auth?.user?.photo ? (
            <img
              src={`data:${auth.user.photo.contentType};base64,${auth.user.photo.data}`}
              alt="User Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-100 text-violet-600 rounded-full flex items-center justify-center text-lg font-medium">
              {auth?.user?.initials || 'U'}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        {dropdownOpen && (
          <div
            className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 ease-in-out opacity-0 scale-95"
            style={{ top: '100%', animation: dropdownOpen ? 'dropdownOpen 0.3s ease-out forwards' : '' }}
          >
            <NavLink
              to="/dashboard/userInfo"
              className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors duration-150 ease-in-out"
              onClick={() => setDropdownOpen(false)}
            >
              <FiUser className="text-lg" /> Profile
            </NavLink>
            <NavLink
              to="/"
              className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors duration-150 ease-in-out"
              onClick={() => {
                setDropdownOpen(false);
                handleSignOut();
              }}
            >
              <FiLogOut className="text-lg" /> Logout
            </NavLink>
          </div>
        )}
      </div>

      {/* Inline CSS for Dropdownイ keyframes for dropdown animation */}
      <style>
        {`
          @keyframes dropdownOpen {
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>
    </div>
  );
}