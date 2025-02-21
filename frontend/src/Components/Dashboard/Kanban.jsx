import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEllipsisV } from "react-icons/fa";
import { useAuth } from "../../context/auth";
import { toast } from 'react-hot-toast';
import { useParams } from "react-router-dom";
import { IoIosAdd } from "react-icons/io";
import ModifyTask from "../../Pages/User/Modify/ModifyTask";
import ModifyProject from "../../Pages/User/Modify/ModifyProject";

const Kanban = ({tasks, projects, setProjects, setTasks}) => {
  const [auth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredTask, setHoveredTask] = useState(null);
  const [hoveredProject, setHoveredProject] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ 
    isOpen: false, 
    id: null, 
    title: '', 
    type: '' // 'task' or 'project'
  });

  useEffect(() => {
    if (auth && auth.user) {
      fetchProjects();
      fetchTasks();
    }
  }, [auth]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/api/project`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setProjects(response.data);
    } catch (err) {
      setError("Error fetching projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/api/task`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      if (response.data.message === "No tasks found") {
        setTasks([]);
        setError("No tasks found");
      } else {
        setTasks(response.data);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("No task found");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("id");
    const type = e.dataTransfer.getData("type");

    if (!id || !type) return;

    try {
      if (type === "project") {
        await axios.patch(
          `${process.env.REACT_APP_API}/api/project/status`,
          { projectId: id, status: newStatus },
          { headers: { Authorization: `Bearer ${auth.token}` } }
        );
        setProjects((prev) =>
          prev.map((p) => (p._id === id ? { ...p, status: newStatus } : p))
        );
      } else if (type === "task") {
        await axios.patch(
          `${process.env.REACT_APP_API}/api/task/status`,
          { taskId: id, status: newStatus },
          { headers: { Authorization: `Bearer ${auth.token}` } }
        );
        setTasks((prev) =>
          prev.map((t) => (t._id === id ? { ...t, status: newStatus } : t))
        );
      }
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Error updating status");
    }
  };

  const handleDragStart = (e, id, type) => {
    e.dataTransfer.setData("id", id);
    e.dataTransfer.setData("type", type);
  };

  const handleProjectModify = (projectId) => {
    setSelectedProject(projectId);
    setOpenMenu(null);
  };

  const handleTaskModify = (taskId) => {
    setSelectedTask(taskId);
    setOpenMenu(null);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
    setSelectedProject(null);
  };

  const handleDelete = async (id, type) => {
    try {
      const url = type === 'project' 
        ? `${process.env.REACT_APP_API}/api/project/delete/${id}`
        : `${process.env.REACT_APP_API}/api/task/delete/${id}`;

      await axios.delete(url, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      if (type === 'project') {
        setProjects((prevProjects) => prevProjects.filter((project) => project._id !== id));
        toast.success("Project deleted successfully!");
      } else {
        setTasks((prevTasks) => prevTasks.filter((task) => task._id !== id));
        toast.success("Task deleted successfully!");
      }
    } catch (err) {
      console.error(`Error deleting ${type}:`, err);
      toast.error(`There was an error deleting the ${type}.`);
    }
  };

  const openConfirmDialog = (id, title, type) => {
    setConfirmDialog({ isOpen: true, id, title, type });
    setOpenMenu(null);
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, id: null, title: '', type: '' });
  };

  const handleConfirmDelete = () => {
    handleDelete(confirmDialog.id, confirmDialog.type);
    closeConfirmDialog();
  };

  if (!auth || !auth.user) {
    return <p>Please log in to view your Kanban board.</p>;
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const renderUsers = (users) => {
    const userArray = Array.isArray(users) ? users : [users];
    return userArray.map((user) => (
      <img
        key={user._id}
        src={user.avatar || "default-avatar.png"}
        alt={user.username}
        title={user.username}
        className="w-8 h-8 rounded-full border border-gray-300"
      />
    ));
  };

  const renderProjects = (projects) => {
    return projects.map((project) => (
      <div
        key={project._id}
        className="bg-white p-4 mb-4 rounded-lg shadow-md cursor-grab relative"
        draggable
        onDragStart={(e) => handleDragStart(e, project._id, "project")}
        onMouseEnter={() => setHoveredProject(project._id)}
        onMouseLeave={() => {
          setHoveredProject(null);
          setOpenMenu(null);
        }}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{project.title}</h3>
          {hoveredProject === project._id && (
            <div className="relative">
              <FaEllipsisV
                className="cursor-pointer"
                onClick={(e) => {
                  setOpenMenu(openMenu === project._id ? null : project._id);
                }}
              />
              {openMenu === project._id && (
                <div
                  className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-md z-10"
                  onMouseEnter={() => setHoveredProject(project._id)}
                  onMouseLeave={() => {
                    setHoveredProject(null);
                    setOpenMenu(null);
                  }}
                >
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => handleProjectModify(project._id)}
                  >
                    Modify
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                    onClick={() => openConfirmDialog(project._id, project.title, 'project')}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600">{project.description}</p>
        <p className="text-xs text-gray-500">Due Date: {new Date(project.dueDate).toLocaleDateString()}</p>
        <div className="flex gap-2 mt-2">{renderUsers(project.members || [])}</div>
      </div>
    ));
  };

  const renderTasks = (tasks) => {
    return tasks.map((task) => (
      <div
        key={task._id}
        className="relative bg-white p-4 mb-4 rounded-lg shadow-md cursor-grab"
        draggable
        onDragStart={(e) => handleDragStart(e, task._id, "task")}
        onMouseEnter={() => setHoveredTask(task._id)}
        onMouseLeave={() => {
          setHoveredTask(null);
          setOpenMenu(null);
        }}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{task.title}</h3>
          {hoveredTask === task._id && (
            <div className="relative">
              <FaEllipsisV
                className="cursor-pointer"
                onClick={() => setOpenMenu(openMenu === task._id ? null : task._id)}
              />
              {openMenu === task._id && (
                <div
                  className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-md"
                  onMouseEnter={() => setHoveredTask(task._id)}
                  onMouseLeave={() => {
                    setHoveredTask(null);
                    setOpenMenu(null);
                  }}
                >
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => handleTaskModify(task._id)}
                  >
                    Modify
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                    onClick={() => openConfirmDialog(task._id, task.title, 'task')}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600">{task.description}</p>
        <p className="text-xs text-gray-500">
          Due Date: {new Date(task.dueDate).toLocaleDateString()}
        </p>
        <div className="flex gap-2 mt-2">{renderUsers(task.owner)}</div>
      </div>
    ));
  };

  const toDoProjects = projects.filter((p) => p.status === "To Do");
  const inProgressProjects = projects.filter((p) => p.status === "In Progress");
  const completedProjects = projects.filter((p) => p.status === "Completed");

  const toDoTasks = tasks.filter((t) => t.status === "To Do");
  const inProgressTasks = tasks.filter((t) => t.status === "In Progress");
  const completedTasks = tasks.filter((t) => t.status === "Completed");

  return (
    <div className="flex gap-6 p-6">
      <div
        className="flex-1 p-4 bg-blue-200 rounded-lg shadow-md"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, "To Do")}
      >
        <h2 className="text-xl font-semibold text-center mb-4">To Do</h2>
        {toDoProjects.length === 0 && toDoTasks.length === 0 ? (
          <div className="text-center text-gray-500">No items</div>
        ) : (
          <>
            {renderProjects(toDoProjects)}
            {renderTasks(toDoTasks)}
          </>
        )}
      </div>
      <div
        className="flex-1 p-4 bg-yellow-200 rounded-lg shadow-md"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, "In Progress")}
      >
        <h2 className="text-xl font-semibold text-center mb-4">In Progress</h2>
        {inProgressProjects.length === 0 && inProgressTasks.length === 0 ? (
          <div className="text-center text-gray-500">No items</div>
        ) : (
          <>
            {renderProjects(inProgressProjects)}
            {renderTasks(inProgressTasks)}
          </>
        )}
      </div>
      <div
        className="flex-1 p-4 bg-green-200 rounded-lg shadow-md"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, "Completed")}
      >
        <h2 className="text-xl font-semibold text-center mb-4">Completed</h2>
        {completedProjects.length === 0 && completedTasks.length === 0 ? (
          <div className="text-center text-gray-500">No items</div>
        ) : (
          <>
            {renderProjects(completedProjects)}
            {renderTasks(completedTasks)}
          </>
        )}
      </div>
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
      {selectedProject && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <ModifyProject
            auth={auth}
            setProjects={setProjects}
            projectId={selectedProject}
            onClose={handleCloseModal}
          />
        </div>
      )}
      {/* Custom Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm transform transition-all">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Delete {confirmDialog.type === 'project' ? 'Project' : 'Task'}
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "<span className="font-medium">{confirmDialog.title}</span>"?
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

export default Kanban;