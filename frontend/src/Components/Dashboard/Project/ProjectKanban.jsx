import React from 'react';
import axios from 'axios';

const ProjectKanban = ({ toDoProjects, inProgressProjects, completedProjects, projects, setProjects, auth }) => {
  
  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const subProjectId = e.dataTransfer.getData("id");  // Use subtaskId here
  
    if (!subProjectId) return;
  
    const url = `${process.env.REACT_APP_API}/api/project/subproject/status`;
  
    try {
      // Update the subtask status via API
      await axios.patch(
        url,
        { subProjectId, status: newStatus },  // Correct the key to 'subProjectId'
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      
  
      // Update the local state to reflect the change
      setProjects((prev) =>
        prev.map((project) =>
          project._id === subProjectId ? { ...project, status: newStatus } : project
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };
  

  const handleDragStart = (e, projectId) => {
    e.dataTransfer.setData("id", projectId);  // Ensure correct taskId is set for drag
  };

  const renderTasks = (projects) => {
    return projects.map((project) => (
      <div
        key={project._id}
        className="bg-white p-4 mb-4 rounded-lg shadow-md cursor-grab"
        draggable
        onDragStart={(e) => handleDragStart(e, project._id)}  // Use subtask _id here
      >
        <h3 className="text-lg font-semibold">{project.title}</h3>
        <p className="text-sm text-gray-600">{project.description}</p>
        <p className="text-xs text-gray-500">Due Date: {new Date(project.dueDate).toLocaleDateString()}</p>
      </div>
    ));
  };

  return (
    <div className="flex gap-6 p-6">
      {/* To Do Column */}
      <div
        className="flex-1 p-4 bg-red-100 rounded-lg shadow-md"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, "To Do")}
      >
        <h2 className="text-xl font-semibold text-center mb-4">To Do</h2>
        {toDoProjects.length === 0 ? <div>No tasks</div> : renderTasks(toDoProjects)}
      </div>

      {/* In Progress Column */}
      <div
        className="flex-1 p-4 bg-yellow-100 rounded-lg shadow-md"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, "In Progress")}
      >
        <h2 className="text-xl font-semibold text-center mb-4">In Progress</h2>
        {inProgressProjects.length === 0 ? <div>No tasks</div> : renderTasks(inProgressProjects)}
      </div>

      {/* Completed Column */}
      <div
        className="flex-1 p-4 bg-green-100 rounded-lg shadow-md"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, "Completed")}
      >
        <h2 className="text-xl font-semibold text-center mb-4">Completed</h2>
        {completedProjects.length === 0 ? <div>No tasks</div> : renderTasks(completedProjects)}
      </div>
    </div>
  );
};

export default ProjectKanban;
