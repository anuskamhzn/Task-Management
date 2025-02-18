import React, { useState, useEffect } from 'react';
import Navbar from "../../../Components/Navigation/Navbar";
import Sidebar from "../../../Components/Navigation/Sidebar";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../../context/auth';

const ProjectTrash = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);  // Track loading state
    const [auth] = useAuth();  // Access user and token from auth context
    const navigate = useNavigate();

    // Fetch tasks that are marked as deleted
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API}/api/project/fetchDeleted`, {
                    headers: { Authorization: `Bearer ${auth.token}` },
                });
                const data = await response.json();
                
                if (Array.isArray(data)) {  
                    setProjects(data);  // Directly set the projects array
                } else {
                    setProjects([]);  
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
                setProjects([]);  
            } finally {
                setLoading(false);
            }
        };
    
        fetchProjects();
    }, [auth.token]);
    

    // Restore task function
    const restoreTask = async (projectId) => {
        try {
            const url = `${process.env.REACT_APP_API}/api/project/restore/${projectId}`;

            const response = await fetch(url, {
                method: 'PUT',
                headers: { 
                    Authorization: `Bearer ${auth.token}` 
                },
            });

            const result = await response.json();
            
            if (response.ok) {
                // Remove the restored task from the tasks state
                setProjects(prevTasks => prevTasks.filter(project => project._id !== projectId));

                alert(result.message);
                navigate(`/dashboard/project/subproject/${projectId}`);
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error restoring project:', error);
            alert('An error occurred while restoring the project.');
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
                        ) : projects.length === 0 ? (
                            <p>No deleted tasks found.</p>  // Show this message if no tasks are available
                        ) : (
                            <ul>
                                {projects.map(project => (
                                    <li key={project._id} className="flex justify-between items-center p-2 bg-white mb-2 shadow-md">
                                        <span>{project.title}</span>
                                        <button
                                            onClick={() => {
                                                restoreTask(project._id);
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

export default ProjectTrash;
