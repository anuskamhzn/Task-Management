import { useState } from "react"
import Sidebar from "../../Components/Navigation/AdminSidebar"
import AdminHeader from "../../Components/Navigation/AdminHeader"
import Metrics from "../../Components/Admin/Metrics"
import AdminOverview from "../../Components/Admin/AdminOverview"

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data for recent users
  const recentUsers = [
    { id: 1, name: "John Doe", email: "john@example.com", joinedDate: "2023-04-15" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", joinedDate: "2023-04-18" },
    { id: 3, name: "Robert Johnson", email: "robert@example.com", joinedDate: "2023-04-20" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-6">
        {/* Header */}
        <AdminHeader />

        {/* Metrics */}
        <Metrics />

        {/* Admin Overview */}
        <AdminOverview />

        {/* Recent Users Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">Recent Users</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors duration-200">
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Name", "Email", "Joined Date", "Actions"].map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                          {user.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.joinedDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-800 mr-3 transition-colors duration-150">Edit</button>
                      <button className="text-red-600 hover:text-red-800 transition-colors duration-150">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}