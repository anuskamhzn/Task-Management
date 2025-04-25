import React from "react"
import AdminChart from "../../Components/Admin/Admin-Chart"

export default function AdminOverview() {
  const stats = [
    { value: "12,845", label: "Total Users" },
    { value: "9,851", label: "Total Projects" },
    { value: "1.25M", label: "Total Revenue" },
    { value: "98.2%", label: "System Uptime", color: "text-green-500" }
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm mb-8 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800">Admin Overview</h2>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 border-b border-gray-100">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className={`text-2xl font-bold ${stat.color || "text-gray-700"}`}>{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="p-6">
        <AdminChart />
      </div>
    </div>
  )
}