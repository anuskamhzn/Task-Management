import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/auth';
import Navbar from '../../Components/Navigation/Navbar';
import Sidebar from '../../Components/Navigation/Sidebar';

const Notifications = () => {
    const [auth, setAuth] = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1">
                <Navbar />
                <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
                    <h1 className="text-2xl font-semibold text-gray-800 mb-4">Notifications</h1>
                </div>
            </div>
        </div>
    )
}

export default Notifications