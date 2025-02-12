import { useState } from "react"
import { FaSearch, FaBell, FaEnvelope } from "react-icons/fa"

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-navy text-white p-6 space-y-6">
        <div className="flex items-center space-x-2 text-xl font-bold pb-4 border-b border-white/20">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-navy">SB</div>
          <span>ADMIN</span>
        </div>

        <nav className="space-y-4">
          <div className="px-4 py-2 bg-blue-900 rounded-lg mb-4">
            <span className="text-sm">Dashboard</span>
          </div>
          <div className="border-b border-white/20 -mx-2 mb-4"></div>

          <div className="space-y-2">
            <div className="px-4 py-2 hover:bg-blue-900 rounded-lg cursor-pointer">
              <span className="text-sm">Doctors</span>
            </div>
            <div className="px-4 py-2 hover:bg-blue-900 rounded-lg cursor-pointer">
              <span className="text-sm">Patients</span>
            </div>
            <div className="px-4 py-2 hover:bg-blue-900 rounded-lg cursor-pointer">
              <span className="text-sm">Setting</span>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Header */}
        <header className="bg-gray-100 shadow-sm">
          <div className="flex justify-between items-center max-w-7xl mx-auto p-2">
            <div className="relative flex">
              <input
                type="text"
                placeholder="Search for..."
                className="w-80 pl-4 pr-10 py-1.5 rounded-l-lg focus:outline-none bg-gray-100 border-2 border-gray-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg">
                <FaSearch className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-6">
              <div className="relative">
                {/* <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  3
                </span> */}
                <button className="text-gray-600 hover:text-gray-800">
                  <FaBell className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-gray-700">Sambirdi Bam</span>
                <img
                  src={`https://i.pinimg.com/1200x/60/31/25/6031253da1d85e65d4e3d1ba0cff44b4.jpg`}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
              </div>
            </div>
          </div>
        </header>
      </main>
    </div>
  )
}

