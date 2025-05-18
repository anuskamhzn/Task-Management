import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../Components/Navigation/AdminSidebar";
import AdminHeader from "../../Components/Navigation/AdminHeader";
import { useAuth } from "../../context/auth";
import { FaTrash, FaTimes } from "react-icons/fa";

export default function Users() {
  const [auth, setAuth] = useAuth();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    userId: null,
    userName: "",
  });
  const [userPopup, setUserPopup] = useState({
    isOpen: false,
    user: null,
    loading: false,
    error: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!auth?.token) {
        setError("Session expired. Please log in again.");
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(`${process.env.REACT_APP_API}/api/admin/users`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setUsers(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          setAuth({ token: null, user: null });
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setError("Session expired. Please log in again.");
          navigate("/login");
        } else {
          setError(err.response?.data?.message || "Error fetching users");
        }
      }
    };

    fetchUsers();
  }, [auth, setAuth, navigate]);

  const openConfirmDialog = (userId, userName) => {
    setConfirmDialog({
      isOpen: true,
      userId,
      userName,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      userId: null,
      userName: "",
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDialog.userId) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API}/api/admin/users/${confirmDialog.userId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setUsers(users.filter((user) => user._id !== confirmDialog.userId));
      closeConfirmDialog();
    } catch (err) {
      if (err.response?.status === 401) {
        setAuth({ token: null, user: null });
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        setError(err.response?.data?.message || "Error deleting user");
      }
    }
  };

  const openUserPopup = async (userId) => {
    setUserPopup({ isOpen: true, user: null, loading: true, error: null });
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/api/admin/users-info/${userId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setUserPopup({ isOpen: true, user: response.data.user, loading: false, error: null });
    } catch (err) {
      if (err.response?.status === 401) {
        setAuth({ token: null, user: null });
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        setUserPopup({
          isOpen: true,
          user: null,
          loading: false,
          error: err.response?.data?.message || "Error fetching user details",
        });
      }
    }
  };

  const closeUserPopup = () => {
    setUserPopup({ isOpen: false, user: null, loading: false, error: null });
  };

  const filteredUsers = (users || []).filter(
    (user) =>
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-sm text-red-600 text-lg font-semibold">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-6">
        <AdminHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">All Users</h2>
            <button
              onClick={() => navigate("/dashboard/admin")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors duration-200"
            >
              Back to Dashboard
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username or email..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              )}
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
            </div>
          </div>

          {/* List View */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Name", "Email", "Joined Date", "Actions"].map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.map((user, index) => (
                  <tr
                    key={user._id}
                    className={`transition-colors duration-150 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100`}
                  >
                    <td
                      className="px-6 py-4 whitespace-nowrap cursor-pointer"
                      onClick={() => openUserPopup(user._id)}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                          {user.initials || "U"}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name || "Unknown"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt && !isNaN(new Date(user.createdAt).getTime())
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openConfirmDialog(user._id, user.username || "Unknown")}
                        className="text-red-600 hover:text-red-800 transition-colors duration-150"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center p-6">
              <nav className="flex space-x-2">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => paginate(index + 1)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      currentPage === index + 1
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } transition-colors duration-200`}
                  >
                    {index + 1}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm transform transition-all animate-fade-in">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Delete User</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "<span className="font-medium">{confirmDialog.userName}</span>"?
                <span className="block text-sm text-red-500 mt-1">This action cannot be undone.</span>
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeConfirmDialog}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {userPopup.isOpen && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all animate-fade-in">
              <h2 className="text-xl font-bold text-gray-800 mb-4">User Details</h2>
              {userPopup.loading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ) : userPopup.error ? (
                <div className="text-red-600">{userPopup.error}</div>
              ) : userPopup.user ? (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium text-lg">
                      {userPopup.user.initials || "U"}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {userPopup.user.name || "Unknown"}
                      </h3>
                      <p className="text-sm text-gray-500">{userPopup.user.email}</p>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>{" "}
                    {userPopup.user.email || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Joined Date:</span>{" "}
                    {userPopup.user.createdAt && !isNaN(new Date(userPopup.user.createdAt).getTime())
                      ? new Date(userPopup.user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>
              ) : (
                <div className="text-gray-600">No user data available.</div>
              )}
              <div className="flex justify-end mt-6">
                <button
                  onClick={closeUserPopup}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Tailwind Animation */}
      <style>
        {`
          .animate-fade-in {
            animation: fadeIn 0.3s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}