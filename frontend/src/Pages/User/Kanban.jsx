import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/auth';
import Navbar from '../../Components/Navigation/Navbar';
import Sidebar from '../../Components/Navigation/Sidebar';
import Kanban from '../../Components/Dashboard/Kanban';

const KanbanUser = () => {
    const [tasks, setTasks] = useState([]);  // Initialize with an empty array to handle state better
    const [projects, setProjects] = useState([]);
    const [auth, setAuth] = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1">
                <Navbar />
                <h1 className="text-2xl p-6 font-bold text-gray-800">Kanban Board</h1>
                <div>
                    <Kanban
                        tasks={tasks}
                        setTasks={setTasks}
                        projects={projects}
                        setProjects={setProjects}
                    />
                </div>
            </div>
        </div>
    )
}

export default KanbanUser;
