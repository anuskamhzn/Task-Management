import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import axios from "axios";
import { useAuth } from "../../context/auth";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function Statistics({ refreshTrigger }) {
  const [auth] = useAuth();
  const [activeTab, setActiveTab] = useState("task");
  const [taskAnalytics, setTaskAnalytics] = useState(null);
  const [projectAnalytics, setProjectAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    // if (!auth.token) {
    //   setError("No authentication token available");
    //   setLoading(false);
    //   return;
    // }
    try {
      const taskResponse = await axios.get(`${process.env.REACT_APP_API}/api/task/ts/analytics`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setTaskAnalytics(taskResponse.data.analytics);

      const projectResponse = await axios.get(`${process.env.REACT_APP_API}/api/project/pro/analytics`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setProjectAnalytics(projectResponse.data.analytics);

      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to fetch analytics");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [auth.token, refreshTrigger]); // Refetch when auth.token or refreshTrigger changes

  const getChartData = () => {
    const analytics = activeTab === "task" ? taskAnalytics : projectAnalytics;
    if (!analytics) return null;

    const labels = ["To Do", "In Progress", "Completed"];
    const data = [analytics.statusCounts.toDo, analytics.statusCounts.inProgress, analytics.statusCounts.completed];

    const createGradient = (ctx, color1, color2) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);
      return gradient;
    };

    const ctx = document.getElementById("statistics-chart")?.getContext("2d");
    let gradientFill = null;

    if (ctx) {
      gradientFill =
        activeTab === "task"
          ? createGradient(ctx, "rgba(126, 34, 206, 0.4)", "rgba(126, 34, 206, 0.05)")
          : createGradient(ctx, "rgba(109, 40, 217, 0.4)", "rgba(109, 40, 217, 0.05)");
    }

    return {
      labels,
      datasets: [
        {
          label: `${activeTab === "task" ? "Tasks" : "Projects"} by Status`,
          data,
          borderColor: activeTab === "task" ? "rgba(126, 34, 206, 1)" : "rgba(109, 40, 217, 1)",
          backgroundColor:
            gradientFill || (activeTab === "task" ? "rgba(126, 34, 206, 0.2)" : "rgba(109, 40, 217, 0.2)"),
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: activeTab === "task" ? "#7e22ce" : "#6d28d9",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          font: {
            size: 13,
            weight: "bold",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 13,
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          padding: 8,
        },
        border: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          padding: 8,
        },
        border: {
          display: false,
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
    },
    layout: {
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      },
    },
  };

  const getSummaryData = () => {
    const analytics = activeTab === "task" ? taskAnalytics : projectAnalytics;
    if (!analytics) return null;

    const total = analytics.statusCounts.toDo + analytics.statusCounts.inProgress + analytics.statusCounts.completed;

    return [
      {
        label: "Total",
        value: total,
        icon: (
          <svg
            className="w-5 h-5 text-gray-700"
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
        ),
      },
      {
        label: "Completion Rate",
        value: total > 0 ? `${Math.round((analytics.statusCounts.completed / total) * 100)}%` : "0%",
        icon: (
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
        ),
      },
    ];
  };

  return (
    <div className="shadow-lg rounded-lg border bg-white overflow-hidden">
      <div className="border-b p-4 bg-gray-50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-purple-700"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          Statistics
        </h2>
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("task")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === "task"
                ? "bg-purple-700 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <svg
              className="w-4 h-4"
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
            <span className="font-medium">Tasks</span>
          </button>
          <button
            onClick={() => setActiveTab("project")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === "project"
                ? "bg-violet-700 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <svg
              className="w-4 h-4"
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
            <span className="font-medium">Projects</span>
          </button>
        </div>
      </div>
      {loading ? (
        <div className="flex flex-col justify-center items-center h-[300px] bg-gray-50/30">
          <svg
            className="animate-spin h-10 w-10 text-purple-700 mb-4"
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
          <p className="text-gray-500 font-medium">Loading statistics...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col justify-center items-center h-[300px] bg-red-50/30">
          <svg
            className="w-10 h-10 text-red-500 mb-4"
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
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      ) : (
        <div className="p-4">
          {getSummaryData() && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              {getSummaryData().map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{item.label}</p>
                    <p className="text-2xl font-bold">{item.value}</p>
                  </div>
                  <div className="bg-white p-3 rounded-full shadow-sm">{item.icon}</div>
                </div>
              ))}
            </div>
          )}
          <div className="h-[250px]">
            {getChartData() ? (
              <Line id="statistics-chart" data={getChartData()} options={chartOptions} />
            ) : (
              <div className="flex flex-col justify-center items-center h-full bg-gray-50/30 rounded-lg">
                <svg
                  className="w-12 h-12 text-gray-400 mb-3"
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
                <p className="text-gray-500 font-medium">No data available</p>
                <p className="text-gray-400 text-sm mt-1">
                  Try creating some {activeTab === "task" ? "tasks" : "projects"} first
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}