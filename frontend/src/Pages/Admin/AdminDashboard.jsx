import { useState } from "react";
import { FaSearch, FaBell, FaUsers, FaUser, FaTasks, FaProjectDiagram , FaCog, FaChartLine, FaChevronDown, FaSignOutAlt } from "react-icons/fa";
import { NavLink, useNavigate } from 'react-router-dom';

export default function AdminDashboard() {

  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsCount, setNotificationsCount] = useState();
  const [doctorCount, setDoctorCount] = useState(40);
  const [patientCount, setPatientCount] = useState(25);
  const [pendingRequests, setPendingRequests] = useState(18);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const recentUsers = [
    { name: 'Jane Doe', email: 'jane@gmail.com', location: "6096 Marjolaine Landing", phone: "9876543210", profileImg: "https://image.shutterstock.com/image-vector/profile-icon-female-avatar-woman-250nw-308471408.jpg" },
    { name: 'Mark Spencer', email: 'mark@gmail.com', location: "1234 Maple Drive", phone: "2345678901", profileImg: "https://www.svgrepo.com/show/384670/account-avatar-profile-user.svg" },
    { name: 'Emily White', email: 'emily@gmail.com', location: "5678 Pine Road", phone: "3456789012", profileImg: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaI9ppOwoOwwdGwZoIDIYpGDZ9GB5FInYoe_c-Y1k0QPuRW_njDHVAbDmEHPH1geOgkjw&usqp=CAU" },
  ];

  // Handle sign out logic
  const handleSignOutClick = () => {
    // Clear localStorage and update the auth state
    localStorage.removeItem('auth');
    setIsLoggedIn(false);
    navigate('/'); // Redirect to homepage or any page you'd like
  };


  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-navy text-white p-6 space-y-6 bg-gray-700">
        <div className="flex items-center space-x-2 text-xl font-bold pb-4 border-b border-white/20">
          <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center text-navy">A</div>
          <span>ADMIN</span>
        </div>

        <nav className="space-y-4">
          <div className="px-4 py-2 bg-blue-800 rounded-lg mb-4">
            <span className="text-sm">Dashboard</span>
          </div>
          <div className="border-b border-white/20 -mx-2 mb-4"></div>

          <div className="space-y-6">
            <NavLink to="/doctors">
              <div className="px-4 py-4 hover:bg-blue-800 rounded-lg cursor-pointer flex items-center space-x-3">
                <FaUsers className="w-5 h-5 text-white" />
                <span className="text-sm text-white">Users</span>
              </div>
            </NavLink>
            <NavLink to="/patients">
              <div className="px-4 py-4 hover:bg-blue-800 rounded-lg cursor-pointer flex items-center space-x-3">
                <FaChartLine className="w-5 h-5 text-white" />
                <span className="text-sm text-white">Analytics</span>
              </div>
            </NavLink>
            <NavLink to="/settings">
              <div className="px-4 py-4 hover:bg-blue-800 rounded-lg cursor-pointer flex items-center space-x-3">
                <FaCog className="w-5 h-5 text-white" />
                <span className="text-sm text-white">Settings</span>
              </div>
            </NavLink>
            <NavLink onClick={handleSignOutClick} to="/login">
              <div className="px-4 py-4 hover:bg-blue-800 rounded-lg cursor-pointer flex items-center space-x-3">
                <FaSignOutAlt className="w-5 h-5 text-white" />
                <span className="text-sm text-white">Logout</span>
              </div>
            </NavLink>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex justify-between items-center max-w-7xl mx-4 p-2">
            <div className="relative flex">
              {/* Search */}
              <div className="flex items-center gap-4">
                <div className="relative hidden lg:block">
                  <FaSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Search..."
                    className="w-[300px] pl-10 pr-4 py-2 rounded-3xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-navy"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg">
                <img src="https://static.vecteezy.com/system/resources/thumbnails/008/442/086/small/illustration-of-human-icon-user-symbol-icon-modern-design-on-blank-background-free-vector.jpg" alt="Avatar" className="h-6 w-6 rounded-full" />
                <span className="text-gray-700">Admin</span>
                {/* <FaChevronDown className="h-4 w-4 text-gray-600" /> */}
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 max-w-7xl mx-auto">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Total Users Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-violet-500 flex justify-between items-center relative group hover:bg-violet-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div>
                <p className="text-sm font-semibold text-violet-600 uppercase mb-1 group-hover:text-white">Total Users</p>
                <p className="text-2xl font-bold text-gray-800 group-hover:text-white">20</p>
              </div>
              <div className="bg-purple-200 p-2 rounded-full">
                <FaUsers className="h-6 w-6 text-violet-600 group-hover:text-white" />
              </div>
            </div>

            {/* Total Tasks Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500 flex justify-between items-center relative group hover:bg-blue-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div>
                <p className="text-sm font-semibold text-blue-600 uppercase mb-1 group-hover:text-white">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-800 group-hover:text-white">3</p>
              </div>
              <div className="bg-blue-200 p-2 rounded-full">
                <FaTasks className="h-6 w-6 text-blue-600 group-hover:text-white" /> {/* Updated icon */}
              </div>
            </div>

            {/* Total Projects Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500 flex justify-between items-center relative group hover:bg-green-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div>
                <p className="text-sm font-semibold text-green-600 uppercase mb-1 group-hover:text-white">Total Projects</p>
                <p className="text-2xl font-bold text-gray-800 group-hover:text-white">20</p>
              </div>
              <div className="bg-green-200 p-2 rounded-full">
                <FaProjectDiagram className="h-6 w-6 text-green-600 group-hover:text-white" /> {/* Updated icon */}
              </div>
            </div>

            {/* Pending Doctor Requests Card */}
            {/* <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500 flex justify-between items-center relative group hover:bg-yellow-500 hover:text-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div>
                <p className="text-sm font-semibold text-yellow-600 uppercase mb-1 group-hover:text-white">Pending Doctor Requests</p>
                <p className="text-2xl font-bold text-gray-800 group-hover:text-white">18</p>
              </div>
              <div className="bg-yellow-200 p-2 rounded-full">
                <FaClock className="h-6 w-6 text-yellow-600 group-hover:text-white" />
              </div>
            </div> */}

          </div>


          {/* Chart */}
          <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
            </div>
            <div className="mt-4 h-[400px]">
              <div className="flex h-full items-center justify-center text-gray-500">
                {/* Inner box for Chart placeholder */}
                <div className="bg-gray-100 p-4 border border-gray-300 rounded-lg w-full h-full flex items-center justify-center">
                  Chart placeholder
                </div>
              </div>
            </div>
          </div>

          {/* Recent Users Card-Style Table */}
          <div className="bg-white rounded-lg shadow-sm p-3 mt-5">

            {/* Deals Table */}
            <div className="mt-2 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between p-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Users
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-y">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Location</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(recentUsers).map((user) => (
                      <tr key={user.name} className="border-b">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.profileImg} // Use the unique image URL for each user
                              alt={user.name}
                              className="h-8 w-8 rounded-full"
                            />
                            <span className="font-medium text-gray-900">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                        <td className="px-6 py-4 text-gray-600">{user.location}</td>
                        <td className="px-6 py-4 text-gray-600">{user.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
