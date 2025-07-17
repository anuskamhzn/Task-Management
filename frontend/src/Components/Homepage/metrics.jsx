import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/auth";

export function Metrics({ refreshTrigger }) {
  const [auth, setAuth] = useAuth();
  const [activeTab, setActiveTab] = useState("task");
  const [taskMetrics, setTaskMetrics] = useState([
    { title: "Total Task", value: "0", color: "bg-violet-100 border-violet-200", icon: "total" },
    { title: "To Do", value: "0", color: "bg-blue-50 border-blue-200", icon: "todo" },
    { title: "In Progress", value: "0", color: "bg-amber-50 border-amber-200", icon: "progress" },
    { title: "Completed", value: "0", color: "bg-emerald-50 border-emerald-200", icon: "completed" },
  ]);
  const [projectMetrics, setProjectMetrics] = useState([
    { title: "Total Project", value: "0", color: "bg-violet-100 border-violet-200", icon: "total" },
    { title: "To Do", value: "0", color: "bg-blue-50 border-blue-200", icon: "todo" },
    { title: "In Progress", value: "0", color: "bg-amber-50 border-amber-200", icon: "progress" },
    { title: "Completed", value: "0", color: "bg-emerald-50 border-emerald-200", icon: "completed" },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = async () => {
    if (!auth.token) {
      setLoading(false);
      return;
    }
    try {
      const taskResponse = await axios.get(`${process.env.REACT_APP_API}/api/task/ts/status-counts`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      const taskData = taskResponse.data.statusCounts;

      setTaskMetrics([
        {
          title: "Total Task",
          value: taskData.totalTasks.toString(),
          color: "bg-violet-100 border-violet-200",
          icon: "total",
        },
        { title: "To Do", value: taskData.toDo.toString(), color: "bg-blue-50 border-blue-200", icon: "todo" },
        {
          title: "In Progress",
          value: taskData.inProgress.toString(),
          color: "bg-amber-50 border-amber-200",
          icon: "progress",
        },
        {
          title: "Completed",
          value: taskData.completed.toString(),
          color: "bg-emerald-50 border-emerald-200",
          icon: "completed",
        },
      ]);

      const projectResponse = await axios.get(`${process.env.REACT_APP_API}/api/project/pro/total-counts`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      const projectData = projectResponse.data.statusCounts;

      setProjectMetrics([
        {
          title: "Total Project",
          value: projectData.totalProjects.toString(),
          color: "bg-violet-100 border-violet-200",
          icon: "total",
        },
        { title: "To Do", value: projectData.toDo.toString(), color: "bg-blue-50 border-blue-200", icon: "todo" },
        {
          title: "In Progress",
          value: projectData.inProgress.toString(),
          color: "bg-amber-50 border-amber-200",
          icon: "progress",
        },
        {
          title: "Completed",
          value: projectData.completed.toString(),
          color: "bg-emerald-50 border-emerald-200",
          icon: "completed",
        },
      ]);

      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to fetch metrics");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [refreshTrigger]); // Refetch when refreshTrigger changes

  const metrics = activeTab === "task" ? taskMetrics : projectMetrics;

  const renderIcon = (iconType) => {
    switch (iconType) {
      case "total":
        return (
          <svg
            className="w-5 h-5 text-gray-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        );
      case "todo":
        return (
          <svg
            className="w-5 h-5 text-blue-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        );
      case "progress":
        return (
          <svg
            className="w-5 h-5 text-amber-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 2h14M5 22h14M8 5h8v7a4 4 0 0 1-8 0V5z" />
            <path d="M8 19h8v-7a4 4 0 0 0-8 0v7z" />
          </svg>
        );
      case "completed":
        return (
          <svg
            className="w-5 h-5 text-emerald-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <svg
            className="w-6 h-6 mr-2 text-purple-700"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20V10"></path>
            <path d="M18 20V4"></path>
            <path d="M6 20v-4"></path>
          </svg>
          Performance Metrics
        </h2>
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("task")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
              activeTab === "task"
                ? "bg-violet-700 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            <span className="font-medium">My Tasks</span>
          </button>
          <button
            onClick={() => setActiveTab("project")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
              activeTab === "project"
                ? "bg-violet-700 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span className="font-medium">Team Projects</span>
          </button>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <svg
            className="animate-spin h-8 w-8 text-purple-700"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      ) : error ? (
        <div className="text-red-600 py-4 flex items-center justify-center">
          <svg
            className="w-5 h-5 mr-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.title}
              className={`rounded-lg border p-6 shadow-sm hover:shadow-md transition-all ${metric.color}`}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-medium text-gray-600">{metric.title}</h3>
                {renderIcon(metric.icon)}
              </div>
              <p className="mt-4 text-3xl font-bold">{metric.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}