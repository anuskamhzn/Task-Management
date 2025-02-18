import React from 'react'
import Navbar from "../../Components/Navigation/Navbar";
import Sidebar from "../../Components/Navigation/Sidebar";
import { NavLink } from "react-router-dom";

const Test = () => {
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
                    <h1>message</h1>
                </div>
            </div>
        </div>
    )
}

export default Test
