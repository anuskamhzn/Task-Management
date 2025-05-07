import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/auth';

export default function Sidebar() {
    const [auth, setAuth] = useAuth();

    const handleSignOutClick = () => {
        setAuth({
            ...auth,
            user: null,
            token: "",
        });
        localStorage.removeItem("auth");
    };

    const navItems = [
        {
            to: "/dashboard/admin",
            label: "Dashboard",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
            )
        },
        {
            to: "/dashboard/users",
            label: "Users",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            )
        },
        {
            to: "/dashboard/analytics",
            label: "Analytics",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
            )
        },
        // {
        //     to: "/dashboard/admin-settings",
        //     label: "Settings",
        //     icon: (
        //         <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        //             <circle cx="12" cy="12" r="3"></circle>
        //             <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        //         </svg>
        //     )
        // },
        {
            to: "/login",
            label: "Logout",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
            ),
            onClick: handleSignOutClick
        }
    ];

    return (
        <aside className="fixed top-0 left-0 h-screen w-64 bg-gray-900 text-white p-6 space-y-6 overflow-y-auto transition-all duration-200">
            <div className="flex items-center space-x-3 text-xl font-semibold pb-4 border-b border-gray-700">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
                <span>Admin Panel</span>
            </div>

            <nav className="space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.to}
                        onClick={item.onClick}
                        className={({ isActive }) => 
                            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                            ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-indigo-800 hover:text-white'}`
                        }
                    >
                        <div className="w-5 h-5">{item.icon}</div>
                        <span className="text-sm font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}