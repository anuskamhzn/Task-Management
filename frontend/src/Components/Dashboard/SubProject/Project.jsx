import React, { useEffect, useState } from "react";
import axios from "axios";
import { NavLink, useParams } from "react-router-dom";
import { useAuth } from "../../../context/auth";
import Navbar from "../../Navigation/Navbar";
import Sidebar from "../../Navigation/Sidebar";
import ProjectKanban from './ProjectKanban';
import { FaTrash } from "react-icons/fa";
import CreateSubproject from "../../../Pages/User/Create/CreateSubproject";
import Members from "../../../Pages/User/Projects/Members";
import ViewSubDetail from "../../../Pages/User/Projects/ViewSubDetail";
import { FaChartGantt } from "react-icons/fa6";
import SubProjectAnalytics from "./SubProjectAnalytics";

const Project = () => {
  const [auth] = useAuth();
  const { projectId } = useParams();
  const [mainProject, setMainProject] = useState(null);
  const [projects, setProjects] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  useEffect(() => {
    if (projectId && auth.token) {
      fetchMainProject();
    }
  }, [projectId, auth.token]);

  // Prevent scrolling when modals are open
  useEffect(() => {
    if (isMembersModalOpen || isCreateModalOpen) {
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
  }, [isMembersModalOpen, isCreateModalOpen]);

  useEffect(() => {
    setProjects([]); // Ensure projects is always an array
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
        setProjects([]); // Set empty array if no subprojects
        setProjects(response.data.subProjects); // Set subprojects
      } else {
        setError("No subprojects found.");
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError("No subprojects found.");
        setProjects([]); // Set empty array on error
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
      const updatedProjects = Array.isArray(prevProjects) ? prevProjects : [];
      return [...updatedProjects, subProject.subProject];
    });
  };

  const handleSeeMembers = () => {
    setIsMembersModalOpen(true);
  };

  const handleCloseMembersModal = () => {
    setIsMembersModalOpen(false);
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
                onClick={handleSeeMembers}
                className="flex items-center bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition"
              >
                See Members
              </button>
              <NavLink
                to={`/dashboard/project/${projectId}/gantt`}
                className="flex items-center bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-lg shadow-md transition"
              >
                <FaChartGantt className="mr-2" />
                Gantt
              </NavLink>
              <NavLink to={`/dashboard/subproject-trash/${projectId}`} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-md transition">
                <FaTrash className="text-lg" />
              </NavLink>
            </div>
          </div>
          {/* <SubProjectAnalytics auth={auth} mainProjectId={projectId} /> */}
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : (
            <ProjectKanban
              toDoProjects={(projects || []).filter(project => project.status === "To Do")}
              inProgressProjects={(projects || []).filter(project => project.status === "In Progress")}
              completedProjects={(projects || []).filter(project => project.status === "Completed")}
              projects={projects || []}
              setProjects={setProjects}
              auth={auth}
            />
          )}
        </div>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <CreateSubproject onClose={handleCloseCreateSubprojectModal} onSubProjectCreated={handleSubprojectCreated} />
        </div>
      )}

      {isMembersModalOpen && (
        <Members onClose={handleCloseMembersModal} />
      )}
    </div>
  );
};

export default Project;