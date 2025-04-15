
import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from '../../context/auth';
import { FaBell, FaCalendarAlt, FaUserCircle } from 'react-icons/fa';

export default function Navbar() {
  const [auth, setAuth] = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSignOut = () => {
    localStorage.removeItem('auth'); // Remove 'auth' from localStorage
    setAuth({ user: null, token: '' }); // Clear auth state
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
    <div className="flex justify-between items-center bg-white p-4 shadow-md">
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
          <button className="text-xl text-gray-700 hover:text-indigo-600 transition-colors duration-300 ease-in-out">
            <FaBell />
          </button>
        </NavLink>

        {/* Profile Icon with Dropdown */}
        <div
          className="w-10 h-10 bg-gray-200 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-200 transition duration-300 ease-in-out"
          onClick={toggleDropdown}
        >
          <FaUserCircle className="text-2xl text-purple-800" />
        </div>

        {/* Profile Dropdown */}
        {dropdownOpen && (
          <div
            className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg transform scale-95 transition-all duration-200 ease-out"
            style={{ top: '100%' }}
          >
            <NavLink
              to="/dashboard/userInfo"
              className="block px-4 py-2 hover:bg-indigo-100 text-gray-700 transition duration-200 ease-in-out"
              onClick={() => setDropdownOpen(false)}
            >
              Profile
            </NavLink>
            <NavLink
              to="/"
              className="block px-4 py-2 hover:bg-indigo-100 text-gray-700 transition duration-200 ease-in-out"
              onClick={() => {
                setDropdownOpen(false);
                handleSignOut();
              }}
            >
              Logout
            </NavLink>
          </div>
        )}
      </div>
    </div>
  );
}
