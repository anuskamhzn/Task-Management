import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/auth';
import { FiUser } from "react-icons/fi";

export default function AdminHeader() {
    const [auth, setAuth] = useAuth();

    const handleSignOutClick = () => {
        setAuth({
            ...auth,
            user: null,
            token: "",
        });
        localStorage.removeItem("auth");
    };

    return (
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b border-gray-100 shadow-sm">
            {/* Left Section: Title and Breadcrumbs */}
            <div className="flex flex-col">
                <h1 className="text-lg font-semibold text-gray-800">Admin Dashboard</h1>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                    <NavLink to="/dashboard/admin" className="hover:text-indigo-600 transition-colors duration-200">
                        Dashboard
                    </NavLink>
                    <span className="mx-2">/</span>
                    <span className="text-gray-400">Overview</span>
                </div>
            </div>

            {/* Right Section: Search, Notifications, and Profile */}
            <div className="flex items-center space-x-4">
                {/* User Profile */}
                <div className="relative group">
                    <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                            {auth?.user?.name?.charAt(0) || 'A'}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{auth?.user?.name || 'Admin'}</span>
                    </button>
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        <NavLink
                            to="/dashboard/admin-profile"
                            className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors duration-150 ease-in-out"                        >
                            <FiUser className="text-lg" /> Profile
                        </NavLink>
                    </div>
                </div>
            </div>
        </div>
    )
}