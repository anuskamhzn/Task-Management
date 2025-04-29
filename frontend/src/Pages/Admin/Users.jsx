import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../Components/Navigation/AdminSidebar";
import AdminHeader from "../../Components/Navigation/AdminHeader";
import { useAuth } from "../../context/auth";

export default function Users() {
  const [auth, setAuth] = useAuth();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    userId: null,
    userName: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!auth?.token) {
        // setError("No authentication token found. Please log in.");
        setLoading(false);
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API}/api/admin/users`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        console.log('API response:', response.data);
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
      } finally {
        setLoading(false);
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

  const filteredUsers = (users || []).filter(
    (user) =>
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!filteredUsers.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">No users found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex transition-colors duration-200">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-6">
        <AdminHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">All Users</h2>
            <button
              onClick={() => navigate("/dashboard/admin")}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors duration-200"
            >
              Back to Dashboard
            </button>
          </div>
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
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
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
                      {/* <button className="text-blue-600 hover:text-blue-800 mr-3 transition-colors duration-150">
                        Edit
                      </button> */}
                      <button
                        onClick={() => openConfirmDialog(user._id, user.username || "Unknown")}
                        className="text-red-600 hover:text-red-800 transition-colors duration-150"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm transform transition-all">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Delete User</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "<span className="font-medium">{confirmDialog.userName}</span>"?
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
      </main>
    </div>
  );
}