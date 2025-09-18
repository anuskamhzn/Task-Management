import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/auth";
import Navbar from "../../Components/Navigation/Navbar";
import Sidebar from "../../Components/Navigation/Sidebar";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const UserInfo = () => {
  const [auth, setAuth] = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!auth.token) {
        setLoading(false);
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
          try {
            const refreshResponse = await axios.post(
              `${process.env.REACT_APP_API}/api/auth/refresh-token`,
              { refreshToken: auth.refreshToken }
            );
            const newToken = refreshResponse.data.accessToken;
            localStorage.setItem("auth", JSON.stringify({ ...auth, token: newToken }));
            setAuth({ ...auth, token: newToken });
            fetchUserInfo(); // Retry fetching with new token
          } catch (refreshErr) {
            console.error("Error refreshing token:", refreshErr);
            setError("Session expired. Please log in again.");
            localStorage.removeItem("auth");
            window.location.href = "/login";
          }
        } else {
          setError(err.response?.data?.message || "Error fetching user data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [auth.token, auth.refreshToken, setAuth]);

  if (!auth.token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out md:sticky md:top-0 md:transform-none ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <Sidebar />
        </aside>
        <div className="flex-1 flex flex-col">
          <Navbar toggleSidebar={toggleSidebar} />
          <main className="flex-1 p-4 sm:p-6">
            <div className="max-w-2xl sm:max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-6 sm:p-8">
              <div className="h-8 sm:h-10 w-1/2 bg-gray-200 rounded animate-pulse mb-4 sm:mb-6"></div>
              <div className="space-y-3 sm:space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="w-24 sm:w-32 h-5 sm:h-6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex-1 h-5 sm:h-6 bg-gray-200 rounded animate-pulse ml-3 sm:ml-4"></div>
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
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-600 text-base sm:text-lg font-medium bg-red-100 px-6 sm:px-8 py-3 sm:py-4 rounded-lg shadow-md"
        >
          Error: {error}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out md:sticky md:top-0 md:transform-none ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <Sidebar />
      </aside>
      <div className="flex-1 flex flex-col">
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl sm:max-w-3xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden"
                >
                  {user?.photo ? (
                    <img
                      src={user.photo}
                      alt="User Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl sm:text-2xl font-bold text-gray-600">
                      {user?.initials || "U"}
                    </span>
                  )}
                </motion.div>
                <div className="text-center sm:text-left">
                  <h1 className="text-xl sm:text-2xl font-bold text-white">
                    {user?.name || "User Profile"}
                  </h1>
                  <p className="text-blue-100 text-sm sm:text-base mt-1">
                    Manage your account details
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm">
              <div className="space-y-3 sm:space-y-4">
                {[
                  { label: "Name", value: user?.name },
                  { label: "Email", value: user?.email },
                  { label: "Phone", value: user?.phone },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: 5 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <strong className="w-full sm:w-28 font-semibold text-gray-700 mb-1 sm:mb-0">
                      {item.label}:
                    </strong>
                    <span className="text-gray-900 text-sm sm:text-base">
                      {item.value || "N/A"}
                    </span>
                  </motion.div>
                ))}
              </div>
              {/* <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 sm:mt-6 w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
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