import React from "react";
import AdminChart from "../../Components/Admin/Admin-Chart";

export default function AdminOverview({ analytics }) {
  const stats = [
    { value: analytics?.projects?.totalProjects || "0", label: "Total Projects" },
    { value: analytics?.tasks?.totalTasks || "0", label: "Total Tasks" },
    {
      value: analytics?.tasks?.completionRate || "0%",
      label: "Task Completion",
      color: "text-green-500",
    },
    {
      value: analytics?.projects?.completionRate || "0%",
      label: "Project Completion",
      color: "text-green-500",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">Admin Overview</h2>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className={`text-lg font-semibold ${stat.color || "text-gray-700"}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="p-4">
        <div className="h-64">
          <AdminChart />
        </div>
      </div>
    </div>
  );
}
