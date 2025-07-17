import { useState, useRef, useEffect } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useAuth } from "../../context/auth";
import ViewTaskDetail from "../../Pages/User/Tasks/ViewTaskDetail"; // Adjust path as needed
import ViewProjectDetail from "../../Pages/User/Projects/ViewProjectDetail"; // Adjust path as needed

const calendarStyles = {
  "--fc-border-color": "rgb(229, 231, 235)", // Tailwind gray-200
  "--fc-today-bg-color": "rgba(221, 214, 254, 0.1)", // Tailwind violet-200 with opacity
  "--fc-event-text-color": "#fff",
  "--fc-button-text-color": "#fff",
  "--fc-button-bg-color": "rgb(167, 139, 250)", // Tailwind violet-400
  "--fc-button-border-color": "rgb(167, 139, 250)", // Tailwind violet-400
  "--fc-button-hover-bg-color": "rgb(139, 92, 246)", // Tailwind violet-500
  "--fc-button-hover-border-color": "rgb(139, 92, 246)", // Tailwind violet-500
  "--fc-button-active-bg-color": "rgb(109, 40, 217)", // Tailwind violet-600
  "--fc-button-active-border-color": "rgb(109, 40, 217)", // Tailwind violet-600
};

export default function Calendar({ refreshTrigger }) {
  const [auth] = useAuth();
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toLocaleString("default", { month: "long", year: "numeric" })
  );
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null); // Stores { id, type }
  const calendarRef = useRef(null);

  // Normalize date to YYYY-MM-DD format
  const normalizeDate = (date) => {
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        console.warn(`Invalid dueDate: ${date}`);
        return null;
      }
      return parsedDate.toISOString().split("T")[0]; // Returns YYYY-MM-DD
    } catch (error) {
      console.error(`Error parsing dueDate: ${date}`, error);
      return null;
    }
  };

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/api/task`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (response.data.message === "No tasks found") {
        setTasks([]);
        setError("No tasks found");
      } else {
        const taskData = response.data.data || response.data;
        const sortedTasks = Array.isArray(taskData)
          ? taskData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          : [];
        setTasks(sortedTasks);
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to fetch tasks");
      setTasks([]);
    }
  };

  // Fetch projects
  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/api/project`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (response.data.message === "No projects found") {
        setProjects([]);
        setError("No projects found");
      } else {
        const projectData = response.data.data || response.data;
        const sortedProjects = Array.isArray(projectData)
          ? projectData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          : [];
        setProjects(sortedProjects);
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to fetch projects");
      setProjects([]);
    }
  };

  // Fetch data on mount and when refreshTrigger changes
  useEffect(() => {
    if (auth.token) {
      setLoading(true);
      Promise.all([fetchTasks(), fetchProjects()]).finally(() => setLoading(false));
    } else {
      setLoading(false);
      setError("No authentication token available");
    }
  }, [auth.token, refreshTrigger]);

  // Map tasks and projects to calendar events
  const calendarEvents = [
    ...tasks.map((task) => {
      const eventDate = normalizeDate(task.dueDate);
      if (!eventDate) {
        console.warn(`Skipping task due to invalid dueDate: ${task.title}`, task.dueDate);
        return null;
      }
      return {
        id: task._id,
        title: `Task: ${task.title}`,
        date: eventDate,
        className: "bg-purple-500 border-violet-500 text-white", // Tailwind classes for tasks
        type: "task", // Add type for modal rendering
      };
    }).filter(event => event !== null),
    ...projects.map((project) => {
      const eventDate = normalizeDate(project.dueDate);
      if (!eventDate) {
        console.warn(`Skipping project due to invalid dueDate: ${project.title}`, project.dueDate);
        return null;
      }
      return {
        id: project._id,
        title: `Project: ${project.title}`,
        date: eventDate,
        className: "bg-blue-500 border-blue-500 text-white", // Tailwind classes for projects
        type: "project", // Add type for modal rendering
      };
    }).filter(event => event !== null),
  ];

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

  const handleEventClick = (info) => {
    const event = calendarEvents.find((e) => e.id === info.event.id);
    if (event) {
      setSelectedEvent({ id: event.id, type: event.type });
      setIsDetailModalOpen(true);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className="rounded-lg border bg-white shadow-lg overflow-hidden">
      <div className="border-b p-4 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-violet-700 mr-2"
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
            className="px-3 py-1 text-sm bg-violet-100 text-violet-700 rounded-md hover:bg-violet-200 transition-colors"
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
        {loading ? (
          <p className="text-center text-gray-500">Loading tasks and projects...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : calendarEvents.length === 0 ? (
          <p className="text-center text-gray-500">No tasks or projects scheduled.</p>
        ) : null}
        <div className="w-full h-[500px]" style={calendarStyles}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            initialDate={new Date()}
            headerToolbar={false}
            datesSet={handleDatesSet}
            events={calendarEvents}
            eventClick={handleEventClick}
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
      {isDetailModalOpen && selectedEvent && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          {selectedEvent.type === "task" ? (
            <ViewTaskDetail taskId={selectedEvent.id} onClose={handleCloseDetailModal} />
          ) : (
            <ViewProjectDetail projectId={selectedEvent.id} onClose={handleCloseDetailModal} />
          )}
        </div>
      )}
    </div>
  );
}