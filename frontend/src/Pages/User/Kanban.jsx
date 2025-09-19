import React, { useState } from 'react';
import Navbar from '../../Components/Navigation/Navbar';
import Sidebar from '../../Components/Navigation/Sidebar';
import Kanban from '../../Components/Dashboard/Kanban';

const KanbanUser = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out md:sticky md:top-0 md:transform-none ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <Sidebar />
      </aside>
      <div className="flex-1 flex flex-col">
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Kanban Board</h1>
          <Kanban
            tasks={tasks}
            setTasks={setTasks}
            projects={projects}
            setProjects={setProjects}
          />
        </main>
      </div>
    </div>
  );
};

export default KanbanUser;