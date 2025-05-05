import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/auth';
import Navbar from '../../Components/Navigation/Navbar';
import Sidebar from '../../Components/Navigation/Sidebar';
import { NavLink } from 'react-router-dom';
import io from 'socket.io-client';
import { FaTrash } from 'react-icons/fa';

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
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    notificationId: null,
    notificationMessage: '',
  });
  const socketRef = useRef(null);

  // Initialize Socket.IO and set up event listeners
  useEffect(() => {
    if (auth.token && auth.user) {
      // Initialize Socket.IO connection
      socketRef.current = io(process.env.REACT_APP_API, {
        auth: { token: auth.token },
      });

      // Join notification room
      socketRef.current.emit('joinNotificationRoom');

      // Listen for initial notifications
      socketRef.current.on('initialNotifications', ({ notifications, unreadCount }) => {
        setNotifications(notifications);
        setUnreadCount(unreadCount);
        setPagination((prev) => ({
          ...prev,
          totalNotifications: notifications.length,
          totalPages: Math.ceil(notifications.length / prev.limit),
        }));
        setLoading(false);
      });

      // Listen for new notifications
      socketRef.current.on('newNotification', (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + (notification.isRead ? 0 : 1));
        setPagination((prev) => ({
          ...prev,
          totalNotifications: prev.totalNotifications + 1,
          totalPages: Math.ceil((prev.totalNotifications + 1) / prev.limit),
        }));
      });

      // Listen for notification read
      socketRef.current.on('notificationRead', (updatedNotification) => {
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === updatedNotification._id ? updatedNotification : n
          )
        );
        setUnreadCount((prev) => (updatedNotification.isRead ? prev - 1 : prev));
      });

      // Listen for all notifications read
      socketRef.current.on('allNotificationsRead', () => {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
      });

      // Listen for notification deleted
      socketRef.current.on('notificationDeleted', ({ notificationId }) => {
        setNotifications((prev) => {
          const updated = prev.filter((n) => n._id !== notificationId);
          return updated;
        });
        setPagination((prev) => ({
          ...prev,
          totalNotifications: prev.totalNotifications - 1,
          totalPages: Math.ceil((prev.totalNotifications - 1) / prev.limit),
        }));
      });

      // Listen for notification count updates
      socketRef.current.on('notificationCountUpdate', ({ unreadCount }) => {
        setUnreadCount(unreadCount);
      });

      // Handle errors
      socketRef.current.on('error', ({ message }) => {
        console.error('Socket error:', message);
        setError(message);
        setLoading(false);
      });

      // Cleanup on unmount
      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [auth.token, auth.user]);

  // Mark a single notification as read
  const markAsRead = (notificationId) => {
    if (socketRef.current) {
      socketRef.current.emit('markNotificationAsRead', { notificationId }, (response) => {
        if (!response.success) {
          console.error('Error marking notification as read:', response.message);
        }
      });
    }
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    if (socketRef.current) {
      socketRef.current.emit('markAllNotificationsAsRead', (response) => {
        if (!response.success) {
          console.error('Error marking all notifications as read:', response.message);
        }
      });
    }
  };

  // Open confirmation dialog for deletion
  const openConfirmDialog = (notificationId, notificationMessage) => {
    setConfirmDialog({
      isOpen: true,
      notificationId,
      notificationMessage,
    });
  };

  // Close confirmation dialog
  const closeConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      notificationId: null,
      notificationMessage: '',
    });
  };

  // Handle confirmed deletion
  const handleConfirmDelete = () => {
    if (socketRef.current && confirmDialog.notificationId) {
      socketRef.current.emit('deleteNotification', { notificationId: confirmDialog.notificationId }, (response) => {
        if (!response.success) {
          console.error('Error deleting notification:', response.message);
          setError(response.message);
        }
      });
    }
    closeConfirmDialog();
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && socketRef.current) {
      setLoading(true);
      socketRef.current.emit(
        'fetchMoreNotifications',
        { page: newPage, limit: pagination.limit },
        (response) => {
          if (response.success) {
            setNotifications(response.notifications);
            setPagination((prev) => ({
              ...prev,
              currentPage: newPage,
              totalPages: response.pagination.totalPages,
              totalNotifications: response.pagination.totalNotifications,
            }));
            setLoading(false);
          } else {
            console.error('Error fetching more notifications:', response.message);
            setError(response.message);
            setLoading(false);
          }
        }
      );
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
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : notifications.length === 0 ? (
            <p className="text-gray-500">No notifications found.</p>
          ) : (
            <div className="space-y-4">
              {notifications.slice(0, pagination.limit).map(notification => (
                <div
                  key={notification._id}
                  className={`p-4 border rounded-lg flex justify-between items-center transition-colors duration-150 ${
                    notification.isRead ? 'bg-gray-50' : 'bg-white font-bold'
                  }`}
                >
                  <div>
                    <p
                      className={`text-sm ${
                        notification.isRead
                          ? 'text-gray-500 font-normal'
                          : 'text-gray-800 font-bold'
                      }`}
                    >
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
                  <div className="flex space-x-2">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Mark as read
                      </button>
                    )}
                    <button
                      onClick={() => openConfirmDialog(notification._id, notification.message)}
                      className="text-sm text-red-600 hover:text-red-800 flex items-center"
                    >
                      <FaTrash className="mr-1" /> Delete
                    </button>
                  </div>
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
          {/* Custom Confirmation Dialog */}
          {confirmDialog.isOpen && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm transform transition-all">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Delete Notification</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "<span className="font-medium">{confirmDialog.notificationMessage}</span>"?
                  <span className="block text-sm text-red-500 mt-1">This action cannot be undone.</span>
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={closeConfirmDialog}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition focus:outline-none focus:ring-2 focus:ring-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;