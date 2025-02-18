import React, { useState, useEffect } from 'react';
import Navbar from "../../../Components/Navigation/Navbar";
import Sidebar from "../../../Components/Navigation/Sidebar";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useAuth } from '../../../context/auth';

const SubtaskTrash = () => {
    const [tasks, setTasks] = useState([]);
    const { mainTaskId } = useParams();  // Get taskId from URL params
    const [auth] = useAuth();  // Access user and token from auth context
    const navigate = useNavigate();

    // Fetch tasks that are marked as deleted
    useEffect(() => {
        const fetchTasks = async () => {
          try {
            const response = await fetch(`${process.env.REACT_APP_API}/api/task/subtask-trash/${mainTaskId}`, {
              headers: { Authorization: `Bearer ${auth.token}` },
            });
            const data = await response.json();
      
            if (Array.isArray(data)) {
              setTasks(data);  // Directly assign to tasks since 'data' is an array
            } else {
              setTasks([]);  // If the data isn't in array form, set tasks to an empty array
            }
          } catch (error) {
            console.error('Error fetching tasks:', error);
            setTasks([]); // Set an empty array in case of an error
          }
        };
      
        fetchTasks();
      }, [mainTaskId, auth.token]);
      
      
    // Restore task function
    const restoreTask = async (subTaskId) => {
        try {
            const url = `${process.env.REACT_APP_API}/api/task/restore-subtask/${mainTaskId}/${subTaskId}`;
    
            const response = await fetch(url, {
                method: 'PUT',  // Ensure method is PUT
                headers: { 
                    Authorization: `Bearer ${auth.token}` 
                },
            });
    
            const result = await response.json();
            
            if (response.ok) {
                // Update tasks list to reflect the restored task
                setTasks(prevTasks => prevTasks.filter(task => task._id !== subTaskId));
                alert(result.message);
                navigate(`/dashboard/task/subtask/${mainTaskId}`);  // Navigate to the subtask detail page

            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error restoring task:', error);
            alert('An error occurred while restoring the task.');
        }
    };
    

    return (
        <div>
            <div className="flex bg-gray-50">
                {/* Sidebar - Fixed and Full Height */}
                <aside className="h-screen sticky top-0 w-64 bg-gray-800 text-white">
                    <Sidebar />
                </aside>
    
                {/* Main Content - Scrollable */}
                <div className="flex-1 flex flex-col">
                    <Navbar />
    
                    <div className="container mx-auto p-4">
                        <h1 className="text-xl font-semibold mb-4">Trash</h1>
    
                        {tasks.length > 0 ? (
                            <ul>
                                {tasks.map(task => (
                                    <li key={task._id} className="flex justify-between items-center p-2 bg-white mb-2 shadow-md">
                                        <span>{task.title}</span>
                                        <button
                                            onClick={() => {
                                                console.log("Clicked subtask with id:", task._id); // Check which subtask is being clicked
                                                restoreTask(task._id);
                                            }}
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            Restore
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No deleted tasks found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubtaskTrash;
