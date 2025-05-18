import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/auth';
import Navbar from '../../Components/Navigation/Navbar';
import Sidebar from '../../Components/Navigation/Sidebar';
import { NavLink } from 'react-router-dom';
import io from 'socket.io-client';
import { FaTrash, FaBell, FaCheckCircle, FaTimesCircle, FaLink } from 'react-icons/fa';
import { MdNotificationsActive } from 'react-icons/md';

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
      socketRef.current = io(process.env.REACT_APP_API, {
        auth: { token: auth.token },
      });

      socketRef.current.emit('joinNotificationRoom');

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

      socketRef.current.on('newNotification', (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + (notification.isRead ? 0 : 1));
        setPagination((prev) => ({
          ...prev,
          totalNotifications: prev.totalNotifications + 1,
          totalPages: Math.ceil((prev.totalNotifications + 1) / prev.limit),
        }));
      });

      socketRef.current.on('notificationRead', (updatedNotification) => {
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === updatedNotification._id ? updatedNotification : n
          )
        );
        setUnreadCount((prev) => (updatedNotification.isRead ? prev - 1 : prev));
      });

      socketRef.current.on('allNotificationsRead', () => {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
      });

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

      socketRef.current.on('notificationCountUpdate', ({ unreadCount }) => {
        setUnreadCount(unreadCount);
      });

      socketRef.current.on('error', ({ message }) => {
        console.error('Socket error:', message);
        setError(message);
        setLoading(false);
      });

      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [auth.token, auth.user]);

  const markAsRead = (notificationId) => {
    if (socketRef.current) {
      socketRef.current.emit('markNotificationAsRead', { notificationId }, (response) => {
        if (!response.success) {
          console.error('Error marking notification as read:', response.message);
        }
      });
    }
  };

  const markAllAsRead = () => {
    if (socketRef.current) {
      socketRef.current.emit('markAllNotificationsAsRead', (response) => {
        if (!response.success) {
          console.error('Error marking all notifications as read:', response.message);
        }
      });
    }
  };

  const openConfirmDialog = (notificationId, notificationMessage) => {
    setConfirmDialog({
      isOpen: true,
      notificationId,
      notificationMessage,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      notificationId: null,
      notificationMessage: '',
    });
  };

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

  const getReferenceLink = (notification) => {
    if (!notification.referenceType || !notification.referenceId) return null;
    const type = notification.referenceType.toLowerCase();
    if (type === 'project') return `/dashboard/projects/${notification.referenceId}`;
    if (type === 'task') return `/dashboard/tasks/${notification.referenceId}`;
    if (type === 'group') return `/dashboard/groups/${notification.referenceId}`;
    return null;
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white">
        <Sidebar />
      </aside>
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <MdNotificationsActive className="text-3xl text-indigo-600" />
                <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center space-x-2 text-sm bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 transition duration-200"
                >
                  <FaCheckCircle />
                  <span>Mark all as read</span>
                </button>
              )}
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 text-red-700 p-4 rounded-lg flex items-center space-x-2">
                <FaTimesCircle />
                <p>{error}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <FaBell className="mx-auto text-4xl text-gray-400 mb-2" />
                <p className="text-gray-500">No notifications found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, pagination.limit).map(notification => (
                  <div
                    key={notification._id}
                    className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                      notification.isRead
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-white border-indigo-100 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p
                          className={`text-sm ${
                            notification.isRead
                              ? 'text-gray-600'
                              : 'text-gray-900 font-medium'
                          }`}
                        >
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                        {getReferenceLink(notification) && (
                          <NavLink
                            to={getReferenceLink(notification)}
                            className="inline-flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 mt-2"
                          >
                            <FaLink className="text-xs" />
                            <span>View {notification.referenceType}</span>
                          </NavLink>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center space-x-1"
                          >
                            <FaCheckCircle />
                            <span>Mark as read</span>
                          </button>
                        )}
                        <button
                          onClick={() => openConfirmDialog(notification._id, notification.message)}
                          className="text-red-600 hover:text-red-800 flex items-center space-x-1"
                        >
                          <FaTrash />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200"
                >
                  Next
                </button>
              </div>
            )}
            {confirmDialog.isOpen && (
              <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-95 animate-in">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                    <FaTrash className="text-red-500" />
                    <span>Delete Notification</span>
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete "<span className="font-medium">{confirmDialog.notificationMessage}</span>"?
                    <span className="block text-sm text-red-500 mt-2">This action cannot be undone.</span>
                  </p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={closeConfirmDialog}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Notifications;