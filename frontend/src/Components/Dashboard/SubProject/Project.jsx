import React, { useEffect, useState } from "react";
import axios from "axios";
import { NavLink, useParams } from "react-router-dom";
import { useAuth } from "../../../context/auth";
import Navbar from "../../Navigation/Navbar";
import Sidebar from "../../Navigation/Sidebar";
import ProjectKanban from './ProjectKanban';
import { FaTrash } from "react-icons/fa";
import CreateSubproject from "../../../Pages/User/Create/CreateSubproject";

const Project = () => {
  const [auth] = useAuth();
  const { projectId } = useParams();
  const [mainProject, setMainProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (projectId && auth.token) {
      fetchMainProject();
    }
  }, [projectId, auth.token]);

  useEffect(() => {
    setProjects(null);
    setError(null);
    setLoading(true);
    if (auth && auth.user) {
      fetchSubProjects();
    }
  }, [auth, projectId]);

  const fetchMainProject = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/api/project`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      if (response.data && response.data.length > 0) {
        const foundProject = response.data.find(project => project._id === projectId);
        setMainProject(foundProject || null);
      } else {
        setError("No projects found.");
      }
    } catch (err) {
      console.error("Error fetching main project:", err);
      setError("Error fetching main project.");
    }
  };

  const fetchSubProjects = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/api/project/subproject/${projectId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      if (response.data && response.data.subProjects) {
        setProjects(response.data.subProjects);
      } else {
        setError("No subprojects found for this project.");
      }
    } catch (err) {
      console.error("Error fetching sub-projects:", err);
      if (err.response && err.response.status === 404) {
        setError("No subprojects found.");
      } else {
        setError("Failed to fetch sub-projects. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubprojectClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateSubprojectModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleSubprojectCreated = (subProject) => {
    setProjects((prevProjects) => {
      // Make sure prevProjects is an array
      const updatedProjects = Array.isArray(prevProjects) ? prevProjects : [];
      return [...updatedProjects, subProject.subProject];
    });
  };
  

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <aside className="h-screen w-64 bg-gray-900 text-white shadow-lg fixed top-0 left-0">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col ml-64">
        <Navbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Project Name: {mainProject ? mainProject.title : "Loading..."}
            </h1>
            <div className="flex gap-4 items-center">
              <button
                onClick={handleCreateSubprojectClick}
                className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition"
              >
                <span className="mr-2 text-xl">+</span> Create Sub Project
              </button>
              <NavLink to={`/dashboard/subproject-trash/${projectId}`} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-md transition">
                <FaTrash className="text-lg" />
              </NavLink>
            </div>
          </div>

          {/* {error && <p className="text-red-500 text-center">{error}</p>} */}
          {projects && projects.length > 0 ? (
            <ProjectKanban
              toDoProjects={projects.filter(project => project.status === "To Do")}
              inProgressProjects={projects.filter(project => project.status === "In Progress")}
              completedProjects={projects.filter(project => project.status === "Completed")}
              projects={projects}
              setProjects={setProjects}
              auth={auth}
            />
          ) : (
            <p className="text-center text-gray-500">No subprojects available.</p>
          )}
        </div>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <CreateSubproject onClose={handleCloseCreateSubprojectModal} onSubProjectCreated={handleSubprojectCreated} />
        </div>
      )}
    </div>
  );
};

export default Project;
