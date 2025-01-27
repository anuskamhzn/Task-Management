import React, { useState, useEffect } from "react";
import axios from "axios";

const Kanban = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API}/api/project`
        );
        setProjects(response.data);
      } catch (err) {
        setError("Error fetching projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleDrop = async (e, newStatus) => {
    const projectId = e.dataTransfer.getData("projectId");
    const project = projects.find((p) => p._id === projectId);

    if (!project) return;

    try {
      await axios.patch(
        `${process.env.REACT_APP_API}/api/project/status`,
        { projectId, status: newStatus }
      );
      setProjects((prevProjects) =>
        prevProjects.map((p) =>
          p._id === projectId ? { ...p, status: newStatus } : p
        )
      );
    } catch (err) {
      setError("Error updating project status");
    }
  };

  const handleDragStart = (e, projectId) => {
    e.dataTransfer.setData("projectId", projectId);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const renderUsers = (users) =>
    users.map((user) => (
      <img
        key={user._id} // Use user's unique ID
        src={user.avatar || "default-avatar.png"} // Fallback avatar if not provided
        alt={user.username}
        title={user.username} // Tooltip with user's name
        className="w-8 h-8 rounded-full border border-gray-300"
      />
    ));
  
    const renderProjects = (projects) =>
      projects.map((project) => (
        <div
          key={project._id}
          className="bg-white p-4 mb-4 rounded-lg shadow-lg cursor-grab"
          draggable
          onDragStart={(e) => handleDragStart(e, project._id)}
        >
          <h3 className="text-lg font-semibold">{project.title}</h3>
          <p className="text-sm text-gray-600">{project.description}</p>
          <p className="text-xs text-gray-500">Owner: {project.owner?.name || "N/A"}</p>
          <div className="flex gap-2 mt-2">
            {renderUsers(project.members || [])}
          </div>
        </div>
      ));
    

  const toDoProjects = projects.filter((p) => p.status === "To Do");
  const inProgressProjects = projects.filter((p) => p.status === "In Progress");
  const completedProjects = projects.filter((p) => p.status === "Completed");

  return (
    <div className="flex gap-6 p-6">
      <div
        className="flex-1 p-4 bg-red-100 rounded-lg shadow-md"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, "To Do")}
      >
        <h2 className="text-xl font-semibold text-center mb-4">To Do</h2>
        {toDoProjects.length === 0 ? (
          <div className="text-center text-gray-500">No projects in this column</div>
        ) : (
          renderProjects(toDoProjects)
        )}
      </div>

      <div
        className="flex-1 p-4 bg-yellow-100 rounded-lg shadow-md"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, "In Progress")}
      >
        <h2 className="text-xl font-semibold text-center mb-4">In Progress</h2>
        {inProgressProjects.length === 0 ? (
          <div className="text-center text-gray-500">No projects in this column</div>
        ) : (
          renderProjects(inProgressProjects)
        )}
      </div>

      <div
        className="flex-1 p-4 bg-green-100 rounded-lg shadow-md"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, "Completed")}
      >
        <h2 className="text-xl font-semibold text-center mb-4">Completed</h2>
        {completedProjects.length === 0 ? (
          <div className="text-center text-gray-500">No projects in this column</div>
        ) : (
          renderProjects(completedProjects)
        )}
      </div>
    </div>
  );
};

export default Kanban;
