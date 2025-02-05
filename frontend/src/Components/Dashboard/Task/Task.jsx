import React, { useEffect, useState } from "react";
import axios from "axios";
import { NavLink, useParams } from "react-router-dom";
import { useAuth } from "../../../context/auth";
import Navbar from "../../Navigation/Navbar";
import Sidebar from "../../Navigation/Sidebar";
import TaskKanban from './TaskKanban';

const Task = () => {
  const [auth] = useAuth();  // Access user and token from auth context
  const { taskId } = useParams();  // Get taskId from URL params
   const [mainTask, setMainTask] = useState(null);
  const [tasks, setTasks] = useState(null);  // Initially set tasks to null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (taskId && auth.token) {
      const fetchMainTask = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API}/api/task/${auth.user.id}`,
            {
              headers: { Authorization: `Bearer ${auth.token}` },
            }
          );
  
          // Check if the response is an array and set the first item in the array
          if (response.data && response.data.length > 0) {
            setMainTask(response.data[0]); // Set the first project in the array
          } else {
            setError("No projects found.");
          }
        } catch (err) {
          console.error("Error fetching main project:", err);
          setError("Error fetching main project.");
        }
      };
  
      fetchMainTask();
    }
  }, [taskId, auth.token]);

  useEffect(() => {
    setTasks(null);  // Clear previous task data
    setError(null);  // Clear error message
    setLoading(true); // Ensure loading state resets
    if (auth && auth.user) {
      fetchTask();
    }
  }, [auth, taskId]);

  const fetchTask = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API}/api/task/subtask/${taskId}`,  // Use taskId
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,  // Pass the token from auth context
          },
        }
      );

      // If there are subtasks, set them
      if (response.data && response.data.length > 0) {
        setTasks(response.data);
      } else {
        setError("No subtasks found for this task.");
      }
    } catch (err) {
      console.error("Error fetching task:", err);

      // Specific check for 404 error from backend
      if (err.response && err.response.status === 404) {
        setError(err.response.data.message || "No subtasks found for this task.");
      } else {
        setError("Failed to fetch task. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!auth || !auth.user) {
    return <p>Please log in to view your tasks.</p>;
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6">
          {error && <div className="text-black mb-4">{error}</div>}  {/* Display error message */}

          {/* Always display the "Create Sub Task" button */}
          <NavLink to={`/create-task/${taskId}`}>
            <button className="bg-indigo-900 text-white py-2 px-4 mb-2 rounded-lg shadow-md hover:bg-indigo-800 hover:shadow-lg transition duration-300 ease-in-out">
              Create Sub Task
            </button>
          </NavLink>

          {/* Render the title and Kanban board only if tasks exist */}
          {tasks && tasks.length > 0 ? (
            <>
              <h1>Task Name: {mainTask?.title}</h1> 
              <TaskKanban
                toDoTasks={tasks.filter((task) => task.status === "To Do")}
                inProgressTasks={tasks.filter((task) => task.status === "In Progress")}
                completedTasks={tasks.filter((task) => task.status === "Completed")}
                tasks={tasks}
                setTasks={setTasks}
                auth={auth}
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Task;
