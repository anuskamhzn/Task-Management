import { useState, useEffect } from "react";
import { FaTasks } from "react-icons/fa";
import { GrProjects } from "react-icons/gr";
import axios from "axios";
import { useAuth } from "../../context/auth";

export function Metrics() {
  const [auth, setAuth] = useAuth();
  const [activeTab, setActiveTab] = useState("task");
  const [taskMetrics, setTaskMetrics] = useState([
    { title: "Total Task", value: "0", color: "bg-gray-200" },
    { title: "To Do", value: "0", color: "bg-blue-100 text-blue-700" },
    { title: "In Progress", value: "0", color: "bg-yellow-100 text-yellow-700" },
    { title: "Completed", value: "0", color: "bg-green-100 text-green-700" },
  ]);
  const [projectMetrics, setProjectMetrics] = useState([
    { title: "Total Project", value: "0", color: "bg-gray-200" },
    { title: "To Do", value: "0", color: "bg-blue-100 text-blue-700" },
    { title: "In Progress", value: "0", color: "bg-yellow-100 text-yellow-700" },
    { title: "Completed", value: "0", color: "bg-green-100 text-green-700" },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch metrics from the backend
  const fetchMetrics = async () => {
    if (!auth.token) {
      return;
    }
    try {
      // Fetch task metrics
      const taskResponse = await axios.get(`${process.env.REACT_APP_API}/api/task/ts/status-counts`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      const taskData = taskResponse.data.statusCounts;

      setTaskMetrics([
        { title: "Total Task", value: taskData.totalTasks.toString(), color: "bg-gray-200" },
        { title: "To Do", value: taskData.toDo.toString(), color: "bg-blue-100 text-blue-700" },
        { title: "In Progress", value: taskData.inProgress.toString(), color: "bg-yellow-100 text-yellow-700" },
        { title: "Completed", value: taskData.completed.toString(), color: "bg-green-100 text-green-700" },
      ]);

      // Fetch project metrics
      const projectResponse = await axios.get(`${process.env.REACT_APP_API}/api/project/pro/total-counts`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      const projectData = projectResponse.data.statusCounts;

      setProjectMetrics([
        { title: "Total Project", value: projectData.totalProjects.toString(), color: "bg-gray-200" },
        { title: "To Do", value: projectData.toDo.toString(), color: "bg-blue-100 text-blue-700" },
        { title: "In Progress", value: projectData.inProgress.toString(), color: "bg-yellow-100 text-yellow-700" },
        { title: "Completed", value: projectData.completed.toString(), color: "bg-green-100 text-green-700" },
      ]);

      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to fetch metrics");
      setLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchMetrics();
  }, []);

  const metrics = activeTab === "task" ? taskMetrics : projectMetrics;

  return (
    <div className="space-y-6 p-6 px-7 bg-gradient-to-br from-gray-00 to-gray-200 rounded-lg shadow-md">
      {/* Toggle Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab("task")}
          className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${activeTab === "task"
              ? "bg-purple-800 text-white shadow-md scale-105"
              : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}
        >
          <FaTasks
            className={`text-lg transition-all ${activeTab === "task" ? "text-blue-500" : "text-gray-700"
              }`}
          />
           My Task
        </button>
        <button
          onClick={() => setActiveTab("project")}
          className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${activeTab === "project"
              ? "bg-violet-800 text-white shadow-md scale-105"
              : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}
        >
          <GrProjects
            className={`text-lg transition-all ${activeTab === "project" ? "text-green-500" : "text-gray-700"
              }`}
          />
          Team Project
        </button>
      </div>

      {/* Metrics Display */}
      {loading ? (
        <p className="text-gray-600">Loading metrics...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.title}
              className={`rounded-lg border p-6 shadow-md hover:shadow-lg transition-all ${metric.color}`}
            >
              <h3 className="text-sm font-medium text-gray-600">{metric.title}</h3>
              <p className="mt-2 text-3xl font-bold">{metric.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}