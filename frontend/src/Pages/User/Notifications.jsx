import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/auth';
import Navbar from '../../Components/Navigation/Navbar';
import Sidebar from '../../Components/Navigation/Sidebar';
import { NavLink } from 'react-router-dom';

const Notifications = () => {
  const [auth] = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalNotifications: 0,
    limit: 10,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notifications
  const fetchNotifications = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API}/api/notification`, {
        headers: { Authorization: `Bearer ${auth.token}` },
        params: { page, limit },
      });
      const { notifications, pagination } = response.data;
      setNotifications(notifications);
      setUnreadCount(notifications.filter(n => !n.isRead).length);
      setPagination(pagination);
      setError(null);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError(error.response?.data?.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.token) {
      fetchNotifications(pagination.currentPage, pagination.limit);
    }
  }, [auth.token, pagination.currentPage, pagination.limit]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${process.env.REACT_APP_API}/api/notification/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setNotifications(prev =>
        prev.map(n => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_API}/api/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  // Generate reference link based on referenceType
  const getReferenceLink = (notification) => {
    if (!notification.referenceType || !notification.referenceId) return null;
    const type = notification.referenceType.toLowerCase();
    if (type === 'project') return `/dashboard/projects/${notification.referenceId}`;
    if (type === 'task') return `/dashboard/tasks/${notification.referenceId}`;
    if (type === 'group') return `/dashboard/groups/${notification.referenceId}`;
    return null;
  };

  return (
    <div className="flex">
      <aside className="h-screen sticky top-0 w-64 bg-gray-800 text-white">
        <Sidebar />
      </aside>
      <div className="flex-1">
        <Navbar />
        <div className="max-w-6xl mx-auto p-6 bg-white shadow-md rounded-lg mt-6 ml-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold text-gray-800">Notifications</h1>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Mark all as read
              </button>
            )}
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : notifications.length === 0 ? (
            <p>No notifications found.</p>
          ) : (
            <div className="space-y-4">
              {notifications.map(notification => (
                <div
                  key={notification._id}
                  className={`p-4 border rounded-lg flex justify-between items-center ${notification.isRead ? 'bg-gray-50' : 'bg-white'}`}
                >
                  <div>
                    <p className={`text-sm ${notification.isRead ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                    {getReferenceLink(notification) && (
                      <NavLink
                        to={getReferenceLink(notification)}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        View {notification.referenceType}
                      </NavLink>
                    )}
                  </div>
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          {pagination.totalPages > 1 && (
            <div className="flex justify-between mt-6">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;