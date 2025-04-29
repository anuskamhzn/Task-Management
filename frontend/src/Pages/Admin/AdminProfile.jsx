import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../Components/Navigation/AdminSidebar";
import AdminHeader from "../../Components/Navigation/AdminHeader";
import { useAuth } from "../../context/auth";
import { motion } from 'framer-motion';

const AProfile = () => {
    const [auth, setAuth] = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (!auth.token) {
                return;
            }

            try {
                const response = await axios.get(`${process.env.REACT_APP_API}/api/auth/user-info`, {
                    headers: {
                        Authorization: `Bearer ${auth.token}`,
                    },
                });

                setUser(response.data);
            } catch (err) {
                if (err.response?.status === 401) {
                    fetchUserInfo();
                } else {
                    setError(err.response?.data?.message || 'Error fetching user data');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, [auth.token]);

    if (!auth.token) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex transition-colors duration-200">
            <Sidebar />
            <main className="flex-1 lg:ml-64 p-6">
                <AdminHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-800">Admin Profile</h2>
                    </div>
                    <motion.div
                        className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-violet-700 to-purple-800 p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                <div
                                    whileHover={{ scale: 1.05 }}
                                    className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden"
                                >
                                    {user?.avatar ? (
                                        <img src={user.photo} alt="User Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-bold text-gray-600">
                                            {user?.initials}
                                        </span>
                                    )}
                                </div>
                                <div className="text-center sm:text-left">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-white">{user?.name || 'User Profile'}</h1>
                                    {/* <p className="text-blue-100 mt-1">Manage your account details</p> */}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 sm:p-8 bg-white/80 backdrop-blur-sm">
                            <div className="space-y-4">
                                {[
                                    { label: 'Name', value: user?.name },
                                    { label: 'Email', value: user?.email },
                                    { label: 'Phone', value: user?.phone },
                                ].map((item, index) => (
                                    <div
                                        key={index}
                                        whileHover={{ x: 5 }}
                                        className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <strong className="w-28 sm:w-32 font-semibold text-gray-700">{item.label}:</strong>
                                        <span className="text-gray-900">{item.value || 'N/A'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    )
}

export default AProfile
