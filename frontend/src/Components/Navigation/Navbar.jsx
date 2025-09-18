import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { FaBell, FaBars } from "react-icons/fa";
import { FiUser, FiLogOut } from "react-icons/fi";
import io from "socket.io-client";

export default function Navbar({ toggleSidebar }) {
  const [auth, setAuth] = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(null); // null, 'profile', or 'notifications'
  const dropdownRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (auth.token && auth.user) {
      socketRef.current = io(process.env.REACT_APP_API, {
        auth: { token: auth.token },
      });

      socketRef.current.emit("joinNotificationRoom");

      socketRef.current.on("initialNotifications", ({ notifications, unreadCount }) => {
        setNotifications(notifications);
        setUnreadCount(unreadCount);
        setLoading(false);
      });

      socketRef.current.on("newNotification", (notification) => {
        setNotifications((prev) => [notification, ...prev].slice(0, 5));
        setUnreadCount((prev) => prev + (notification.isRead ? 0 : 1));
      });

      socketRef.current.on("notificationRead", (updatedNotification) => {
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === updatedNotification._id ? updatedNotification : n
          )
        );
        setUnreadCount((prev) => (updatedNotification.isRead ? prev - 1 : prev));
      });

      socketRef.current.on("allNotificationsRead", () => {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
      });

      socketRef.current.on("notificationCountUpdate", ({ unreadCount }) => {
        setUnreadCount(unreadCount);
      });

      socketRef.current.on("error", ({ message }) => {
        console.error("Socket error:", message);
      });

      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [auth.token, auth.user]);

  const handleSignOut = () => {
    localStorage.removeItem("auth");
    setAuth({ user: null, token: "" });
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

  const markAllAsRead = () => {
    if (socketRef.current) {
      socketRef.current.emit("markAllNotificationsAsRead", (response) => {
        if (!response.success) {
          console.error("Error marking all notifications as read:", response.message);
        }
      });
    }
  };

  return (
    <div className="flex justify-between items-center bg-white border-b border-gray-300 p-4 shadow-sm relative z-50">
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="md:hidden text-gray-600 hover:text-indigo-500 transition-colors duration-200"
        >
          <FaBars className="w-6 h-6" />
        </button>
        {/* Uncomment if search is needed
        <input
          type="text"
          placeholder="Search..."
          className="border p-2 rounded-2xl w-full max-w-xs bg-gray-50 focus:ring-2 focus:ring-indigo-400 transition duration-300 ease-in-out"
        />
        */}
      </div>

      <div className="flex space-x-4 sm:space-x-6 items-center relative z-10" ref={dropdownRef}>
        <div className="relative">
          <button
            onClick={() => toggleDropdown("notifications")}
            className="text-lg sm:text-xl text-gray-600 hover:text-indigo-500 transition-colors duration-200 ease-in-out relative"
          >
            <FaBell />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {dropdownOpen === "notifications" && (
            <div
              className="absolute right-0 mt-3 w-72 sm:w-80 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 ease-in-out"
              style={{ top: "100%", animation: "dropdownOpen 0.3s ease-out forwards" }}
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Mark All as Read
                  </button>
                )}
              </div>
              {loading ? (
                <div className="p-4 text-gray-500">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-gray-500">No notifications</div>
              ) : (
                <>
                  {notifications.slice(0, 4).map((notification) => (
                    <NavLink
                      key={notification._id}
                      to="/dashboard/notifications"
                      onClick={() => setDropdownOpen(null)}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 flex justify-between items-center transition-colors duration-150 ${
                        notification.isRead ? "bg-gray-50" : "bg-white font-bold"
                      }`}
                    >
                      <div>
                        <p
                          className={`text-sm ${
                            notification.isRead
                              ? "text-gray-500 font-normal"
                              : "text-gray-800 font-bold"
                          }`}
                        >
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
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

        <div
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition duration-200 ease-in-out"
          onClick={() => toggleDropdown("profile")}
        >
          {auth?.user?.photo ? (
            <img
              src={`data:${auth.user.photo.contentType};base64,${auth.user.photo.data}`}
              alt="User Profile"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 text-violet-600 rounded-full flex items-center justify-center text-base sm:text-lg font-medium">
              {auth?.user?.initials || "U"}
            </div>
          )}
        </div>

        {dropdownOpen === "profile" && (
          <div
            className="absolute right-0 mt-3 w-48 sm:w-56 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 ease-in-out"
            style={{ top: "100%", animation: "dropdownOpen 0.3s ease-out forwards" }}
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