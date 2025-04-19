import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/auth';
import Navbar from '../../Components/Navigation/Navbar';
import Sidebar from '../../Components/Navigation/Sidebar';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const UserInfo = () => {
  const [auth, setAuth] = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!auth.token) {
        return;
      }

      try {
        const response = await axios.get(`${process.env.REACT_APP_API}/api/auth/user-info`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });

        setUser(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          fetchUserInfo();
        } else {
          setError(err.response?.data?.message || 'Error fetching user data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [auth.token]);

  if (!auth.token) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 p-6">
            <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8">
              <div className="h-10 w-1/2 bg-gray-200 rounded animate-pulse mb-6"></div>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex-1 h-6 bg-gray-200 rounded animate-pulse ml-4"></div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-600 text-lg font-medium bg-red-100 px-8 py-4 rounded-lg shadow-md"
        >
          Error: {error}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-4 sm:p-6">
          <motion.div
            className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div
                  whileHover={{ scale: 1.05 }}
                  className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden"
                >
                  {user?.avatar ? (
                    <img src={user.photo} alt="User Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-gray-600">
                      {user?.initials}
                    </span>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">{user?.name || 'User Profile'}</h1>
                  <p className="text-blue-100 mt-1">Manage your account details</p>
                </div>
              </div>
            </div>
            <div className="p-6 sm:p-8 bg-white/80 backdrop-blur-sm">
              <div className="space-y-4">
                {[
                  { label: 'Name', value: user?.name },
                  { label: 'Email', value: user?.email },
                  // { label: 'Username', value: user?.username },
                  { label: 'Phone', value: user?.phone },
                ].map((item, index) => (
                  <div
                    key={index}
                    whileHover={{ x: 5 }}
                    className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <strong className="w-28 sm:w-32 font-semibold text-gray-700">{item.label}:</strong>
                    <span className="text-gray-900">{item.value || 'N/A'}</span>
                  </div>
                ))}
              </div>
              {/* <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </motion.button> */}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default UserInfo;