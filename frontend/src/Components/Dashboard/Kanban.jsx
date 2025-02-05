import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/auth";

const Kanban = () => {
  const [auth] = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      const response = await axios.get(`${process.env.REACT_APP_API}/api/task/${auth.user.id}`, {
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
    
    const renderProjects = (projects) =>
    projects.map((project) => (
    <div
    key={project._id}
    className="bg-white p-4 mb-4 rounded-lg shadow-lg cursor-grab"
    draggable
    onDragStart={(e) => handleDragStart(e, project._id, "project")}
    >
    <h3 className="text-lg font-semibold">{project.title}</h3>
    <p className="text-sm text-gray-600">{project.description}</p>
    <p className="text-xs text-gray-500">Owner: {project.owner?.name || "N/A"}</p>
    <div className="flex gap-2 mt-2">
    {renderUsers(project.members || [])}
    </div>
    </div>
    ));
    
    const renderTasks = (tasks) =>
    tasks.map((task) => (
    <div
    key={task._id}
    className="bg-white p-4 mb-4 rounded-lg shadow-md cursor-grab"
    draggable
    onDragStart={(e) => handleDragStart(e, task._id, "task")}
    >
    <h3 className="text-lg font-semibold">{task.title}</h3>
    <p className="text-sm text-gray-600">{task.description}</p>
    <p className="text-xs text-gray-500">Due Date: {new Date(task.dueDate).toLocaleDateString()}</p>
    <div className="flex gap-2 mt-2">
    {renderUsers(task.owner)}
    </div>
    </div>
    ));

  const toDoProjects = projects.filter((p) => p.status === "To Do");
  const inProgressProjects = projects.filter((p) => p.status === "In Progress");
  const completedProjects = projects.filter((p) => p.status === "Completed");

  const toDoTasks = tasks.filter((t) => t.status === "To Do");
  const inProgressTasks = tasks.filter((t) => t.status === "In Progress");
  const completedTasks = tasks.filter((t) => t.status === "Completed");

  return (
    <div className="flex gap-6 p-6">
<div
  className="flex-1 p-4 bg-red-200 rounded-lg shadow-md"
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
    </div>
  );
};

export default Kanban;
