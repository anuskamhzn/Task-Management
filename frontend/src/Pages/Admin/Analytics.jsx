import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../Components/Navigation/AdminSidebar";
import AdminHeader from "../../Components/Navigation/AdminHeader";
import { useAuth } from "../../context/auth";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [auth] = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [tasksPerMonth, setTasksPerMonth] = useState([]);
  const [projectsPerMonth, setProjectsPerMonth] = useState([]);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("all"); // Date range filter
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!auth?.token) {
        // setError("No authentication token found. Please log in.");
        navigate("/login");
        return;
      }

      try {
        // Fetch website analytics
        const analyticsResponse = await axios.get(
          `${process.env.REACT_APP_API}/api/admin/analytics`,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
          }
        );
        setAnalytics(analyticsResponse.data.analytics);

        // Fetch tasks per month
        const tasksResponse = await axios.get(
          `${process.env.REACT_APP_API}/api/admin/chartTask`,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
          }
        );
        setTasksPerMonth(tasksResponse.data);

        // Fetch projects per month
        const projectsResponse = await axios.get(
          `${process.env.REACT_APP_API}/api/admin/chartProject`,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
          }
        );
        setProjectsPerMonth(projectsResponse.data);
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Session expired. Please log in again.");
          navigate("/login");
        } else {
          setError(err.response?.data?.message || "Error fetching analytics");
        }
      }
    };

    fetchData();
  }, [auth, navigate]);

  // Filter tasks and projects based on date range
  const filterByDateRange = (data) => {
    const now = new Date();
    let startDate;
    switch (dateRange) {
      case "30days":
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case "90days":
        startDate = new Date(now.setDate(now.getDate() - 90));
        break;
      case "year":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        return data; // Return all data for "all"
    }
    return data.filter((item) => new Date(item._id + "-01") >= startDate);
  };

  const filteredTasksPerMonth = filterByDateRange(tasksPerMonth);
  const filteredProjectsPerMonth = filterByDateRange(projectsPerMonth);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-600 text-lg font-semibold bg-white p-4 rounded-lg shadow-md">
          {error}
        </div>
      </div>
    );
  }

  // Chart Data and Options
  const barData = {
    labels: ["Users", "Tasks", "Projects", "Subtasks", "Subprojects"],
    datasets: [
      {
        label: "Total Counts",
        data: [
          analytics?.users.totalUsers || 0,
          analytics?.tasks.totalTasks || 0,
          analytics?.projects.totalProjects || 0,
          analytics?.subTasks.totalSubTasks || 0,
          analytics?.subProjects.totalSubProjects || 0,
        ],
        backgroundColor: ["#3b82f6", "#ef4444", "#facc15", "#10b981", "#8b5cf6"],
        borderColor: ["#1e40af", "#b91c1c", "#ca8a04", "#047857", "#6d28d9"],
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: "New/Overdue",
        data: [
          analytics?.users.newUsers || 0,
          analytics?.tasks.overdueTasks || 0,
          analytics?.projects.overdueProjects || 0,
          analytics?.subTasks.overdueSubTasks || 0,
          analytics?.subProjects.overdueSubProjects || 0,
        ],
        backgroundColor: ["#10b981", "#f97316", "#8b5cf6", "#ef4444", "#3b82f6"],
        borderColor: ["#047857", "#c2410c", "#6d28d9", "#b91c1c", "#1e40af"],
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { color: "#1f2937", font: { size: 14 } } },
      title: {
        display: true,
        text: "Overview of Website Metrics",
        color: "#1f2937",
        font: { size: 18, weight: "bold" },
        padding: { top: 10, bottom: 20 },
      },
      tooltip: { backgroundColor: "#1f2937", titleFont: { size: 14 }, bodyFont: { size: 12 } },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Count", color: "#1f2937", font: { size: 14 } },
        ticks: { color: "#1f2937", font: { size: 12 } },
        grid: { color: "#e5e7eb" },
      },
      x: {
        title: { display: true, text: "Category", color: "#1f2937", font: { size: 14 } },
        ticks: { color: "#1f2937", font: { size: 12 } },
        grid: { display: false },
      },
    },
    animation: { duration: 1000, easing: "easeOutQuart" },
  };

  const pieData = (type) => ({
    labels: ["To Do", "In Progress", "Completed"],
    datasets: [
      {
        label: `${type} Status`,
        data: [
          analytics?.[type].statusCounts.toDo || 0,
          analytics?.[type].statusCounts.inProgress || 0,
          analytics?.[type].statusCounts.completed || 0,
        ],
        backgroundColor: ["#ef4444", "#3b82f6", "#10b981"],
        borderColor: ["#b91c1c", "#1e40af", "#047857"],
        borderWidth: 1,
        hoverOffset: 20,
      },
    ],
  });

  const pieOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { color: "#1f2937", font: { size: 14 } } },
      title: {
        display: true,
        text: title,
        color: "#1f2937",
        font: { size: 16, weight: "bold" },
        padding: { top: 10, bottom: 20 },
      },
      tooltip: { backgroundColor: "#1f2937", titleFont: { size: 14 }, bodyFont: { size: 12 } },
    },
    animation: { duration: 800, easing: "easeInOutQuad" },
  });

  const months = Array.from(
    new Set([
      ...filteredTasksPerMonth.map((item) => item._id),
      ...filteredProjectsPerMonth.map((item) => item._id),
    ])
  ).sort();

  const lineData = {
    labels: months,
    datasets: [
      {
        label: "Tasks Created",
        data: months.map(
          (month) =>
            filteredTasksPerMonth.find((item) => item._id === month)?.count || 0
        ),
        fill: false,
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f6",
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "Projects Created",
        data: months.map(
          (month) =>
            filteredProjectsPerMonth.find((item) => item._id === month)?.count || 0
        ),
        fill: false,
        borderColor: "#ef4444",
        backgroundColor: "#ef4444",
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { color: "#1f2937", font: { size: 14 } } },
      title: {
        display: true,
        text: "Tasks and Projects Creation Trend",
        color: "#1f2937",
        font: { size: 18, weight: "bold" },
        padding: { top: 10, bottom: 20 },
      },
      tooltip: { backgroundColor: "#1f2937", titleFont: { size: 14 }, bodyFont: { size: 12 } },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Count", color: "#1f2937", font: { size: 14 } },
        ticks: { color: "#1f2937", font: { size: 12 } },
        grid: { color: "#e5e7eb" },
      },
      x: {
        title: { display: true, text: "Month", color: "#1f2937", font: { size: 14 } },
        ticks: { color: "#1f2937", font: { size: 12 } },
        grid: { display: false },
      },
    },
    animation: { duration: 1200, easing: "easeOutQuart" },
  };

  return (
    <div className="min-h-screen bg-gray-100 flex transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-6">
        <AdminHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
                Analytics Dashboard
              </h2>
              <div className="flex items-center space-x-4">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
            </div>
          </div>

          {/* Summary Metrics */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Summary Metrics
            </h3>
            <div className="h-80">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Status Distribution
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { type: "tasks", title: "Task Status" },
                { type: "projects", title: "Project Status" },
                { type: "subTasks", title: "Subtask Status" },
                { type: "subProjects", title: "Subproject Status" },
              ].map(({ type, title }) => (
                <div key={type} className="bg-gray-50 rounded-lg p-4 h-64">
                  <h4 className="text-md font-medium text-gray-700 mb-4">
                    {title}
                  </h4>
                  <Pie data={pieData(type)} options={pieOptions(title)} />
                </div>
              ))}
            </div>
          </div>

          {/* Trend Analysis */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Creation Trends
            </h3>
            <div className="h-80">
              <Line data={lineData} options={lineOptions} />
            </div>
          </div>

          {/* User Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Top Active Users
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["Name", "Email", "Tasks Owned", "Projects Owned"].map(
                      (header) => (
                        <th
                          key={header}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics?.users.userActivity.map((user) => (
                    <tr
                      key={user.email}
                      className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                      onClick={() => navigate(`/dashboard/users-info/${user._id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.taskCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.projectCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;