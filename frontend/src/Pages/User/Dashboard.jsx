import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../Components/Navigation/Navbar"
import {Metrics} from "../../Components/Homepage/metrics"
import {Projects} from "../../Components/Homepage/projects"
import Sidebar from "../../Components/Navigation/Sidebar"
import { useAuth } from '../../context/auth'; 

import Kanban from "../../Components/Dashboard/Kanban";
export default function Dashboard() {
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
        setError(err.response?.data?.message);
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
              {projects.length === 0 ? (
                <div className="text-center text-gray-500">No projects found for this user</div>
              ) : (
                <Kanban projects={projects} />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
