import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEllipsisV } from "react-icons/fa";
import { useAuth } from "../../../context/auth";
import Navbar from "../../../Components/Navigation/Navbar";
import Sidebar from "../../../Components/Navigation/Sidebar";
import { NavLink } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { toast } from 'react-hot-toast';
import ModifyTask from "../Modify/ModifyTask";
import CreateTask from "../Create/CreateTask";

const Tasks = () => {
  const [auth] = useAuth();
  const [tasks, setTasks] = useState([]);
  const [hoveredTask, setHoveredTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, taskId: null, taskTitle: '' });

  useEffect(() => {
    setTasks([]);
    setError(null);
    setLoading(true);
    if (auth && auth.user) {
      fetchTasks();
    }
  }, [auth]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/api/task`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (response.data.message === "No tasks found") {
        setTasks([]);
        setError("No tasks found");
      } else {
        const sortedTasks = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTasks(sortedTasks);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("No task found");
    } finally {
      setLoading(false);
    }
  };

  const handleModify = (taskId) => {
    setSelectedTask(taskId);
    setOpenMenu(null); // Close dropdown after selecting modify
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
  };

  const handleDelete = async (taskId) => {
    try {
      const url = `${process.env.REACT_APP_API}/api/task/delete/${taskId}`;
      await axios.delete(url, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
      toast.success("Task deleted successfully!");
    } catch (err) {
      console.error("Error deleting task:", err);
      toast.error("There was an error deleting the task.");
    }
  };

  const openConfirmDialog = (taskId, taskTitle) => {
    setConfirmDialog({ isOpen: true, taskId, taskTitle });
    setOpenMenu(null); // Close dropdown when opening confirm dialog
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, taskId: null, taskTitle: '' });
  };

  const handleConfirmDelete = () => {
    handleDelete(confirmDialog.taskId);
    closeConfirmDialog();
  };

  const handleMenuToggle = (taskId) => {
    setOpenMenu(openMenu === taskId ? null : taskId);
  };

  const handleCreateTaskClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateTaskModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleTaskCreated = (newTask) => {
    setTasks((prevTasks) => [newTask, ...prevTasks]);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white shadow-lg fixed inset-y-0 left-0">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        <Navbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Tasks</h1>
            <div className="flex gap-4 items-center">
              <button
                onClick={handleCreateTaskClick}
                className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow-md transition"
              >
                <span className="mr-2 text-lg">+</span> Create Task
              </button>
              <NavLink
                to="/dashboard/trash"
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-md transition"
              >
                <FaTrash className="text-lg" />
              </NavLink>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-gray-500 py-4">Loading...</p>
          ) : error ? (
            <p className="text-red-500 text-center py-4">{error}</p>
          ) : tasks.length === 0 ? (
            <p className="text-center text-gray-500 py-4 bg-white rounded-md shadow">No tasks available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="bg-white p-5 rounded-md shadow-md hover:shadow-lg transition relative group border border-gray-200"
                  onMouseLeave={() => {
                    setHoveredTask(null);
                    setOpenMenu(null);
                  }}
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">{task.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{task.description}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        task.status === 'Completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>

                  <NavLink
                    to={`/dashboard/task/subtask/${task._id}`}
                    className="inline-block bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-md transition"
                  >
                    View Task
                  </NavLink>

                  {/* Three Dots Icon */}
                  <div className="absolute top-3 right-3 cursor-pointer hidden group-hover:block">
                    <FaEllipsisV
                      onClick={() => handleMenuToggle(task._id)}
                      className="text-gray-600 hover:text-gray-800 transition"
                    />
                  </div>

                  {/* Dropdown Menu */}
                  {openMenu === task._id && (
                    <div className="absolute right-3 top-8 w-32 bg-white shadow-lg border border-gray-200 rounded-md z-10">
                      <button
                        onClick={() => handleModify(task._id)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                      >
                        Modify
                      </button>
                      <button
                        onClick={() => openConfirmDialog(task._id, task.title)}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal for Creating Task */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <CreateTask onClose={handleCloseCreateTaskModal} onTaskCreated={handleTaskCreated} />
        </div>
      )}

      {/* Modal for Modifying Task */}
      {selectedTask && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <ModifyTask
            auth={auth}
            setTasks={setTasks}
            taskId={selectedTask}
            onClose={handleCloseModal}
          />
        </div>
      )}

      {/* Custom Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm transform transition-all">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Delete Task</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "<span className="font-medium">{confirmDialog.taskTitle}</span>"?
              <span className="block text-sm text-red-500 mt-1">This action will move the task to the trash.</span>
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
    </div>
  );
};

export default Tasks;