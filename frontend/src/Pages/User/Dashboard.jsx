import React, { useState } from "react";
import Navbar from "../../Components/Navigation/Navbar"
import { Metrics } from "../../Components/Homepage/metrics"
import Sidebar from "../../Components/Navigation/Sidebar"
import FullCalendar from "@fullcalendar/react"; // FullCalendar Component
import dayGridPlugin from "@fullcalendar/daygrid"; // Day grid view
import interactionPlugin from "@fullcalendar/interaction";
import CreateTask from "../User/Create/CreateTask";
import CreateProjectForm from "../User/Create/CreateProject";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);  // Initialize with an empty array to handle state better
  const [projects, setProjects] = useState([]);

  // Modal visibility state for CreateTask
  const [isCreateModalTaskOpen, setIsCreateModalTaskOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Toggle modal visibility
  const handleCreateTaskClick = () => {
    setIsCreateModalTaskOpen(true);
  };

  const handleCloseCreateTaskModal = () => {
    setIsCreateModalTaskOpen(false);
  };
  // Toggle modal visibility
  const handleCreateProjectClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateProjectModal = () => {
    setIsCreateModalOpen(false);
  };

  // Function to update task list with newly created task
  const handleTaskCreated = (newTask) => {
    setTasks((prevTasks) => [...prevTasks, newTask,]);  // Add the new task to the start of the task list
  };

  // Function to update task list with newly created task
  const handleProjectCreated = (newProject) => {
    setProjects((prevProjects) => [...prevProjects, newProject ]);  // Add the new task to the start of the task list
  };

  // if (loading) return <div>Loading...</div>;

  return (
    <div className="flex bg-gray-50">
      <aside className="h-screen sticky top-0 w-64 bg-gray-800 text-white">
        <Sidebar />
      </aside>

      {/* Main Content - Scrollable */}
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 overflow-y-auto">
          <button
            onClick={handleCreateTaskClick}
            className="bg-indigo-900 text-white py-2 px-4 mb-2 rounded-lg shadow-md hover:bg-indigo-800 hover:shadow-lg transition duration-300 ease-in-out">Create Task</button>
          <button
            onClick={handleCreateProjectClick}
            className="bg-indigo-900 text-white py-2 px-4 mb-2 ml-4 rounded-lg shadow-md hover:bg-indigo-800 hover:shadow-lg transition duration-300 ease-in-out">Create Team Project</button>
          <div className="space-y-6">
            <Metrics />

            <div className="grid gap-6 md:grid-cols-2">
              <div className="shadow-lg rounded-lg border bg-white">
                <div className="border-b p-4">
                  <h2 className="text-lg font-semibold">Statistics</h2>
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
                    //   { title: "Project Deadline", date: "2025-04-14" },
                    //   { title: "Team Meeting", date: "2025-04-18" },
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
            {/* <div className="p-6">
              <Kanban
                tasks={tasks}
                setTasks={setTasks}
                projects={projects}
                setProjects={setProjects}
              />
            </div> */}
            {/* Modal for Creating Task */}
            {isCreateModalTaskOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                <CreateTask onClose={handleCloseCreateTaskModal} onTaskCreated={handleTaskCreated} />
              </div>
            )}
            {/* Modal for Creating Project */}
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
