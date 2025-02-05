import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../Components/Navigation/Navbar"
import {Metrics} from "../../Components/Homepage/metrics"
import Sidebar from "../../Components/Navigation/Sidebar"
import { useAuth } from '../../context/auth'; 
import toast from "react-hot-toast";

import Kanban from "../../Components/Dashboard/Kanban";
import { NavLink } from "react-router-dom";
export default function Dashboard() {
  const [auth, setAuth] = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to refresh access token using refresh token
  const refreshAuthToken = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API}/api/auth/refresh-token`,
        { refreshToken: auth.refreshToken } // Sending the refresh token to backend
      );

      // Save new access token in localStorage and update state
      const newToken = response.data.accessToken;
      localStorage.setItem(
        "auth",
        JSON.stringify({ ...auth, token: newToken }) // Update with new token
      );

      // Update the auth context with new access token
      setAuth({
        ...auth,
        token: newToken,
      });
    } catch (err) {
      console.error("Error refreshing token:", err);
      toast.error("Session expired. Please log in again.");
      // Optionally, clear localStorage and redirect to login
      localStorage.removeItem("auth");
      window.location.href = "/login"; // Redirect to login
    }
  };

  // Fetch projects and handle token expiration
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
        // If the error is related to token expiration (e.g., 401 Unauthorized), refresh the token
        if (err.response?.status === 401) {
          await refreshAuthToken();
          fetchProjects(); // Retry fetching projects after refreshing the token
        } else {
          setError(err.response?.data?.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [auth.token]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex bg-gray-50">
      {/* Sidebar - Fixed and Full Height */}
      <aside className="h-screen sticky top-0 w-64 bg-gray-800 text-white">
        <Sidebar />
      </aside>

      {/* Main Content - Scrollable */}
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 overflow-y-auto">
          <NavLink to="/task"><button className="bg-indigo-900 text-white py-2 px-4 mb-2 rounded-lg shadow-md hover:bg-indigo-800 hover:shadow-lg transition duration-300 ease-in-out">Create Task</button></NavLink>
          <NavLink to="/create"><button className="bg-indigo-900 text-white py-2 px-4 mb-2 ml-4 rounded-lg shadow-md hover:bg-indigo-800 hover:shadow-lg transition duration-300 ease-in-out">Create Team Project</button></NavLink>
          <div className="space-y-6">
            <Metrics />

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border bg-white">
                <div className="border-b p-4">
                  <h2 className="text-lg font-semibold">Project Statistics</h2>
                </div>
                <div className="p-4">
                  <div className="h-[300px]" />
                </div>
              </div>

              <div className="rounded-lg border bg-white">
                <div className="border-b p-4">
                  <h2 className="text-lg font-semibold">Calendar</h2>
                </div>
                <div className="p-4">
                  <div className="h-[300px]" />
                </div>
              </div>
            </div>

            <div className="p-6">
            <Kanban />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
