import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const SubProjectAnalytics = ({ auth, mainProjectId }) => {
  const [statusCounts, setStatusCounts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API}/api/project/pro/sub-analytics/${mainProjectId}`,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
          }
        );
        console.log("API Response:", response.data);
        setStatusCounts(response.data.statusCounts || { totalSubProjects: 0, toDo: 0, inProgress: 0, completed: 0, overdueSubProjects: 0 });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching subproject analytics:", error.response?.data || error.message);
        toast.error("Failed to fetch subproject analytics.");
        setStatusCounts({ totalSubProjects: 0, toDo: 0, inProgress: 0, completed: 0, overdueSubProjects: 0 });
        setLoading(false);
      }
    };

    if (mainProjectId) {
      fetchAnalytics();
    } else {
      setStatusCounts({ totalSubProjects: 0, toDo: 0, inProgress: 0, completed: 0, overdueSubProjects: 0 });
      setLoading(false);
    }
  }, [auth.token, mainProjectId]);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!statusCounts || statusCounts.totalSubProjects === 0) {
    return <div className="text-center py-10 text-gray-500">No subprojects found for this project. Create some subprojects to view analytics.</div>;
  }

  const chartData = {
    labels: ["To Do", "In Progress", "Completed"],
    datasets: [
      {
        label: "Subproject Status",
        data: [statusCounts.toDo, statusCounts.inProgress, statusCounts.completed],
        backgroundColor: ["#6B7280", "#FBBF24", "#10B981"],
        borderColor: ["#4B5563", "#D97706", "#059669"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: { size: 14 },
          color: "#1F2937",
        },
      },
      tooltip: {
        backgroundColor: "#1F2937",
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
      },
      title: {
        display: true,
        text: "Subproject Status Distribution",
        font: { size: 16 },
        color: "#1F2937",
      },
    },
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Subproject Analytics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center justify-center border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700">Total Subprojects</h3>
          <p className="text-3xl font-bold text-indigo-600">{statusCounts.totalSubProjects}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center justify-center border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700">To Do</h3>
          <p className="text-3xl font-bold text-gray-600">{statusCounts.toDo}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center justify-center border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700">In Progress</h3>
          <p className="text-3xl font-bold text-yellow-600">{statusCounts.inProgress}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center justify-center border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700">Completed</h3>
          <p className="text-3xl font-bold text-green-600">{statusCounts.completed}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center justify-center border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700">Overdue</h3>
          <p className="text-3xl font-bold text-red-600">{statusCounts.overdueSubProjects}</p>
        </div>
      </div>
      {/* <div className="mt-6 bg-white rounded-lg shadow-md p-4 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Subproject Status Distribution</h3>
        <div style={{ maxWidth: "400px", margin: "0 auto" }}>
          <Pie data={chartData} options={chartOptions} />
        </div>
      </div> */}
    </div>
  );
};

export default SubProjectAnalytics;