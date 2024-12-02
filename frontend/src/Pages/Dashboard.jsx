import React, { useState } from "react";
import Navbar from "../Components/Navbar";

const Dashboard = () => {
  const [tasks, setTasks] = useState([
    { _id: "1", title: "Task 1", description: "Description 1", status: "todo", dueDate: "2024-12-10" },
    { _id: "2", title: "Task 2", description: "Description 2", status: "in-progress", dueDate: "2024-12-11" },
    { _id: "3", title: "Task 3", description: "Description 3", status: "done", dueDate: "2024-12-09" },
  ]);

  const taskStatusCounts = tasks.reduce(
    (acc, task) => {
      acc[task.status]++;
      return acc;
    },
    { todo: 0, "in-progress": 0, done: 0 }
  );

  const taskGroups = {
    todo: tasks.filter((task) => task.status === "todo"),
    "in-progress": tasks.filter((task) => task.status === "in-progress"),
    done: tasks.filter((task) => task.status === "done"),
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar/>

      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-semibold mb-6">Task Dashboard</h1>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-2">Task Analytics</h2>
            <ul>
              <li>Todo: {taskStatusCounts.todo}</li>
              <li>In Progress: {taskStatusCounts["in-progress"]}</li>
              <li>Done: {taskStatusCounts.done}</li>
            </ul>
          </div>

          {/* Calendar Section */}
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-2">Calendar</h2>
            {/* Placeholder for calendar (can use a calendar component or UI) */}
            <div className="h-40 bg-gray-200 flex justify-center items-center">
              <p>Calendar View (Tasks by Date)</p>
            </div>
          </div>
        </div>

        {/* Kanban Board Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.keys(taskGroups).map((status) => (
            <div key={status} className="bg-white p-4 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">{status.charAt(0).toUpperCase() + status.slice(1)}</h2>
              <div className="space-y-4">
                {taskGroups[status].map((task) => (
                  <div key={task._id} className="bg-gray-100 p-4 rounded-lg shadow-sm">
                    <h3 className="font-semibold">{task.title}</h3>
                    <p>{task.description}</p>
                    <p className="text-sm text-gray-500">Due Date: {new Date(task.dueDate).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
