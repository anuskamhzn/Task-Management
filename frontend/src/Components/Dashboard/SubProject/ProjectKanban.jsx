import React, { useState, useEffect, useMemo } from 'react';
import { FaEllipsisV, FaPlusCircle, FaEdit, FaTrashAlt, FaEye } from "react-icons/fa";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import ModifySubproject from '../../../Pages/User/Modify/SubProjectModify';
import CreateSubproject from "../../../Pages/User/Create/CreateSubproject";
import ViewSubDetail from '../../../Pages/User/Projects/ViewSubDetail';
import parse from 'html-react-parser';
import OverdueBadge from '../OverdueBadge';

const ProjectKanban = ({ toDoProjects, inProgressProjects, completedProjects, setProjects, auth }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const [hoveredProject, setHoveredProject] = useState(null);
  const { projectId } = useParams();
  const [selectedSubproject, setSelectedSubproject] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, subProjectId: null, subProjectTitle: '' });
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewSubProjectId, setViewSubProjectId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (isDetailModalOpen || isCreateModalOpen) {
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
  }, [isDetailModalOpen, isCreateModalOpen]);

  const handleCreateSubprojectClick = () => setIsCreateModalOpen(true);
  const handleCloseCreateSubprojectModal = () => setIsCreateModalOpen(false);

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
      await axios.patch(url, { subProjectId, status: newStatus }, { headers: { Authorization: `Bearer ${auth.token}` } });
      setProjects((prev) => prev.map((project) => 
        project._id === subProjectId 
          ? { ...project, status: newStatus, isOverdue: newStatus !== "Completed" && new Date(project.dueDate) < new Date() } 
          : project
      ));
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error(err.response?.data.message === "Only assigned members can update the status."
        ? "Only assigned members can update the status."
        : "Error updating status.");
    }
  };

  const handleModify = (e, subProjectId) => {
    e.stopPropagation();
    setSelectedSubproject(subProjectId);
    setOpenMenu(null);
  };

  const handleCloseModal = () => setSelectedSubproject(null);

  const handleDelete = async (subProjectId) => {
    try {
      const url = `${process.env.REACT_APP_API}/api/project/delete-subproject/${projectId}/${subProjectId}`;
      await axios.delete(url, { headers: { Authorization: `Bearer ${auth.token}` } });
      setProjects((prev) => prev.filter((project) => project._id !== subProjectId));
      toast.success("Subproject deleted successfully!");
    } catch (err) {
      console.error("Error deleting subproject:", err);
      toast.error(err.response?.data.message === "Only owner can delete the project."
        ? "Only owner can delete the project."
        : "Error deleting project.");
    }
  };

  const openConfirmDialog = (e, subProjectId, subProjectTitle) => {
    e.stopPropagation();
    setConfirmDialog({ isOpen: true, subProjectId, subProjectTitle });
    setOpenMenu(null);
  };

  const closeConfirmDialog = () => setConfirmDialog({ isOpen: false, subProjectId: null, subProjectTitle: '' });
  const handleConfirmDelete = () => {
    handleDelete(confirmDialog.subProjectId);
    closeConfirmDialog();
  };

  const renderUsers = (users) => {
    const userArray = Array.isArray(users) ? users : [users];
    return userArray.map((user) => (
      <div
        key={user._id}
        title={user.username}
        className="w-9 h-9 rounded-full border-2 border-white shadow-md flex items-center justify-center"
      >
        {user.photo ? (
          <img
            src={`data:${user.photo.contentType};base64,${user.photo.data}`}
            alt={user.username}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 bg-gray-200 text-purple-800 rounded-full flex items-center justify-center text-sm font-medium">
            {user.initials || 'U'}
          </div>
        )}
      </div>
    ));
  };

  const handleDragStart = (e, projectId) => e.dataTransfer.setData("id", projectId);

  const cardColors = [
    'bg-indigo-100', 'bg-teal-100', 'bg-amber-100', 'bg-rose-100',
    'bg-emerald-100', 'bg-purple-100', 'bg-blue-100', 'bg-pink-100'
  ];

  const colorMap = useMemo(() => {
    const map = {};
    [...toDoProjects, ...inProgressProjects, ...completedProjects].forEach((project) => {
      if (!map[project._id]) {
        map[project._id] = cardColors[Math.floor(Math.random() * cardColors.length)];
      }
    });
    return map;
  }, [toDoProjects, inProgressProjects, completedProjects]);

  const renderProjects = (projects) => {
    const truncateDescription = (html, maxLength = 50) => {
      const div = document.createElement('div');
      div.innerHTML = html;
      const text = div.textContent || div.innerText || '';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return projects.map((project) => (
      <div
        key={project._id}
        className={`${colorMap[project._id]} p-5 mb-5 rounded-xl shadow-lg cursor-grab relative border ${project.isOverdue ? 'border-red-500 border-2' : 'border-gray-200'}`}
        draggable
        onDragStart={(e) => handleDragStart(e, project._id)}
        onMouseEnter={() => setHoveredProject(project._id)}
        onMouseLeave={() => { setHoveredProject(null); setOpenMenu(null); }}
        onClick={() => handleViewDetail(project._id)}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            {project.title}
            {project.isOverdue && <OverdueBadge />}
          </h3>
          {hoveredProject === project._id && (
            <div className="relative">
              <FaEllipsisV
                className="text-gray-600 cursor-pointer hover:text-teal-600"
                onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === project._id ? null : project._id); }}
              />
              {openMenu === project._id && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-10">
                  <button
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-teal-600 hover:bg-teal-50"
                    onClick={(e) => handleModify(e, project._id)}
                  >
                    <FaEdit className="mr-2" /> Modify
                  </button>
                  <button
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    onClick={(e) => openConfirmDialog(e, project._id, project.title)}
                  >
                    <FaTrashAlt className="mr-2" /> Delete
                  </button>
                  <button
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                    onClick={(e) => { e.stopPropagation(); handleViewDetail(project._id); }}
                  >
                    <FaEye className="mr-2" /> View Details
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="text-sm text-gray-700 mt-2 description-content line-clamp-1">
          {parse(project.description)}
        </div>
        <p className="text-xs text-gray-500 mt-2 italic">Due: {new Date(project.dueDate).toLocaleDateString()}</p>
        <div className="flex gap-2 mt-3">{renderUsers(project.members || [])}</div>
      </div>
    ));
  };

  const handleViewDetail = (subProjectId) => {
    setViewSubProjectId(subProjectId);
    setIsDetailModalOpen(true);
    setOpenMenu(null);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setViewSubProjectId(null);
  };

  return (
    <div className="flex gap-8 p-8 bg-gradient-to-br from-gray-50 to-gray-200 min-h-screen">
      <div
        className="flex-1 p-6 bg-white rounded-2xl shadow-lg border-t-4 border-teal-500"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, "To Do")}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-teal-700">To Do</h2>
          <button
            onClick={handleCreateSubprojectClick}
            className="text-3xl text-teal-500 hover:text-teal-700"
          >
            <FaPlusCircle />
          </button>
        </div>
        {toDoProjects.length === 0 ? (
          <div className="text-gray-600 text-center py-6">No Projects Yet</div>
        ) : (
          renderProjects(toDoProjects)
        )}
      </div>

      <div
        className="flex-1 p-6 bg-white rounded-2xl shadow-lg border-t-4 border-amber-500"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, "In Progress")}
      >
        <h2 className="text-2xl font-bold text-amber-700 mb-6">In Progress</h2>
        {inProgressProjects.length === 0 ? (
          <div className="text-gray-600 text-center py-6">No Projects Yet</div>
        ) : (
          renderProjects(inProgressProjects)
        )}
      </div>

      <div
        className="flex-1 p-6 bg-white rounded-2xl shadow-lg border-t-4 border-emerald-500"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, "Completed")}
      >
        <h2 className="text-2xl font-bold text-emerald-700 mb-6">Completed</h2>
        {completedProjects.length === 0 ? (
          <div className="text-gray-600 text-center py-6">No Projects Yet</div>
        ) : (
          renderProjects(completedProjects)
        )}
      </div>

      {selectedSubproject && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
          <ModifySubproject
            auth={auth}
            setProjects={setProjects}
            subProjectId={selectedSubproject}
            onClose={handleCloseModal}
          />
        </div>
      )}

      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirm Deletion</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete "<span className="font-semibold text-teal-700">{confirmDialog.subProjectTitle}</span>"?
              <span className="block text-sm text-red-600 mt-2">This will move it to the trash.</span>
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeConfirmDialog}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
          <CreateSubproject onClose={handleCloseCreateSubprojectModal} onSubProjectCreated={handleSubprojectCreated} />
        </div>
      )}

      {isDetailModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
          <ViewSubDetail
            mainProjectId={projectId}
            subProjectId={viewSubProjectId}
            onClose={handleCloseDetailModal}
          />
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

export default ProjectKanban;