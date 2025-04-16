import { FaHome, FaTasks, FaFileAlt, FaEnvelope, FaUsers, FaColumns , FaCog } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/auth';
import toast from 'react-hot-toast';
import img from '../../Pages/Taskify.png';

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [projects, setProjects] = useState([]); // State for storing projects
  const [tasks, setTasks] = useState([]); // State for storing tasks
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Access the auth context to get the user's token
  const [auth, setAuth] = useAuth();

  // Function to handle active item
  const handleSetActive = (item) => {
    setActiveItem(item);
  };

  // Function to refresh the auth token
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

      // Update the auth context with the new access token
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

  // Fetch projects and tasks for the logged-in user
  // useEffect(() => {
  //   if (!auth.token) return; // If the user is not authenticated, don't fetch projects or tasks

  //   const fetchProjectsAndTasks = async () => {
  //     try {
  //       const projectResponse = await axios.get(`${process.env.REACT_APP_API}/api/project`, {
  //         headers: { Authorization: `Bearer ${auth.token}` },
  //       });
  //       setProjects(projectResponse.data); // Set the fetched projects in state

  //       const taskResponse = await axios.get(`${process.env.REACT_APP_API}/api/task/${auth.user.id}`, {
  //         headers: { Authorization: `Bearer ${auth.token}` },
  //       });
  //       setTasks(taskResponse.data); // Set the fetched tasks in state
  //     } catch (err) {
  //       if (err.response?.status === 401) {
  //         // If the error is due to an expired token, attempt to refresh the token
  //         await refreshAuthToken();
  //         fetchProjectsAndTasks(); // Retry fetching after refreshing the token
  //       } else {
  //         setError("Error fetching projects or tasks");
  //       }
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchProjectsAndTasks();
  // }, [auth.token]);

  return (
    <div className="w-64 bg-gray-800 text-white h-full min-h-screen p-6 flex flex-col shadow-lg">
      {/* Logo */}
      <div className="text-3xl font-bold mb-8 text-center text-violet-800">
        <img
          src={img}
          className="w-20 h-20 mx-auto object-contain"
          alt="Taskify Logo"
        />
      </div>

      {/* Sidebar Menu */}
      <ul className="flex flex-col space-y-6">
        {/* {['dashboard/user', 'dashboard/my_tasks', 'dashboard/team_projects', 'dashboard/messages', 'dashboard/members', 'dashboard/settings'].map((item) => { */}
        {['dashboard/user',  'dashboard/kanban', 'dashboard/my_tasks', 'dashboard/team_projects', 'dashboard/messages', 'dashboard/settings'].map((item) => {
          const icons = {
            'dashboard/user': <FaHome />,
            'dashboard/kanban': <FaColumns  />,
            'dashboard/my_tasks': <FaTasks />,
            'dashboard/team_projects': <FaFileAlt />,
            'dashboard/messages': <FaEnvelope />,
            // 'dashboard/members': <FaUsers />,
            'dashboard/settings': <FaCog />,
          };

          // Extracting the last part of the path for the label
          const label = item.split('/')[1];
          let formattedLabel = label.charAt(0).toUpperCase() + label.slice(1);

          // Override for 'team_projects' to show 'Team Projects'
          if (label === 'team_projects') {
            formattedLabel = 'Team Projects';
          }
          // Override for 'team_projects' to show 'Team Projects'
          if (label === 'my_tasks') {
            formattedLabel = 'My Tasks';
          }

          return (
            <li key={item}>
              <NavLink
                to={`/${item}`}
                className={({ isActive }) =>
                  `flex items-center space-x-4 p-3 rounded-md cursor-pointer transition-all duration-300 
            ${isActive ? 'bg-violet-700 text-white' : 'hover:bg-violet-700 hover:text-white'}`
                }
              >
                {icons[item]}
                <span>{formattedLabel === 'User' ? 'Dashboard' : formattedLabel}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>


      {/* My Items Section (Combining Projects and Tasks) */}
      {/* <div className="mt-auto pt-10">
        <h3 className="font-semibold mb-4 text-gray-400">MY Project/Task</h3>

        {loading && <div>Loading projects and tasks...</div>}
        {error && <div>{error}</div>}

        <ul className="space-y-3">
          {projects.length === 0 && tasks.length === 0 ? (
            <li>No projects or tasks available</li>
          ) : (
            <>
              {projects.map((project) => (
                <li key={project._id} className="flex items-center space-x-3">
                  <span className="text-indigo-500">Project:</span>
                  <NavLink
                    to={`/project/subproject/${project._id}`} // Navigate to project detail page
                    className={({ isActive }) =>
                      `hover:text-white cursor-pointer transition-all duration-200 p-2 rounded-md 
                      ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-600 hover:text-white'}`  
                    }
                  >
                    {project.title}
                  </NavLink>
                </li>
              ))}

              {tasks.map((task) => (
                <li key={task._id} className="flex items-center space-x-3">
                  <span className="text-green-500">Task:</span>
                  <NavLink
                    to={`/task/subtask/${task._id}`} // Navigate to task detail page
                    className={({ isActive }) =>
                      `hover:text-white cursor-pointer transition-all duration-200 p-2 rounded-md 
                      ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-600 hover:text-white'}`  
                    }
                  >
                    {task.title}
                  </NavLink>
                </li>
              ))}
            </>
          )}
        </ul>
      </div> */}
    </div>
  );
}