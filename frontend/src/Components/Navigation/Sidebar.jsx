import { FaHome, FaTasks, FaFileAlt, FaEnvelope, FaColumns, FaCog } from "react-icons/fa";
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/auth";
import toast from "react-hot-toast";
import img from "../../Pages/Taskify.png";

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState("dashboard");
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auth, setAuth] = useAuth();

  const handleSetActive = (item) => {
    setActiveItem(item);
  };

  const refreshAuthToken = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API}/api/auth/refresh-token`,
        { refreshToken: auth.refreshToken }
      );

      const newToken = response.data.accessToken;
      localStorage.setItem(
        "auth",
        JSON.stringify({ ...auth, token: newToken })
      );

      setAuth({
        ...auth,
        token: newToken,
      });
    } catch (err) {
      console.error("Error refreshing token:", err);
      toast.error("Session expired. Please log in again.");
      localStorage.removeItem("auth");
      window.location.href = "/login";
    }
  };

  // Uncomment to enable project and task fetching
  /*
  useEffect(() => {
    if (!auth.token) return;

    const fetchProjectsAndTasks = async () => {
      try {
        const projectResponse = await axios.get(`${process.env.REACT_APP_API}/api/project`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setProjects(projectResponse.data);

        const taskResponse = await axios.get(`${process.env.REACT_APP_API}/api/task/${auth.user.id}`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setTasks(taskResponse.data);
      } catch (err) {
        if (err.response?.status === 401) {
          await refreshAuthToken();
          fetchProjectsAndTasks();
        } else {
          setError("Error fetching projects or tasks");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjectsAndTasks();
  }, [auth.token]);
  */

  return (
    <div className="w-full h-full min-h-screen bg-gray-800 text-white p-4 sm:p-6 flex flex-col shadow-lg">
      <div className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-violet-800">
        <img
          src={img}
          className="w-16 h-16 sm:w-20 sm:h-20 mx-auto object-contain"
          alt="Taskify Logo"
        />
      </div>

      <ul className="flex flex-col space-y-4 sm:space-y-6">
        {[
          "dashboard/user",
          "dashboard/kanban",
          "dashboard/my_tasks",
          "dashboard/team_projects",
          "dashboard/messages",
          "dashboard/settings",
        ].map((item) => {
          const icons = {
            "dashboard/user": <FaHome />,
            "dashboard/kanban": <FaColumns />,
            "dashboard/my_tasks": <FaTasks />,
            "dashboard/team_projects": <FaFileAlt />,
            "dashboard/messages": <FaEnvelope />,
            "dashboard/settings": <FaCog />,
          };

          const label = item.split("/")[1];
          let formattedLabel = label.charAt(0).toUpperCase() + label.slice(1);
          if (label === "team_projects") {
            formattedLabel = "Team Projects";
          }
          if (label === "my_tasks") {
            formattedLabel = "My Tasks";
          }

          return (
            <li key={item}>
              <NavLink
                to={`/${item}`}
                className={({ isActive }) =>
                  `flex items-center space-x-3 sm:space-x-4 p-3 rounded-md cursor-pointer transition-all duration-300 ${
                    isActive ? "bg-violet-700 text-white" : "hover:bg-violet-700 hover:text-white"
                  }`
                }
                onClick={() => handleSetActive(item)}
              >
                {icons[item]}
                <span className="text-sm sm:text-base">{formattedLabel === "User" ? "Dashboard" : formattedLabel}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>

    </div>
  );
}