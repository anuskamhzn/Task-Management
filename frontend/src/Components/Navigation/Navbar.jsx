import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from '../../context/auth';
import { FaBell } from 'react-icons/fa';
import { FiUser, FiLogOut } from "react-icons/fi";
import axios from 'axios';

export default function Navbar() {
  const [auth, setAuth] = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(null); // null, 'profile', or 'notifications'
  const dropdownRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API}/api/notification`, {
          headers: { Authorization: `Bearer ${auth.token}` },
          params: { limit: 5 } // Fetch 5 to check if there are more than 4
        });
        const { notifications } = response.data;
        setNotifications(notifications);
        setUnreadCount(notifications.filter(n => !n.isRead).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    if (auth.token) {
      fetchNotifications();
    }
  }, [auth.token]);

  const handleSignOut = () => {
    localStorage.removeItem('auth');
    setAuth({ user: null, token: '' });
  };

  const toggleDropdown = (type) => {
    setDropdownOpen(dropdownOpen === type ? null : type);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${process.env.REACT_APP_API}/api/notification/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

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
        {/* Notification Icon with Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('notifications')}
            className="text-xl text-gray-600 hover:text-indigo-500 transition-colors duration-200 ease-in-out relative"
          >
            <FaBell />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {dropdownOpen === 'notifications' && (
            <div
              className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 ease-in-out opacity-0 scale-95"
              style={{ top: '100%', animation: 'dropdownOpen 0.3s ease-out forwards' }}
            >
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
              </div>
              {loading ? (
                <div className="p-4 text-gray-500">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-gray-500">No notifications</div>
              ) : (
                <>
                  {notifications.slice(0, 4).map(notification => (
                    <NavLink
                      key={notification._id}
                      to={`/dashboard/notifications`}
                      onClick={() => setDropdownOpen(null)}
                      className={` p-4 border-b border-gray-100 hover:bg-gray-50 flex justify-between items-center ${notification.isRead ? 'bg-gray-50' : 'bg-white'}`}
                    >
                      <div
                        key={notification._id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 flex justify-between items-center ${notification.isRead ? 'bg-gray-50' : 'bg-white'}`}
                      >
                        <div>
                          <p className={`text-sm ${notification.isRead ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="text-xs text-indigo-500 hover:text-indigo-700"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </NavLink>
                  ))}
                  {notifications.length > 4 && (
                    <NavLink
                      to="/dashboard/notifications"
                      className="block w-full text-center p-4 text-indigo-600 hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                      onClick={() => setDropdownOpen(null)}
                    >
                      Show More
                    </NavLink>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Profile Icon with Dropdown */}
        <div
          className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition duration-200 ease-in-out"
          onClick={() => toggleDropdown('profile')}
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
        {dropdownOpen === 'profile' && (
          <div
            className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 ease-in-out opacity-0 scale-95"
            style={{ top: '100%', animation: dropdownOpen ? 'dropdownOpen 0.3s ease-out forwards' : '' }}
          >
            <NavLink
              to="/dashboard/userInfo"
              className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors duration-150 ease-in-out"
              onClick={() => setDropdownOpen(null)}
            >
              <FiUser className="text-lg" /> Profile
            </NavLink>
            <NavLink
              to="/"
              className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors duration-150 ease-in-out"
              onClick={() => {
                setDropdownOpen(null);
                handleSignOut();
              }}
            >
              <FiLogOut className="text-lg" /> Logout
            </NavLink>
          </div>
        )}
      </div>

      {/* Inline CSS for Dropdown keyframes for dropdown animation */}
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
    </div >
  );
}
