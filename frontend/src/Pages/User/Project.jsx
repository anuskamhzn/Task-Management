import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from '../../context/auth'; 
import Navbar from "../../Components/Navigation/Navbar";
import Sidebar from "../../Components/Navigation/Sidebar";
import Kanban from "../../Components/Dashboard/Kanban";

const Project = () => {
  const [auth] = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!auth.token) {
        return;
      }

      try {
        const response = await axios.get(`${process.env.REACT_APP_API}/api/project`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });

        setProjects(response.data);
      } catch (err) {
        setError(err.response?.data?.message );
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [auth.token]);

  if (loading) return <div>Loading...</div>;

  // Even if there are no projects, we render the dashboard but display a message
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6">
          {projects.length === 0 ? (
            <div className="text-center text-gray-500">No projects found for this user</div>
          ) : (
            <Kanban projects={projects} /> // Pass the projects prop to Kanban
          )}
        </div>
      </div>
    </div>
  );
};

export default Project;
