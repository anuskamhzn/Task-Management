import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEllipsisV } from "react-icons/fa";
import { useAuth } from "../../../context/auth";
import Navbar from "../../../Components/Navigation/Navbar";
import Sidebar from "../../../Components/Navigation/Sidebar";
import { NavLink } from "react-router-dom";
import { FaTrash, FaEdit, FaTrashAlt } from "react-icons/fa";
import { toast } from 'react-hot-toast';
import ModifyTask from "../Modify/ModifyTask";
import CreateTask from "../Create/CreateTask";
import ViewTaskDetail from './ViewTaskDetail';
import parse from 'html-react-parser';
import OverdueBadge from "../../../Components/Dashboard/OverdueBadge";

const Tasks = () => {
  const [auth] = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [hoveredTask, setHoveredTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, taskId: null, taskTitle: '' });
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewTaskId, setViewTaskId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  useEffect(() => {
    setTasks([]);
    setError(null);
    setLoading(true);
    if (auth && auth.user) {
      fetchTasks();
    }
  }, [auth]);

  useEffect(() => {
    if (statusFilter === 'All') {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter(task => task.status === statusFilter));
    }
  }, [tasks, statusFilter]);

  useEffect(() => {
    if (isCreateModalOpen || isDetailModalOpen) {
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
  }, [isCreateModalOpen, isDetailModalOpen]);

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
    setOpenMenu(null);
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
    setOpenMenu(null);
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

  const handleViewDetail = (taskId) => {
    setViewTaskId(taskId);
    setIsDetailModalOpen(true);
    setOpenMenu(null);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setViewTaskId(null);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setIsStatusDropdownOpen(false);
  };

  const toggleStatusDropdown = () => {
    setIsStatusDropdownOpen(!isStatusDropdownOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white shadow-lg fixed inset-y-0 left-0">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col ml-64">
        <Navbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">My Tasks</h1>
            <div className="flex gap-4 items-center">
              <div className="relative">
                <button
                  onClick={toggleStatusDropdown}
                  className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-md transition"
                >
                  Filter by Status: {statusFilter}
                  <svg
                    className="ml-2 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {isStatusDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg border border-gray-200 rounded-md z-10">
                    <button
                      onClick={() => handleStatusFilter('All')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      All
                    </button>
                    <button
                      onClick={() => handleStatusFilter('To Do')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      To Do
                    </button>
                    <button
                      onClick={() => handleStatusFilter('In Progress')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleStatusFilter('Completed')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Completed
                    </button>
                  </div>
                )}
              </div>
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
          ) : filteredTasks.length === 0 ? (
            <p className="text-center text-gray-500 py-4 bg-white rounded-md shadow">
              No tasks available for the selected status.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredTasks.map((task) => (
                <div
                  key={task._id}
                  onClick={() => handleViewDetail(task._id)}
                  className={`bg-white p-5 rounded-md shadow-md hover:shadow-lg transition relative group border ${
                    task.isOverdue ? 'border-red-500 border-2' : 'border-gray-200'
                  } cursor-pointer`}
                  onMouseLeave={() => {
                    setHoveredTask(null);
                    setOpenMenu(null);
                  }}
                >
                  <h3 className="text-lg font-bold text-gray-700 mb-2 truncate flex items-center gap-2">
                    {task.title}
                    {task.isOverdue && <OverdueBadge aria-label="Task is overdue" />}
                  </h3>
                  <div className="text-gray-600 text-sm mb-4 line-clamp-1 description-content">
                    {parse(task.description)}
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        task.status === 'Completed'
                          ? 'bg-green-100 text-green-700'
                          : task.status === 'In Progress'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>

                  <NavLink
                    to={`/dashboard/task/subtask/${task._id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-block bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-md transition"
                  >
                    View Task
                  </NavLink>

                  <div
                    className="absolute top-3 right-3 cursor-pointer hidden group-hover:block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaEllipsisV
                      onClick={() => handleMenuToggle(task._id)}
                      className="text-gray-600 hover:text-gray-800 transition"
                    />
                  </div>

                  {openMenu === task._id && (
                    <div
                      className="absolute right-3 top-8 w-32 bg-white shadow-lg border border-gray-200 rounded-md z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleModify(task._id)}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-teal-600 hover:bg-teal-50"
                      >
                        <FaEdit /> Modify
                      </button>
                      <button
                        onClick={() => openConfirmDialog(task._id, task.title)}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <FaTrashAlt /> Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <CreateTask onClose={handleCloseCreateTaskModal} onTaskCreated={handleTaskCreated} />
        </div>
      )}

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

      {isDetailModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <ViewTaskDetail taskId={viewTaskId} onClose={handleCloseDetailModal} />
        </div>
      )}

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

      <style jsx>{`
        .description-content ul,
        .description-content ol {
          list-style: disc inside;
          padding-left: 1rem;
          margin: 0.5rem 0;
        }
        .description-content ol {
          list-style: decimal inside;
        }
        .description-content li {
          margin-bottom: 0.25rem;
        }
        .description-content h1 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.5rem 0;
        }
        .description-content h2 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.5rem 0;
        }
        .description-content h3 {
          font-size: 1.1rem;
          font-weight: bold;
          margin: 0.5rem 0;
        }
        .description-content h4 {
          font-size: 1rem;
          font-weight: bold;
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  );
};

export default Tasks;