import React, { useState, useEffect, useMemo } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/auth';
import { toast } from 'react-hot-toast';
import Navbar from '../../Navigation/Navbar';
import Sidebar from '../../Navigation/Sidebar';

const GanttChart = () => {
  const [auth] = useAuth();
  const { projectId } = useParams();
  const [subProjects, setSubProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredProject, setHoveredProject] = useState(null);

  // Fetch subprojects for the main project
  useEffect(() => {
    const fetchSubProjects = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API}/api/project/subproject/${projectId}`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });

        if (response.data && response.data.subProjects) {
          setSubProjects([]); // Set empty array if no subprojects
          setSubProjects(response.data.subProjects); // Set subprojects
        } else {
          setError("No subprojects found.");
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError("No subprojects found.");
          setSubProjects([]); // Set empty array on error
        } else {
          setError("Failed to fetch sub-projects. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSubProjects();
  }, [projectId, auth.token]);

  // Calculate timeline range and bar positions using only createdAt and dueDate
  const timelineData = useMemo(() => {
    if (!subProjects.length) return { uniqueDates: [], projects: [] };

    // Collect all unique createdAt and dueDate values
    const dateSet = new Set();
    subProjects.forEach((project) => {
      dateSet.add(new Date(project.createdAt).toISOString().split('T')[0]);
      dateSet.add(new Date(project.dueDate).toISOString().split('T')[0]);
    });

    // Sort unique dates chronologically
    const uniqueDates = Array.from(dateSet)
      .map((date) => new Date(date))
      .sort((a, b) => a - b);

    if (!uniqueDates.length) return { uniqueDates: [], projects: [] };

    // Calculate total timeline duration in milliseconds
    const minDate = uniqueDates[0];
    const maxDate = uniqueDates[uniqueDates.length - 1];
    const totalDuration = maxDate - minDate || 1;

    // Map projects with their startOffset and duration based on unique dates
    const projects = subProjects.map((project) => {
      const createdAt = new Date(project.createdAt);
      const dueDate = new Date(project.dueDate);
      const startOffsetMs = createdAt - minDate;
      let durationMs = dueDate - createdAt;

      // Ensure minimum duration of 1 day if createdAt and dueDate are the same
      if (durationMs <= 0) {
        durationMs = 1000 * 60 * 60 * 24; // 1 day in milliseconds
      }

      const startOffset = totalDuration ? (startOffsetMs / totalDuration) * 100 : 0;
      const duration = totalDuration ? (durationMs / totalDuration) * 100 : 5; // Minimum width for visibility

      return {
        ...project,
        startOffset,
        duration,
      };
    });

    return { uniqueDates, projects };
  }, [subProjects]);

  // Array of Tailwind background colors to match ProjectKanban
  const cardColors = [
    'bg-indigo-100',
    'bg-teal-100',
    'bg-amber-100',
    'bg-rose-100',
    'bg-emerald-100',
    'bg-purple-100',
    'bg-blue-100',
    'bg-pink-100',
  ];

  // Assign consistent colors to projects
  const colorMap = useMemo(() => {
    const map = {};
    subProjects.forEach((project) => {
      if (!map[project._id]) {
        map[project._id] = cardColors[Math.floor(Math.random() * cardColors.length)];
      }
    });
    return map;
  }, [subProjects]);

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
            <h1 className="text-3xl font-bold text-gray-800">Project Gantt Chart</h1>
            <NavLink
              to={`/dashboard/project/subproject/${projectId}`}
              className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-lg shadow-md transition"
            >
              Go Back
            </NavLink>
          </div>

          {loading ? (
            <div className="text-center text-gray-600">Loading...</div>
          ) : timelineData.projects.length === 0 ? (
            <div className="text-center text-gray-600">No subprojects available.</div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              {/* Timeline Header */}
              <div className="flex mb-4">
                <div className="w-48 flex-shrink-0">
                  <h2 className="text-sm font-semibold text-gray-600">Title</h2>
                </div>
                <div className="flex-1 relative">
                  <div className="flex justify-between text-sm text-gray-600">
                    {timelineData.uniqueDates.map((date, index) => (
                      <div key={index} className="text-center">
                        {formatDate(date)}
                      </div>
                    ))}
                  </div>
                  <div className="h-1 bg-gray-200 mt-2"></div>
                </div>
              </div>

              {/* Gantt Chart Bars */}
              <div>
                {timelineData.projects.map((project) => (
                  <div
                    key={project._id}
                    className="flex items-center mb-4"
                    onMouseEnter={() => setHoveredProject(project._id)}
                    onMouseLeave={() => setHoveredProject(null)}
                  >
                    {/* Project Title */}
                    <div className="w-48 flex-shrink-0 pr-4">
                      <h3 className="text-sm font-semibold text-gray-800 truncate">
                        {project.title}
                      </h3>
                    </div>
                    {/* Timeline Bar */}
                    <div className="flex-1 relative">
                      <div
                        className={`${colorMap[project._id]} h-8 rounded-lg shadow-md relative transition-all duration-200`}
                        style={{
                          marginLeft: `${project.startOffset}%`,
                          width: `${project.duration}%`,
                        }}
                      >
                        {/* Tooltip */}
                        {hoveredProject === project._id && (
                          <div className="absolute top-[-60px] left-0 bg-gray-800 text-white text-xs rounded-lg p-2 shadow-lg z-10 w-64">
                            <p>
                              <span className="font-semibold">Title:</span>{' '}
                              {project.title}
                            </p>
                            <p>
                              <span className="font-semibold">Start:</span>{' '}
                              {formatDate(project.createdAt)}
                            </p>
                            <p>
                              <span className="font-semibold">Due:</span>{' '}
                              {formatDate(project.dueDate)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GanttChart;