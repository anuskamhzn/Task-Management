import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/auth";
import Navbar from "../../../Components/Navigation/Navbar";
import Sidebar from "../../../Components/Navigation/Sidebar";
import { NavLink } from "react-router-dom";
import { FaTrash } from "react-icons/fa";

const Projects = () => {
  const [auth] = useAuth();  // Access user and token from auth context
  const [project, setProjects] = useState(null);  // Initially set tasks to null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    setProjects(null);  // Clear previous task data
    setError(null);  // Clear error message
    setLoading(true); // Ensure loading state resets
    if (auth && auth.user) {
      fetchProjects();
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

  if (!auth || !auth.user) {
    return <p>Please log in to view your tasks.</p>;
  }

  // if (loading) return <div>Loading...</div>;

  return (
    <div className="flex bg-gray-50">
      {/* Sidebar - Fixed and Full Height */}
      <aside className="h-screen sticky top-0 w-64 bg-gray-800 text-white">
        <Sidebar />
      </aside>

      {/* Main Content - Scrollable */}
      <div className="flex-1 flex flex-col">
        <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="p-5 text-3xl font-bold">Projects</h1>
        <NavLink to="/dashboard/create"><button className="bg-indigo-900 text-white py-2 px-4 mb-2 ml-4 rounded-lg shadow-md hover:bg-indigo-800 hover:shadow-lg transition duration-300 ease-in-out">Create Team Project</button></NavLink>
        <NavLink to={`/dashboard/projectTrash`}><FaTrash /></NavLink>
        {error && <p className="text-red-500">{error}</p>}
        {project && project.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {project.map((project) => (
              <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300 ease-in-out" key={project.id}>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{project.title}</h3>
                <p className="text-gray-600 text-base mb-4">{project.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Due Date: {new Date(project.dueDate).toLocaleDateString()}</span>
                  <span>{project.status}</span>
                </div>
                <NavLink
                  to={`/dashboard/project/subproject/${project._id}`}
                  className="mt-4 inline-block px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition"
                >
                  View Task
                </NavLink>
              </div>
            ))}
          </div>
        ) : (
          <p>No tasks available.</p>
        )}
      </div>
    </div>
    </div>
  );
};

export default Projects;
