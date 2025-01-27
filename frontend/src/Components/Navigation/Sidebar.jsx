import { FaHome, FaTasks, FaEnvelope, FaUsers, FaCog } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios'; // For making API requests
import { useAuth } from '../../context/auth'; // Assuming you have an auth context

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [projects, setProjects] = useState([]); // State for storing projects
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Access the auth context to get the user's token
  const [auth] = useAuth();

  // Function to handle active item
  const handleSetActive = (item) => {
    setActiveItem(item);
  };

  // Fetch projects for the logged-in user
  useEffect(() => {
    if (!auth.token) return; // If the user is not authenticated, don't fetch projects

    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API}/api/project`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });
        setProjects(response.data); // Set the fetched projects in state
      } catch (err) {
        setError("Error fetching projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [auth.token]); // Dependency on auth.token ensures projects are fetched when user logs in

  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-6 flex flex-col shadow-lg">
      {/* Logo */}
      <div className="text-3xl font-bold mb-8 text-center text-indigo-500">
        LOGO
      </div>

      {/* Sidebar Menu */}
      <ul className="flex flex-col space-y-6">
        {['dashboard', 'tasks', 'messages', 'members', 'settings'].map((item) => {
          const icons = {
            dashboard: <FaHome />,
            tasks: <FaTasks />,
            messages: <FaEnvelope />,
            members: <FaUsers />,
            settings: <FaCog />,
          };

          return (
            <li key={item}>
              {/* NavLink for Sidebar Menu Item */}
              <NavLink
                to={`/${item}`} // Define path for each section
                className={({ isActive }) =>
                  `flex items-center space-x-4 p-3 rounded-md cursor-pointer transition-all duration-300 
                  ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-600 hover:text-white'}`
                }
                onClick={() => handleSetActive(item)} // Optional: for setting active state in the component
              >
                {icons[item]}
                <span>{item.charAt(0).toUpperCase() + item.slice(1)}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>

      {/* My Projects Section */}
      <div className="mt-auto pt-10">
        <h3 className="font-semibold mb-4 text-gray-400">MY PROJECTS</h3>

        {/* Loading or Error States */}
        {loading && <div>Loading projects...</div>}
        {error && <div>{error}</div>}

        {/* Displaying the list of projects */}
{/* Displaying the list of projects */}
<ul className="space-y-3">
  {projects.length === 0 ? (
    <li>No projects available</li> // Show if there are no projects
  ) : (
    projects.map((project) => (
      <li key={project._id}>
        <NavLink
          to={`/project/${project._id}`} // Include project ID in the route
          className={({ isActive }) =>
            `hover:text-white cursor-pointer transition-all duration-200 p-2 rounded-md 
            ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-600 hover:text-white'}`
          }
        >
          {project.title}
        </NavLink>
      </li>
    ))
  )}
</ul>

      </div>
    </div>
  );
}
