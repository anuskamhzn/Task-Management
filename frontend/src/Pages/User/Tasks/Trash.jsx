import React, { useState, useEffect } from 'react';
import Navbar from "../../../Components/Navigation/Navbar";
import Sidebar from "../../../Components/Navigation/Sidebar";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../../context/auth';

const TaskTrash = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);  // Track loading state
    const [auth] = useAuth();  // Access user and token from auth context
    const navigate = useNavigate();

    // Fetch tasks that are marked as deleted
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API}/api/task/getDeletedTask`, {
                    headers: { Authorization: `Bearer ${auth.token}` },
                });
                const data = await response.json();
                
                if (Array.isArray(data.deletedTasks)) {
                    setTasks(data.deletedTasks);  // Set tasks with the deletedTasks array
                } else {
                    setTasks([]);  // Set to empty array if deletedTasks isn't an array
                }
            } catch (error) {
                console.error('Error fetching tasks:', error);
                setTasks([]);  // Set an empty array in case of an error
            } finally {
                setLoading(false);  // Set loading to false after data is fetched
            }
        };

        fetchTasks();
    }, [auth.token]);

    // Restore task function
    const restoreTask = async (taskId) => {
        try {
            const url = `${process.env.REACT_APP_API}/api/task/restore/${taskId}`;

            const response = await fetch(url, {
                method: 'PUT',
                headers: { 
                    Authorization: `Bearer ${auth.token}` 
                },
            });

            const result = await response.json();
            
            if (response.ok) {
                // Remove the restored task from the tasks state
                setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));

                alert(result.message);
                navigate(`/dashboard/task/subtask/${taskId}`);
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

                        {/* If loading is true, show "Loading..." else show tasks */}
                        {loading ? (
                            <p>Loading...</p>
                        ) : tasks.length === 0 ? (
                            <p>No deleted tasks found.</p>  // Show this message if no tasks are available
                        ) : (
                            <ul>
                                {tasks.map(task => (
                                    <li key={task._id} className="flex justify-between items-center p-2 bg-white mb-2 shadow-md">
                                        <span>{task.title}</span>
                                        <button
                                            onClick={() => {
                                                restoreTask(task._id);
                                            }}
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            Restore
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskTrash;
