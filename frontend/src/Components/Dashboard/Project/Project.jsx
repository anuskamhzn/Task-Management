import React, { useEffect, useState } from "react";
import axios from "axios";
import { NavLink, useParams } from "react-router-dom";
import { useAuth } from "../../../context/auth";
import Navbar from "../../Navigation/Navbar";
import Sidebar from "../../Navigation/Sidebar";
import ProjectKanban from './ProjectKanban';

const Project = () => {
  const [auth] = useAuth();  // Access user and token from auth context
  const { projectId } = useParams();  // Get taskId from URL params
  const [mainProject, setMainProject] = useState(null);
  const [projects, setProjects] = useState([]);  // Store the fetched sub-projects
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (projectId && auth.token) {
      const fetchMainProject = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API}/api/project`,
            {
              headers: { Authorization: `Bearer ${auth.token}` },
            }
          );
  
          // Check if the response is an array and set the first item in the array
          if (response.data && response.data.length > 0) {
            setMainProject(response.data[0]); // Set the first project in the array
          } else {
            setError("No projects found.");
          }
        } catch (err) {
          console.error();
          setError("Error fetching main project.");
        }
      };
  
      fetchMainProject();
    }
  }, [projectId, auth.token]);
  

  useEffect(() => {
    setProjects([]);  // Clear previous data
    setError(null);  // Clear any errors
    setLoading(true); // Set loading state
    if (auth && auth.user) {
      fetchSubProjects();  // Fetch data when auth is available
    }
  }, [auth, projectId]);

  const fetchSubProjects = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API}/api/project/subproject/${projectId}`,  // Make sure projectId is passed correctly
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,  // Pass the token from auth context
          },
        }
      );

      // Check if the response contains subProjects and set the state
      if (response.data && response.data.subProjects) {
        setProjects(response.data.subProjects);
      } else {
        setError("No subprojects found for this project.");
      }
    } catch (err) {
      console.error("Error fetching sub-projects:", err);

      // Handle errors gracefully, including 404 and other errors
      if (err.response && err.response.status === 404) {
        setError();
      } else {
        setError("Failed to fetch sub-projects. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!auth || !auth.user) {
    return <p>Please log in to view your projects.</p>;
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6">
          {error && <div className="text-black mb-4">{error}</div>}  {/* Display error message */}

          {/* Always display the "Create Sub Project" button */}
          <NavLink to={`/create-project/${projectId}`}>
            <button className="bg-indigo-900 text-white py-2 px-4 mb-2 rounded-lg shadow-md hover:bg-indigo-800 hover:shadow-lg transition duration-300 ease-in-out">
              Create Sub Project
            </button>
          </NavLink>

          {/* Render the title and Kanban board only if subProjects exist */}
          {projects.length > 0 ? (
            <>
              <h1>Project: {mainProject?.title}</h1> {/* You can replace this with actual project details if needed */}
              <ProjectKanban
                toDoProjects={projects.filter((task) => task.status === "To Do")}
                inProgressProjects={projects.filter((task) => task.status === "In Progress")}
                completedProjects={projects.filter((task) => task.status === "Completed")}
                projects={projects}
                setProjects={setProjects}
                auth={auth}
              />
            </>
          ) : (
            <p>No sub-projects available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Project;
