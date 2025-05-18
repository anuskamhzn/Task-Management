import { useState, useEffect } from "react";
import Navbar from "../../Components/Navigation/Navbar";
import { Metrics } from "../../Components/Homepage/metrics";
import Statistics from "../../Components/Homepage/Statistics";
import Sidebar from "../../Components/Navigation/Sidebar";
import CreateTask from "../User/Create/CreateTask";
import CreateProjectForm from "../User/Create/CreateProject";
import Calendar from "../../Components/Homepage/Calendar";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isCreateModalTaskOpen, setIsCreateModalTaskOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshMetrics, setRefreshMetrics] = useState(0);

  useEffect(() => {
    if (isCreateModalTaskOpen || isCreateModalOpen) {
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
  }, [isCreateModalTaskOpen, isCreateModalOpen]);

  const handleCreateTaskClick = () => {
    setIsCreateModalTaskOpen(true);
  };

  const handleCloseCreateTaskModal = () => {
    setIsCreateModalTaskOpen(false);
  };

  const handleCreateProjectClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateProjectModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleTaskCreated = (newTask) => {
    setTasks((prevTasks) => [...prevTasks, newTask]);
    setRefreshMetrics((prev) => prev + 1);
  };

  const handleProjectCreated = (newProject) => {
    setProjects((prevProjects) => [...prevProjects, newProject]);
    setRefreshMetrics((prev) => prev + 1);
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <aside className="h-screen sticky top-0 w-64 bg-gray-800 text-white">
        <Sidebar />
      </aside>
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <svg
                className="w-8 h-8 text-purple-700 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleCreateTaskClick}
                className="bg-purple-700 text-white py-2.5 px-5 rounded-lg shadow hover:bg-purple-800 transition duration-300 font-medium flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Create Task
              </button>
              <button
                onClick={handleCreateProjectClick}
                className="bg-violet-700 text-white py-2.5 px-5 rounded-lg shadow hover:bg-violet-800 transition duration-300 font-medium flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
                Create Team Project
              </button>
            </div>
          </div>
          <div className="space-y-6">
            <Metrics refreshTrigger={refreshMetrics} />
            <div className="grid gap-6 md:grid-cols-2">
              <Statistics refreshTrigger={refreshMetrics} />
              <Calendar />
            </div>
            {isCreateModalTaskOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                <CreateTask onClose={handleCloseCreateTaskModal} onTaskCreated={handleTaskCreated} />
              </div>
            )}
            {isCreateModalOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                <CreateProjectForm onClose={handleCloseCreateProjectModal} onProjectCreated={handleProjectCreated} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}