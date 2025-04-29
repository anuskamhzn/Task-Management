import React from "react";

export default function Metrics({ analytics }) {
  const metrics = [
    {
      title: "TOTAL USERS",
      value: analytics?.users?.totalUsers || "0",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      color: "blue",
    },
    {
      title: "TOTAL PROJECTS",
      value: analytics?.projects?.totalProjects || "0",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
      ),
      color: "purple",
    },
    {
      title: "TOTAL TASKS",
      value: analytics?.tasks?.totalTasks || "0",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      ),
      color: "green",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="bg-white p-8 rounded-lg shadow-sm flex items-center"
        >
          <div className={`bg-${metric.color}-100 p-2 rounded-full mr-3`}>
            <div className={`w-5 h-5 text-${metric.color}-600`}>{metric.icon}</div>
          </div>
          <div>
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{metric.title}</h2>
            <div className="text-xl font-semibold text-gray-800">{metric.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}