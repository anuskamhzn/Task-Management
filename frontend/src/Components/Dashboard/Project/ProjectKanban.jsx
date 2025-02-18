import React, { useState } from 'react';
import { FaEllipsisV } from "react-icons/fa";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import ModifySubproject from '../../../Pages/User/Modify/SubProjectModify';

const ProjectKanban = ({ toDoProjects, inProgressProjects, completedProjects, setProjects, auth }) => {
  const [openMenu, setOpenMenu] = useState(null); // Track open menu
  const [hoveredProject, setHoveredProject] = useState(null); // Track hovered project
  const { projectId } = useParams(); // Get the main task ID from the route params
  const [selectedSubproject, setSelectedSubproject] = useState(null); // Track selected subproject

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const subProjectId = e.dataTransfer.getData("id");

    if (!subProjectId) return;

    const url = `${process.env.REACT_APP_API}/api/project/subproject/status`;

    try {
      await axios.patch(
        url,
        { subProjectId, status: newStatus },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      setProjects((prev) =>
        prev.map((project) =>
          project._id === subProjectId ? { ...project, status: newStatus } : project
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
      if (err.response && err.response.data.message === "Only assigned members can update the status.") {
        toast.error("Only assigned members can update the status.");
      } else {
        toast.error("Error updating status.");
      }
    }
  };

  const handleModify = (subProjectId) => {
    setSelectedSubproject(subProjectId); // Open modal with subproject ID
  };

  const handleCloseModal = () => {
    setSelectedSubproject(null); // Close modal
  };

  const handleDelete = async (subProjectId) => {

    // Confirmation dialog
    const confirmDelete = window.confirm("Are you sure you want to delete this subtask?");

    if (!confirmDelete) {
      return; // If the user cancels the delete, do nothing
    }


    // Assuming mainTaskId is now passed correctly, we use it dynamically
    try {
      // Make the DELETE request to the backend API
      const url = `${process.env.REACT_APP_API}/api/project/delete-subproject/${projectId}/${subProjectId}`;

      await axios.delete(url, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      // Update the tasks list by removing the deleted subtask
      setProjects((prevProject) => prevProject.filter((project) => project._id !== subProjectId));

      // Show a success toast notification
      toast.success("Subproject deleted successfully!");
    } catch (err) {
      console.error("Error deleting subproject:", err);
      if (err.response && err.response.data.message === "Only owner can delete the project.") {
        toast.error("Only owner can delete the project.");
      } else {
        toast.error("Error deleting project.");
      }
    }
  };

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

  const handleDragStart = (e, projectId) => {
    e.dataTransfer.setData("id", projectId);
  };

  const renderProjects = (projects) => {
    return projects.map((project) => (
      <div
        key={project._id}
        className="bg-white p-4 mb-4 rounded-lg shadow-md cursor-grab relative"
        draggable
        onDragStart={(e) => handleDragStart(e, project._id)}
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
                  e.stopPropagation();
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
                    onClick={() => handleModify(project._id)}
                  >
                    Modify
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                    onClick={() => handleDelete(project._id)}
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

  return (
    <div className="flex gap-6 p-6">
      <div
        className="flex-1 p-4 bg-gray-300 rounded-lg shadow-md"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, "To Do")}
      >
        <h2 className="text-xl font-semibold text-center mb-4">To Do</h2>
        {toDoProjects.length === 0 ? <div>No tasks</div> : renderProjects(toDoProjects)}
      </div>

      <div
        className="flex-1 p-4 bg-yellow-300 rounded-lg shadow-md"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, "In Progress")}
      >
        <h2 className="text-xl font-semibold text-center mb-4">In Progress</h2>
        {inProgressProjects.length === 0 ? <div>No tasks</div> : renderProjects(inProgressProjects)}
      </div>

      <div
        className="flex-1 p-4 bg-green-300 rounded-lg shadow-md"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, "Completed")}
      >
        <h2 className="text-xl font-semibold text-center mb-4">Completed</h2>
        {completedProjects.length === 0 ? <div>No tasks</div> : renderProjects(completedProjects)}
      </div>
      {/* Modal for Modifying Subproject */}
      {selectedSubproject && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <ModifySubproject
            auth={auth}
            setProjects={setProjects}
            subProjectId={selectedSubproject}
            onClose={handleCloseModal}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectKanban;
