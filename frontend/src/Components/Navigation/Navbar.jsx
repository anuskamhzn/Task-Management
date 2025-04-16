import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from '../../context/auth';
import { FaBell, FaCalendarAlt } from 'react-icons/fa';
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
          className="w-10 h-10 rounded-full border-2 border-purple-400 flex items-center justify-center cursor-pointer hover:bg-indigo-200 transition duration-300 ease-in-out"
          onClick={toggleDropdown}
        >
          {auth?.user?.photo ? (
            <img
              src={`data:${auth.user.photo.contentType};base64,${auth.user.photo.data}`}
              alt="User Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-200 text-purple-800 rounded-full flex items-center justify-center text-lg font-medium">
              {auth?.user?.initials || 'U'}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        {dropdownOpen && (
          <div
            className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg transform scale-95 transition-all duration-200 ease-out"
            style={{ top: '100%' }}
          >
            <NavLink
              to="/dashboard/userInfo"
              className="flex items-center gap-2 w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200 rounded-lg"
              onClick={() => setDropdownOpen(false)}
            >
              <FiUser className="text-lg" /> Profile
            </NavLink>
            <NavLink
              to="/"
              className="flex items-center gap-2 w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200 rounded-lg"
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
    </div>
  );
}