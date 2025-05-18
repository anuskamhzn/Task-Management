import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import axios from "axios";
import { useAuth } from "../../context/auth";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

export default function AdminChart() {
  const [auth] = useAuth();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      if (!auth?.token) {
        setError("No authentication token found.");
        setLoading(false);
        return;
      }

      try {
        // Fetch tasks per month
        const taskResponse = await axios.get(`${process.env.REACT_APP_API}/api/admin/chartTask`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        const tasksPerMonth = taskResponse.data;

        // Fetch projects per month
        const projectResponse = await axios.get(`${process.env.REACT_APP_API}/api/admin/chartProject`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        const projectsPerMonth = projectResponse.data;

        // Fetch users per month
        const userResponse = await axios.get(`${process.env.REACT_APP_API}/api/admin/chartUser`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        const usersPerMonth = userResponse.data;

        // Prepare data for the last 12 months
        const now = new Date();
        const labels = [];
        const taskData = [];
        const projectData = [];
        const userData = [];
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
          labels.push(date.toLocaleString("default", { month: "short" }));
          const taskMonth = tasksPerMonth.find((item) => item._id === yearMonth);
          const projectMonth = projectsPerMonth.find((item) => item._id === yearMonth);
          const userMonth = usersPerMonth.find((item) => item._id === yearMonth);
          taskData.push(taskMonth ? taskMonth.count : 0);
          projectData.push(projectMonth ? projectMonth.count : 0);
          userData.push(userMonth ? userMonth.count : 0);
        }

        setChartData({
          labels,
          datasets: [
            {
              label: "Tasks",
              data: taskData,
              borderColor: "rgba(59, 130, 246, 1)", // Blue
              backgroundColor: "rgba(59, 130, 246, 0.2)",
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
            {
              label: "Projects",
              data: projectData,
              borderColor: "rgba(139, 92, 246, 1)", // Purple
              backgroundColor: "rgba(139, 92, 246, 0.2)",
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
            {
              label: "Users",
              data: userData,
              borderColor: "rgba(16, 185, 129, 1)", // Green
              backgroundColor: "rgba(16, 185, 129, 0.2)",
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        });
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching chart data");
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [auth]);

  if (loading) {
    return <div className="text-gray-600 text-center animate-pulse">Loading chart...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center">{error}</div>;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#1f2937",
          font: { size: 12 },
        },
      },
      title: {
        display: true,
        text: "Tasks, Projects, and Users Created (Last 12 Months)",
        color: "#1f2937",
        font: { size: 16, weight: "bold" },
        padding: { top: 10, bottom: 10 },
      },
      tooltip: {
        backgroundColor: "#1f2937",
        titleFont: { size: 12 },
        bodyFont: { size: 10 },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Month",
          color: "#1f2937",
          font: { size: 12 },
        },
        ticks: {
          color: "#1f2937",
          font: { size: 10 },
        },
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Count",
          color: "#1f2937",
          font: { size: 12 },
        },
        ticks: {
          color: "#1f2937",
          font: { size: 10 },
          callback: (value) => value.toLocaleString(),
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
    },
    animation: {
      duration: 800,
      easing: "easeOutQuart",
    },
  };

  return (
    <div className="relative w-full h-full">
      <Line data={chartData} options={options} />
    </div>
  );
}