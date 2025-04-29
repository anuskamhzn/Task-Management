import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import axios from "axios";
import { useAuth } from "../../context/auth";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler, Title, Tooltip, Legend);

export default function AdminChart() {
  const [auth] = useAuth();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      // if (!auth?.token) {
      //   setError("No authentication token found.");
      //   setLoading(false);
      //   return;
      // }

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

        // Prepare data for the last 12 months
        const now = new Date();
        const labels = [];
        const taskData = [];
        const projectData = [];
        const trendData = []; // Combined tasks + projects for the line overlay
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
          labels.push(date.toLocaleString("default", { month: "short" }));
          const taskMonth = tasksPerMonth.find((item) => item._id === yearMonth);
          const projectMonth = projectsPerMonth.find((item) => item._id === yearMonth);
          const taskCount = taskMonth ? taskMonth.count : 0;
          const projectCount = projectMonth ? projectMonth.count : 0;
          taskData.push(taskCount);
          projectData.push(projectCount);
          trendData.push(taskCount + projectCount);
        }

        setChartData({
          labels,
          datasets: [
            {
              type: "bar",
              label: "Tasks",
              data: taskData,
              backgroundColor: "rgba(59, 130, 246, 0.6)", // Blue bars
              barThickness: 12,
              borderRadius: 4,
            },
            {
              type: "bar",
              label: "Projects",
              data: projectData,
              backgroundColor: "rgba(139, 92, 246, 0.6)", // Purple bars
              barThickness: 12,
              borderRadius: 4,
            },
            {
              type: "line",
              label: "Trend",
              data: trendData,
              borderColor: "#10B981", // Green line
              backgroundColor: "rgba(16, 185, 129, 0.1)", // Shaded area under the line
              fill: true,
              tension: 0.4, // Smooth curve
              pointRadius: 0, // Hide points
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
    return <div className="text-gray-600 text-center">Loading chart...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center">{error}</div>;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend to match the image
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Hide x-axis grid lines
        },
        ticks: {
          color: "#6B7280", // Gray text for month labels
          font: {
            size: 10,
          },
        },
      },
      y: {
        min: 0,
        max: 1200, // Match the image's y-axis range
        ticks: {
          stepSize: 300,
          color: "#6B7280", // Gray text for y-axis labels
          font: {
            size: 10,
          },
          callback: (value) => value.toLocaleString(), // Format numbers (e.g., 1200)
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)", // Light grid lines
        },
      },
    },
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,
      },
    },
  };

  return (
    <div className="relative w-full h-full">
      <Chart type="bar" data={chartData} options={options} />
    </div>
  );
}
