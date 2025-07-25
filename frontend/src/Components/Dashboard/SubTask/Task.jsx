import React, { useEffect, useState } from "react";
import axios from "axios";
import { NavLink, useParams } from "react-router-dom";
import { useAuth } from "../../../context/auth";
import Navbar from "../../Navigation/Navbar";
import Sidebar from "../../Navigation/Sidebar";
import TaskKanban from './TaskKanban';
import TaskTableView from './TaskListView';
import { FaTrash } from "react-icons/fa";
import CreateSubtask from "../../../Pages/User/Create/CreateSubtask";
import { FaChartGantt } from "react-icons/fa6";
import SubTaskAnalytics from "./SubTaskAnalytics";

const Task = () => {
  const [auth] = useAuth();
  const { taskId } = useParams();
  const [mainTask, setMainTask] = useState(null);
  const [tasks, setTasks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (taskId && auth.token) {
      fetchMainTask();
    }
  }, [taskId, auth.token]);

  useEffect(() => {
    setTasks(null);
    setError(null);
    setLoading(true);
    if (auth && auth.user) {
      fetchTask();
    }
  }, [auth, taskId]);

  // Prevent scrolling when modals are open
  useEffect(() => {
    if (isCreateModalOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.height = "100vh";
    } else {
      document.body.style.overflow = "auto";
      document.body.style.height = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
      document.body.style.height = "auto";
    };
  }, [isCreateModalOpen]);

  const fetchMainTask = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/api/task`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      if (response.data && response.data.length > 0) {
        const foundTask = response.data.find(task => task._id === taskId);
        setMainTask(foundTask || null);
      } else {
        setError("No tasks found.");
      }
    } catch (err) {
      console.error("Error fetching main task:", err);
      setError("Error fetching main task.");
    }
  };

  const fetchTask = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/api/task/subtask/${taskId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      if (response.data.message === "No tasks found") {
        setTasks([]);
        setError("No tasks found");
      } else {
        // Sort tasks by the creation date in descending order (most recent first)
        const sortedTasks = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTasks(sortedTasks);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError(err.response.data.message || "No subtasks found for this task.");
        setTasks([]); // Ensure tasks is an empty array for empty state
      } else {
        setError("Failed to fetch task. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubtaskClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateSubtaskModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleSubtaskCreated = (subTask) => {
    setTasks((prevTasks) => [subTask.subTask, ...prevTasks]); // Add to the top
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <aside className="h-screen w-64 bg-gray-900 text-white shadow-lg fixed top-0 left-0">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col ml-64">
        <Navbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Task Name: {mainTask ? mainTask.title : "Loading..."}
            </h1>
            <div className="flex gap-4 items-center">
              <NavLink
                to={`/dashboard/task/${taskId}/gantt`}
                className="flex items-center bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-lg shadow-md transition"
              >
                <FaChartGantt className="mr-2" />
                Gantt
              </NavLink>
              <NavLink to={`/dashboard/subtask-trash/${taskId}`} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-md transition">
                <FaTrash className="text-lg" />
              </NavLink>
            </div>
          </div>
          {/* <SubTaskAnalytics auth={auth} mainTaskId={taskId} /> */}

          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : (
            <TaskTableView
              tasks={tasks || []} // Ensure tasks is always an array
              setTasks={setTasks}
              auth={auth}
            />
          )}
        </div>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <CreateSubtask onClose={handleCloseCreateSubtaskModal} onSubTaskCreated={handleSubtaskCreated} />
        </div>
      )}
    </div>
  );
};

export default Task;