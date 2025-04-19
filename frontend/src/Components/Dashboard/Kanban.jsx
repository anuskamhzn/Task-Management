import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEllipsisV, FaPlusCircle, FaTasks, FaEdit, FaTrashAlt } from "react-icons/fa";
import { GrProjects } from "react-icons/gr";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { toast } from 'react-hot-toast';
import ModifyTask from "../../Pages/User/Modify/ModifyTask";
import ModifyProject from "../../Pages/User/Modify/ModifyProject";
import CreateTask from "../../Pages/User/Create/CreateTask";
import CreateProjectForm from "../../Pages/User/Create/CreateProject";
import ViewTaskDetail from '../../Pages/User/Tasks/ViewTaskDetail';
import ViewProjectDetail from '../../Pages/User/Projects/ViewProjectDetail';
import parse from 'html-react-parser';

const Kanban = ({ tasks, projects, setProjects, setTasks }) => {
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
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);

  // Modal visibility state for CreateTask
  const [isCreateModalTaskOpen, setIsCreateModalTaskOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // State for detail modals
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isProjectDetailOpen, setIsProjectDetailOpen] = useState(false);
  const [viewTaskId, setViewTaskId] = useState(null);
  const [viewProjectId, setViewProjectId] = useState(null);

  // Prevent scrolling when modals are open
  useEffect(() => {
    if (isCreateModalTaskOpen || isCreateModalOpen || isTaskDetailOpen || isProjectDetailOpen) {
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
  }, [isCreateModalTaskOpen, isCreateModalOpen , isTaskDetailOpen, isProjectDetailOpen]);

  // Toggle modal visibility
  const handleCreateTaskClick = () => {
    setIsCreateModalTaskOpen(true);
  };

  const handleCloseCreateTaskModal = () => {
    setIsCreateModalTaskOpen(false);
  };
  // Toggle modal visibility
  const handleCreateProjectClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateProjectModal = () => {
    setIsCreateModalOpen(false);
  };

  // Function to update task list with newly created task
  const handleTaskCreated = (newTask) => {
    setTasks((prevTasks) => [...prevTasks, newTask,]);  // Add the new task to the start of the task list
  };

  // Function to update task list with newly created task
  const handleProjectCreated = (newProject) => {
    setProjects((prevProjects) => [...prevProjects, newProject]);  // Add the new task to the start of the task list
  };

  // Function to generate a random pastel color
  const getRandomColor = (id) => {
    const colors = [
      'bg-blue-50 border-blue-100',
      'bg-green-50 border-green-100',
      'bg-yellow-50 border-yellow-100',
      'bg-purple-50 border-purple-100',
      'bg-pink-50 border-pink-100',
      'bg-indigo-50 border-indigo-100',
      'bg-teal-50 border-teal-100',
      'bg-orange-50 border-orange-100',
    ];
    // Use the id to get a consistent color for the same card
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

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

  // Handle opening subtask or subproject details
  const handleViewTaskDetail = (mainTaskId) => {
    // console.log("Opening subtask details for mainTaskId:", mainTaskId);
    setViewTaskId(mainTaskId); // For now, assuming mainTaskId is used as subTaskId; adjust if needed
    setIsTaskDetailOpen(true);
    setOpenMenu(null);
  };

  const handleViewProjectDetail = (mainProjectId) => {
    // console.log("Opening subproject details for mainProjectId:", mainProjectId);
    setViewProjectId(mainProjectId); // For now, assuming mainProjectId is used as subProjectId; adjust if needed
    setIsProjectDetailOpen(true);
    setOpenMenu(null);
  };

  const handleCloseDetailModal = () => {
    setIsTaskDetailOpen(false);
    setIsProjectDetailOpen(false);
    setViewTaskId(null);
    setViewProjectId(null);
  };

  if (!auth || !auth.user) {
    return <p>Please log in to view your Kanban board.</p>;
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const renderUsers = (users) => {
    const userArray = Array.isArray(users) ? users : [users];
    return userArray.map((user, index) => (
      <div
        key={user._id || index}
        title={user.username || user.email}
        className="w-9 h-9 rounded-full border-2 border-white shadow-md flex items-center justify-center"
      >
        {user.photo ? (
          <img
            src={`data:${user.photo.contentType};base64,${user.photo.data}`}
            alt={user.username || user.email}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 bg-gray-200 text-purple-800 rounded-full flex items-center justify-center text-sm font-medium">
            {user.initials || user.username?.slice(0, 2).toUpperCase() || 'U'}
          </div>
        )}
      </div>
    ));
  };

  const renderProjects = (projects) => {
    return projects.map((project) => (
      <div
        key={project._id}
        className={`p-4 rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 cursor-grab relative group ${getRandomColor(project._id)}`}
        draggable
        onDragStart={(e) => handleDragStart(e, project._id, "project")}
        onMouseEnter={() => setHoveredProject(project._id)}
        onMouseLeave={() => {
          setHoveredProject(null);
          setOpenMenu(null);
        }}
        onClick={() => handleViewProjectDetail(project._id)}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 group-hover:text-violet-900 transition-colors duration-200">{project.title}</h3>
          {hoveredProject === project._id && (
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <FaEllipsisV
                className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors duration-200"
                onClick={(e) => {
                  setOpenMenu(openMenu === project._id ? null : project._id);
                }}
              />
              {openMenu === project._id && (
                <div
                  className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden"
                  onMouseEnter={() => setHoveredProject(project._id)}
                  onMouseLeave={() => {
                    setHoveredProject(null);
                    setOpenMenu(null);
                  }}
                >
                  <button
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-teal-600 hover:bg-teal-50"
                    onClick={() => handleProjectModify(project._id)}
                  >
                    <FaEdit /> Modify
                  </button>
                  <button
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    onClick={() => openConfirmDialog(project._id, project.title, 'project')}
                  >
                    <FaTrashAlt /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="text-sm text-gray-600 mt-2 line-clamp-2 description-content">
          {parse(project.description)}
        </div>
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-gray-500">
            Due: {new Date(project.dueDate).toLocaleDateString()}
          </p>
          <div className="flex gap-2">{renderUsers(project.members || [])}</div>
        </div>
        <NavLink
          to={`/dashboard/project/subproject/${project._id}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-block bg-violet-700 hover:bg-violet-800 text-white text-sm px-4 py-2 rounded-md transition"
        >
          View Project
        </NavLink>
      </div>
    ));
  };

  const renderTasks = (tasks) => {
    return tasks.map((task) => (
      <div
        key={task._id}
        className={`p-4 rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 cursor-grab relative group ${getRandomColor(task._id)}`}
        draggable
        onDragStart={(e) => handleDragStart(e, task._id, "task")}
        onMouseEnter={() => setHoveredTask(task._id)}
        onMouseLeave={() => {
          setHoveredTask(null);
          setOpenMenu(null);
        }}
        onClick={() => handleViewTaskDetail(task._id)}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 group-hover:text-purple-800 transition-colors duration-200">{task.title}</h3>
          {hoveredTask === task._id && (
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <FaEllipsisV
                className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors duration-200"
                onClick={() => setOpenMenu(openMenu === task._id ? null : task._id)}
              />
              {openMenu === task._id && (
                <div
                  className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden"
                  onMouseEnter={() => setHoveredTask(task._id)}
                  onMouseLeave={() => {
                    setHoveredTask(null);
                    setOpenMenu(null);
                  }}
                >
                  <button
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-teal-600 hover:bg-teal-50"
                    onClick={() => handleTaskModify(task._id)}
                  >
                    <FaEdit /> Modify
                  </button>
                  <button
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    onClick={() => openConfirmDialog(task._id, task.title, 'task')}
                  >
                    <FaTrashAlt />Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="text-sm text-gray-600 mt-2 line-clamp-2 description-content">
          {parse(task.description)}
        </div>        
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-gray-500">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </p>
          {/* <div className="flex gap-2">{renderUsers(task.owner)}</div> */}
        </div>
        <NavLink
          to={`/dashboard/task/subtask/${task._id}`}
          onClick={(e) => e.stopPropagation()} // Prevent card click when clicking the button
          className="inline-block bg-purple-700 hover:bg-purple-800 text-white text-sm px-4 py-2 mt-2 rounded-md transition"
        >
          View Task
        </NavLink>
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
    <div className="flex gap-6 p-6 min-h-screen bg-gray-50">
      <div
        className="flex-1 p-6 bg-white rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, "To Do")}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <h2 className="text-xl font-bold text-gray-800">To Do</h2>
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {toDoProjects.length + toDoTasks.length}
            </span>
          </div>
          <div className="relative inline-block">
            <button
              onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
            >
              <FaPlusCircle className="text-xl" />
            </button>
            {isCreateDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                <button
                  onClick={() => {
                    setIsCreateDropdownOpen(false);
                    handleCreateTaskClick();
                  }}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-all duration-200 ease-in-out"
                >
                  <FaTasks className="text-blue-500 text-lg" />
                  <span className="text-sm font-medium text-gray-700">Create Task</span>
                </button>
                <button
                  onClick={() => {
                    setIsCreateDropdownOpen(false);
                    handleCreateProjectClick();
                  }}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-all duration-200 ease-in-out"
                >
                  <GrProjects className="text-green-500 text-lg" />
                  <span className="text-sm font-medium text-gray-700">Create Project</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {toDoProjects.length === 0 && toDoTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg">
            <FaTasks className="mx-auto text-3xl mb-2" />
            <p>No items in this column</p>
          </div>
        ) : (
          <div className="space-y-4">
            {renderProjects(toDoProjects)}
            {renderTasks(toDoTasks)}
          </div>
        )}
      </div>

      <div
        className="flex-1 p-6 bg-white rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, "In Progress")}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <h2 className="text-xl font-bold text-gray-800">In Progress</h2>
            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
              {inProgressProjects.length + inProgressTasks.length}
            </span>
          </div>
        </div>

        {inProgressProjects.length === 0 && inProgressTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg">
            <FaTasks className="mx-auto text-3xl mb-2" />
            <p>No items in this column</p>
          </div>
        ) : (
          <div className="space-y-4">
            {renderProjects(inProgressProjects)}
            {renderTasks(inProgressTasks)}
          </div>
        )}
      </div>

      <div
        className="flex-1 p-6 bg-white rounded-xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, "Completed")}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <h2 className="text-xl font-bold text-gray-800">Completed</h2>
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              {completedProjects.length + completedTasks.length}
            </span>
          </div>
        </div>

        {completedProjects.length === 0 && completedTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg">
            <FaTasks className="mx-auto text-3xl mb-2" />
            <p>No items in this column</p>
          </div>
        ) : (
          <div className="space-y-4">
            {renderProjects(completedProjects)}
            {renderTasks(completedTasks)}
          </div>
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

      {/* Modal for Creating Task */}
      {isCreateModalTaskOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <CreateTask onClose={handleCloseCreateTaskModal} onTaskCreated={handleTaskCreated} />
        </div>
      )}
      {/* Modal for Creating Project */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <CreateProjectForm onClose={handleCloseCreateProjectModal} onProjectCreated={handleProjectCreated} />
        </div>
      )}

      {isTaskDetailOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <ViewTaskDetail taskId={viewTaskId} onClose={handleCloseDetailModal} />
        </div>
      )}
      {isProjectDetailOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <ViewProjectDetail projectId={viewProjectId} onClose={handleCloseDetailModal} />
        </div>
      )}

 {/* Add CSS styling at the bottom of the Kanban component, before the closing return */}
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
`}</style>
    </div>
  );
};

export default Kanban;