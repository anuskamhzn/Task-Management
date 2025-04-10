import React, { useState } from 'react';
import { FaEllipsisV, FaPlusCircle } from "react-icons/fa";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import ModifySubproject from '../../../Pages/User/Modify/SubProjectModify';
import CreateSubproject from "../../../Pages/User/Create/CreateSubproject";
import ViewSubDetail from '../../../Pages/User/Projects/ViewSubDetail';

const ProjectKanban = ({ toDoProjects, inProgressProjects, completedProjects, setProjects, auth }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const [hoveredProject, setHoveredProject] = useState(null);
  const { projectId } = useParams();
  const [selectedSubproject, setSelectedSubproject] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, subProjectId: null, subProjectTitle: '' });

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); // State for ViewProjectDetail popup
  const [viewSubProjectId, setViewSubProjectId] = useState(null); // Track project to view

  // Modal visibility state for CreateTask
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateSubprojectClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateSubprojectModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleSubprojectCreated = (subProject) => {
    setProjects((prevProjects) => {
      const updatedProjects = Array.isArray(prevProjects) ? prevProjects : [];
      return [...updatedProjects, subProject.subProject];
    });
  };

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
    setSelectedSubproject(subProjectId);
    setOpenMenu(null); // Close dropdown after selecting modify
  };

  const handleCloseModal = () => {
    setSelectedSubproject(null);
  };

  const handleDelete = async (subProjectId) => {
    try {
      const url = `${process.env.REACT_APP_API}/api/project/delete-subproject/${projectId}/${subProjectId}`;
      await axios.delete(url, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      setProjects((prev) => prev.filter((project) => project._id !== subProjectId));
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

  const openConfirmDialog = (subProjectId, subProjectTitle) => {
    setConfirmDialog({ isOpen: true, subProjectId, subProjectTitle });
    setOpenMenu(null); // Close dropdown when opening confirm dialog
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, subProjectId: null, subProjectTitle: '' });
  };

  const handleConfirmDelete = () => {
    handleDelete(confirmDialog.subProjectId);
    closeConfirmDialog();
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
        onMouseEnter={() => setHoveredProject(project._id)}
        onMouseLeave={() => {
          setHoveredProject(null);
          setOpenMenu(null);
        }}
        onClick={() => handleViewDetail(project._id)} // Pass subproject ID
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{project.title}</h3>
          {hoveredProject === project._id && (
            <div className="relative">
              <FaEllipsisV
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
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
                    onClick={() => handleModify(project._id)}
                  >
                    Modify
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                    onClick={() => openConfirmDialog(project._id, project.title)}
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

  const handleViewDetail = (subProjectId) => {
    setViewSubProjectId(subProjectId); // Use subproject ID
    setIsDetailModalOpen(true);
    setOpenMenu(null);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false); // Close ViewProjectDetail popup
    setViewSubProjectId(null);
  };

  return (
    <div className="flex gap-6 p-6">
      <div
        className="flex-1 p-4 bg-gray-300 rounded-lg shadow-md"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, "To Do")}
      >
        {/* <h2 className="text-xl font-semibold text-center mb-4">To Do</h2> */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-center mb-4">To Do</h2>
          <div className="relative inline-block">
            <button
              onClick={handleCreateSubprojectClick}
              className="text-2xl text-gray-800 hover:text-gray-600"
            >
              <FaPlusCircle />
            </button>
          </div>
        </div>
        {toDoProjects.length === 0 ? <div>No Projects</div> : renderProjects(toDoProjects)}
      </div>
      <div
        className="flex-1 p-4 bg-yellow-300 rounded-lg shadow-md"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, "In Progress")}
      >
        <h2 className="text-xl font-semibold text-center mb-4">In Progress</h2>
        {inProgressProjects.length === 0 ? <div>No Projects</div> : renderProjects(inProgressProjects)}
      </div>
      <div
        className="flex-1 p-4 bg-green-300 rounded-lg shadow-md"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, "Completed")}
      >
        <h2 className="text-xl font-semibold text-center mb-4">Completed</h2>
        {completedProjects.length === 0 ? <div>No Projects</div> : renderProjects(completedProjects)}
      </div>
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
      {/* Custom Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm transform transition-all">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Delete Subproject</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "<span className="font-medium">{confirmDialog.subProjectTitle}</span>"?
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

      {isCreateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <CreateSubproject onClose={handleCloseCreateSubprojectModal} onSubProjectCreated={handleSubprojectCreated} />
        </div>
      )}

      {/* Modal for Viewing Project Details */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <ViewSubDetail
            mainProjectId={projectId} // Main project ID from useParams
            subProjectId={viewSubProjectId} // Subproject ID from clicked card
            onClose={handleCloseDetailModal}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectKanban;