import { useState, useRef, useEffect } from "react";
import Navbar from "../../Components/Navigation/Navbar";
import { Metrics } from "../../Components/Homepage/metrics";
import Statistics from "../../Components/Homepage/Statistics";
import Sidebar from "../../Components/Navigation/Sidebar";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import CreateTask from "../User/Create/CreateTask";
import CreateProjectForm from "../User/Create/CreateProject";

const calendarStyles = {
  "--fc-border-color": "rgb(229, 231, 235)",
  "--fc-today-bg-color": "rgba(126, 34, 206, 0.1)",
  "--fc-event-bg-color": "#7e22ce",
  "--fc-event-border-color": "#7e22ce",
  "--fc-event-text-color": "#fff",
  "--fc-button-text-color": "#fff",
  "--fc-button-bg-color": "#7e22ce",
  "--fc-button-border-color": "#7e22ce",
  "--fc-button-hover-bg-color": "#6b21a8",
  "--fc-button-hover-border-color": "#6b21a8",
  "--fc-button-active-bg-color": "#581c87",
  "--fc-button-active-border-color": "#581c87",
};

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isCreateModalTaskOpen, setIsCreateModalTaskOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toLocaleString("default", { month: "long", year: "numeric" })
  );
  const [refreshMetrics, setRefreshMetrics] = useState(0); // Add state to trigger refetch
  const calendarRef = useRef(null);

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
    setRefreshMetrics((prev) => prev + 1); // Trigger refetch
  };

  const handleProjectCreated = (newProject) => {
    setProjects((prevProjects) => [...prevProjects, newProject]); // Fixed typo
    setRefreshMetrics((prev) => prev + 1); // Trigger refetch
  };

  const handlePrevMonth = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.prev();
      updateCurrentMonth(calendarApi);
    }
  };

  const handleNextMonth = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.next();
      updateCurrentMonth(calendarApi);
    }
  };

  const handleToday = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.today();
      updateCurrentMonth(calendarApi);
    }
  };

  const updateCurrentMonth = (calendarApi) => {
    const date = calendarApi.getDate();
    setCurrentMonth(date.toLocaleString("default", { month: "long", year: "numeric" }));
  };

  const handleDatesSet = (arg) => {
    const date = arg.view.currentStart;
    setCurrentMonth(date.toLocaleString("default", { month: "long", year: "numeric" }));
  };

  const calendarEvents = tasks.map((task) => ({
    title: task.title,
    date: task.date,
    backgroundColor: "#7e22ce",
    borderColor: "#7e22ce",
  }));

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
            <Metrics refreshTrigger={refreshMetrics} /> {/* Pass refreshTrigger */}
            <div className="grid gap-6 md:grid-cols-2">
              <Statistics refreshTrigger={refreshMetrics} /> {/* Pass refreshTrigger */}
              <div className="rounded-lg border bg-white shadow-lg overflow-hidden">
                <div className="border-b p-4 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-purple-700 mr-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <h2 className="text-lg font-semibold text-gray-800">{currentMonth}</h2>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleToday}
                      className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                    >
                      Today
                    </button>
                    <button
                      onClick={handlePrevMonth}
                      className="p-1.5 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 text-gray-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </button>
                    <button
                      onClick={handleNextMonth}
                      className="p-1.5 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 text-gray-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="w-full h-[500px]" style={calendarStyles}>
                    <FullCalendar
                      ref={calendarRef}
                      plugins={[dayGridPlugin, interactionPlugin]}
                      initialView="dayGridMonth"
                      initialDate={new Date()}
                      headerToolbar={false}
                      datesSet={handleDatesSet}
                      events={calendarEvents}
                      eventClick={(info) => {
                        alert(`Event: ${info.event.title}`);
                      }}
                      eventTimeFormat={{
                        hour: "2-digit",
                        minute: "2-digit",
                        meridiem: "short",
                      }}
                      dayMaxEvents={2}
                      eventLimit={true}
                      height="500px"
                      contentHeight="500px"
                      aspectRatio={1.35}
                      editable={true}
                      selectable={true}
                      selectMirror={true}
                      dayMaxEventRows={true}
                    />
                  </div>
                </div>
              </div>
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