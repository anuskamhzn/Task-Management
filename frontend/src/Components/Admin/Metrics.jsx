import React from "react"

export default function Metrics() {
  const metrics = [
    {
      title: "TOTAL USERS",
      value: "12,845",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      color: "blue"
    },
    {
      title: "TOTAL PROJECTS",
      value: "9,851",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
      ),
      color: "purple"
    },
    {
      title: "TOTAL REVENUE",
      value: "$1.25M",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      ),
      color: "green"
    },
    {
      title: "ACTIVE SESSIONS",
      value: "1,482",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
        </svg>
      ),
      color: "yellow"
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
        >
          <div className="flex items-center">
            <div className={`bg-${metric.color}-100 p-3 rounded-lg mr-4`}>
              <div className={`w-6 h-6 text-${metric.color}-500`}>{metric.icon}</div>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{metric.title}</h2>
              <div className="text-2xl font-bold text-gray-800 mt-1">{metric.value}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}