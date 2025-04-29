import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../Components/Navigation/AdminSidebar";
import AdminHeader from "../../Components/Navigation/AdminHeader";
import { useAuth } from "../../context/auth";

const Analytics = () => {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="min-h-screen bg-gray-50 flex transition-colors duration-200">
            <Sidebar />
            <main className="flex-1 lg:ml-64 p-6">
                <AdminHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-800">Analytics</h2>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Analytics
