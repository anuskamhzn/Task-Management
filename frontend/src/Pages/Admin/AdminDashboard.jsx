import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../Components/Navigation/AdminSidebar";
import AdminHeader from "../../Components/Navigation/AdminHeader";
import Metrics from "../../Components/Admin/Metrics";
import AdminOverview from "../../Components/Admin/AdminOverview";
import { useAuth } from "../../context/auth";

export default function AdminDashboard() {
  const [auth, setAuth] = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentUsers, setRecentUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!auth?.token) {
        // setError("No authentication token found. Please log in.");
        setLoading(false);
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        // Fetch analytics
        const analyticsResponse = await axios.get(`${process.env.REACT_APP_API}/api/admin/analytics`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setAnalytics(analyticsResponse.data.analytics);

        // Fetch recent users
        const usersResponse = await axios.get(`${process.env.REACT_APP_API}/api/admin/recent-users`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setRecentUsers(usersResponse.data.recentUsers);
      } catch (err) {
        if (err.response?.status === 401) {
          setAuth({ token: null, user: null });
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setError("Session expired. Please log in again.");
          navigate("/login");
        } else {
          setError(err.response?.data?.message || "Error fetching data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [auth, setAuth, navigate]);

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-gray-600">Loading...</div>
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-6">
        {/* Header */}
        <AdminHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* Metrics */}
        <Metrics analytics={analytics} />

        {/* Admin Overview */}
        <AdminOverview analytics={analytics} />

        {/* Recent Users Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">Recent Users</h2>
            <button
              onClick={() => navigate("/dashboard/users")}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors duration-200"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Name", "Email", "Joined Date"].map((header) => (
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
                {recentUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                          {user.initials}
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
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-800 mr-3 transition-colors duration-150">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-800 transition-colors duration-150">Delete</button>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
