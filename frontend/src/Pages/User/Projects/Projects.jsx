import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/auth";
import Navbar from "../../../Components/Navigation/Navbar";
import Sidebar from "../../../Components/Navigation/Sidebar";
import { NavLink } from "react-router-dom";
import { FaTrash, FaEllipsisV, FaEdit, FaTrashAlt } from "react-icons/fa";
import { toast } from 'react-hot-toast';
import ModifyProject from "../Modify/ModifyProject";
import CreateProjectForm from "../Create/CreateProject";
import parse from 'html-react-parser';
import ViewProjectDetail from './ViewProjectDetail';

const Projects = () => {
  const [auth] = useAuth();
  const [projects, setProjects] = useState([]);
  const [hoveredProject, setHoveredProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, projectId: null, projectTitle: '' });
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewProjectId, setViewProjectId] = useState(null);

  useEffect(() => {
    setProjects([]);
    setError(null);
    setLoading(true);
    if (auth && auth.user) {
      fetchProjects();
    }
  }, [auth]);

  // Prevent scrolling when modals are open
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

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/api/project`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (response.data.message === "No projects found") {
        setProjects([]);
        setError("No projects found");
      } else {
        const sortedProjects = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setProjects(sortedProjects);
      }
    } catch (err) {
      setError("Error fetching projects");
    } finally {
      setLoading(false);
    }
  };

  if (!auth || !auth.user) {
    return <p className="text-center text-gray-500 py-4">Please log in to view your projects.</p>;
  }

  const handleModify = (projectId) => {
    setSelectedProject(projectId);
    setOpenMenu(null);
  };

  const handleDelete = async (projectId) => {
    try {
      const url = `${process.env.REACT_APP_API}/api/project/delete/${projectId}`;
      await axios.delete(url, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setProjects((prevProjects) => prevProjects.filter((project) => project._id !== projectId));
      toast.success("Project deleted successfully!");
    } catch (err) {
      console.error("Error deleting project:", err);
      toast.error("There was an error deleting the project.");
    }
  };

  const openConfirmDialog = (projectId, projectTitle) => {
    setConfirmDialog({ isOpen: true, projectId, projectTitle });
    setOpenMenu(null);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, projectId: null, projectTitle: '' });
  };

  const handleConfirmDelete = () => {
    handleDelete(confirmDialog.projectId);
    closeConfirmDialog();
  };

  const handleMenuToggle = (e, projectId) => {
    e.stopPropagation();
    setOpenMenu(openMenu === projectId ? null : projectId);
  };

  const handleCreateProjectClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateProjectModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleProjectCreated = (newProject) => {
    setProjects((prevProjects) => [newProject, ...prevProjects]);
  };

  const handleViewDetail = (projectId) => {
    setViewProjectId(projectId);
    setIsDetailModalOpen(true);
    setOpenMenu(null);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setViewProjectId(null);
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
            <h1 className="text-2xl font-bold text-gray-800">Team Projects</h1>
            <div className="flex gap-4 items-center">
              <button
                onClick={handleCreateProjectClick}
                className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow-md transition"
              >
                <span className="mr-2 text-lg">+</span> Create Project
              </button>
              <NavLink
                to="/dashboard/projectTrash"
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
          ) : projects.length === 0 ? (
            <p className="text-center text-gray-500 py-4 bg-white rounded-md shadow">No projects available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {projects.map((project) => (
                <div
                  key={project._id}
                  onClick={() => handleViewDetail(project._id)}
                  className="bg-white p-5 rounded-md shadow-md hover:shadow-lg transition relative group border border-gray-200 cursor-pointer"
                  onMouseLeave={() => {
                    setHoveredProject(null);
                    setOpenMenu(null);
                  }}
                >
                  <h3 className="text-lg font-bold text-gray-700 mb-2 truncate">{project.title}</h3>
                  <div className="text-gray-600 text-sm mb-4 line-clamp-2 description-content">
                    {parse(project.description)}
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                    <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${project.status === 'Completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                        }`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <NavLink
                    to={`/dashboard/project/subproject/${project._id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-block bg-violet-600 hover:bg-violet-700 text-white text-sm px-4 py-2 rounded-md transition"
                  >
                    View Project
                  </NavLink>

                  <div
                    className="absolute top-3 right-3 cursor-pointer hidden group-hover:block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaEllipsisV
                      onClick={(e) => handleMenuToggle(e, project._id)}
                      className="text-gray-600 hover:text-gray-800 transition"
                    />
                  </div>

                  {openMenu === project._id && (
                    <div
                      className="absolute right-3 top-8 w-32 bg-white shadow-lg border border-gray-200 rounded-md z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleModify(project._id)}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-teal-600 hover:bg-teal-50"
                      >
                        <FaEdit /> Modify
                      </button>
                      <button
                        onClick={() => openConfirmDialog(project._id, project.title)}
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
          <CreateProjectForm onClose={handleCloseCreateProjectModal} onProjectCreated={handleProjectCreated} />
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

      {isDetailModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <ViewProjectDetail projectId={viewProjectId} onClose={handleCloseDetailModal} />
        </div>
      )}

      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm transform transition-all">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Delete Project</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "<span className="font-medium">{confirmDialog.projectTitle}</span>"?
              <span className="block text-sm text-red-500 mt-1">This action will move the project to the trash.</span>
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

export default Projects;