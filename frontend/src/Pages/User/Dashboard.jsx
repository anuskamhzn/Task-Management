import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../Components/Navigation/Navbar"
import { Metrics } from "../../Components/Homepage/metrics"
import Sidebar from "../../Components/Navigation/Sidebar"
import { useAuth } from '../../context/auth';
import toast from "react-hot-toast";

import FullCalendar from "@fullcalendar/react"; // FullCalendar Component
import dayGridPlugin from "@fullcalendar/daygrid"; // Day grid view
import interactionPlugin from "@fullcalendar/interaction";

import Kanban from "../../Components/Dashboard/Kanban";
import { NavLink } from "react-router-dom";
export default function Dashboard() {
  const [auth, setAuth] = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [date, setDate] = useState(new Date());

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
        <main className="flex-1 p-6 overflow-y-auto">
          <NavLink to="/dashboard/task"><button className="bg-indigo-900 text-white py-2 px-4 mb-2 rounded-lg shadow-md hover:bg-indigo-800 hover:shadow-lg transition duration-300 ease-in-out">Create Task</button></NavLink>
          <NavLink to="/dashboard/create"><button className="bg-indigo-900 text-white py-2 px-4 mb-2 ml-4 rounded-lg shadow-md hover:bg-indigo-800 hover:shadow-lg transition duration-300 ease-in-out">Create Team Project</button></NavLink>
          <div className="space-y-6">
            <Metrics />

            <div className="grid gap-6 md:grid-cols-2">
              <div className="shadow-lg rounded-lg border bg-white">
                <div className="border-b p-4">
                  <h2 className="text-lg font-semibold">Project Statistics</h2>
                </div>
                <div className="p-4">
                  <div className="h-[300px]" />
                </div>
              </div>

              {/* Calendar Section */}
              <div className="rounded-lg border bg-white shadow-lg">
                <div className="border-b p-4">
                  <h2 className="text-lg font-semibold">Calendar</h2>
                </div>
                <div className="p-4">
                  <div className="w-full h-[500px]"> {/* Set width and height to match the calendar */}
                    <FullCalendar
                      plugins={[dayGridPlugin, interactionPlugin]}
                      initialView="dayGridMonth"
                    // events={[
                    //   { title: "Project Deadline", date: "2025-02-14" },
                    //   { title: "Team Meeting", date: "2025-02-18" },
                    // ]}
                    // eventClick={(info) => {
                    //   alert(`Event: ${info.event.title}`);
                    // }}
                    // editable={true} // Enable dragging events
                    // droppable={true} // Allow dropping events
                    />
                  </div>
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
