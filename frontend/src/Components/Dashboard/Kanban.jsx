import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEllipsisV } from "react-icons/fa";
import { useAuth } from "../../context/auth";
import { toast } from 'react-hot-toast';
import { useParams } from "react-router-dom";
import ModifyTask from "../../Pages/User/Modify/ModifyTask";
import ModifyProject from "../../Pages/User/Modify/ModifyProject";

const Kanban = () => {
  const [auth] = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredTask, setHoveredTask] = useState(null); // Track hovered task
  const [hoveredProject, setHoveredProject] = useState(null); // Track hovered task
  const [openMenu, setOpenMenu] = useState(null); // Track open menu
  const [selectedTask, setSelectedTask] = useState(null); // Track selected subtask
  const [selectedProject, setSelectedProject] = useState(null); // Track selected subtask

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
        setTasks([]); // Set empty tasks array if no tasks found
        setError("No tasks found");
      } else {
        setTasks(response.data); // Set tasks if found
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

    console.log("Dropped:", { id, type, newStatus }); // Debugging

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

  const handleProjectModify = (projectId) => {
    setSelectedProject(projectId); // Open modal with subtask ID
  };

  const handleProjectDelete = async (projectId) => {
 // Confirmation dialog
 const confirmDelete = window.confirm("Are you sure you want to delete this task?");

 if (!confirmDelete) {
   return; // If the user cancels the delete, do nothing
 }

 // Assuming mainTaskId is now passed correctly, we use it dynamically
 try {
   // Make the DELETE request to the backend API
   const url = `${process.env.REACT_APP_API}/api/project/delete/${projectId}`;

   await axios.delete(url, {
     headers: { Authorization: `Bearer ${auth.token}` },
   });

   // Update the tasks list by removing the deleted task
   setProjects((prevProjects) => prevProjects.filter((project) => project._id !== projectId));

   // Show a success toast notification
   toast.success("Project deleted successfully!");
 } catch (err) {
   console.error("Error deleting subproject:", err);
   toast.error("There was an error deleting the subproject.");
 }
  };
  const handleTaskModify = (taskId) => {
    setSelectedTask(taskId); // Open modal with subtask ID
  };

  const handleCloseModal = () => {
    setSelectedTask(null); // Close modal
    setSelectedProject(null);
  };

  const handleTaskDelete = async (taskId) => {
    // Confirmation dialog
    const confirmDelete = window.confirm("Are you sure you want to delete this task?");

    if (!confirmDelete) {
      return; // If the user cancels the delete, do nothing
    }

    // Assuming mainTaskId is now passed correctly, we use it dynamically
    try {
      // Make the DELETE request to the backend API
      const url = `${process.env.REACT_APP_API}/api/task/delete/${taskId}`;

      await axios.delete(url, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      // Update the tasks list by removing the deleted task
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));

      // Show a success toast notification
      toast.success("Task deleted successfully!");
    } catch (err) {
      console.error("Error deleting subtask:", err);
      toast.error("There was an error deleting the subtask.");
    }
  };

  const renderProjects = (projects) => {
    return projects.map((project) => (
      <div
        key={project._id}
        className="bg-white p-4 mb-4 rounded-lg shadow-md cursor-grab relative"
        draggable
        onDragStart={(e) => handleDragStart(e, project._id, "project")}
        onMouseEnter={() => setHoveredProject(project._id)} // Show menu when hovering
        onMouseLeave={() => {
          setHoveredProject(null);
          setOpenMenu(null); // Close options menu as well
        }}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{project.title}</h3>

          {/* Three Dots Icon */}
          {hoveredProject === project._id && (
            <div className="relative">
              <FaEllipsisV
                className="cursor-pointer"
                onClick={(e) => {
                  setOpenMenu(openMenu === project._id ? null : project._id);
                }}
              />

              {/* Dropdown Menu */}
              {openMenu === project._id && (
                <div
                  className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-md z-10"
                  onMouseEnter={() => setHoveredProject(project._id)} // Keep open on hover
                  onMouseLeave={() => {
                    setHoveredProject(null); // Hide if mouse leaves
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
                    onClick={() => handleProjectDelete(project._id)}
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
        onMouseEnter={() => setHoveredTask(task._id)} // Show menu when hovering
        onMouseLeave={() => {
          setHoveredTask(null); // Hide menu when not hovering
          setOpenMenu(null); // Close options menu as well
        }}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{task.title}</h3>

          {/* Three Dots Icon - Only show on hover */}
          {hoveredTask === task._id && (
            <div className="relative">
              <FaEllipsisV
                className="cursor-pointer"
                onClick={() => setOpenMenu(openMenu === task._id ? null : task._id)}
              />

              {/* Dropdown Menu */}
              {openMenu === task._id && (
                <div
                  className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-md"
                  onMouseEnter={() => setHoveredTask(task._id)} // Keep open on hover
                  onMouseLeave={() => {
                    setHoveredTask(null); // Hide if mouse leaves
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
                    onClick={() => handleTaskDelete(task._id)}
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
        onDrop={(e) => handleDrop(e, "To Do", e.dataTransfer.getData("type"))}
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
        onDrop={(e) => handleDrop(e, "In Progress", e.dataTransfer.getData("type"))}
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
        onDrop={(e) => handleDrop(e, "Completed", e.dataTransfer.getData("type"))}
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
      {/* Modal for Modifying Subtask */}
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
      {/* Modal for Modifying Subtask */}
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
    </div>
  );
};

export default Kanban;
