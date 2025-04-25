import React from 'react';

const EmailSetting = () => {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-violet-200/50">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 to-violet-800 px-6 py-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPjxwYXR0ZXJuIGlkPSJhIiB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48Y2lyY2xlIGN4PSIuNSIgY3k9Ii41IiByPSIuNSIgZmlsbD0iI2ZmZiIvPjwvcGF0dGVybj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')]"></div>
          <h4 className="text-2xl font-bold text-white relative z-10">Email Settings</h4>
          <p className="text-violet-100 mt-2 text-sm relative z-10">Manage your email preferences</p>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-10">
          {/* Email Section */}
          {/* <div className="pb-8 border-b border-violet-100/50">
            <h5 className="text-xl font-semibold text-gray-800 mb-5 tracking-tight">Update Email</h5>
            <form className="space-y-6">
              <div className="space-y-2">
                <label 
                  htmlFor="newEmailAddress" 
                  className="block text-sm font-medium text-gray-700 tracking-wide"
                >
                  New Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  id="newEmailAddress"
                  required
                  className="w-full p-3.5 border border-violet-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all duration-200"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full md:w-auto px-8 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 focus:ring-4 focus:ring-violet-300/50 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div> */}

          {/* Password Section */}
          <div>
            <h5 className="text-xl font-semibold text-gray-800 mb-5 tracking-tight">Change Password</h5>
            <form className="space-y-6">
              <div className="space-y-2">
                <label 
                  htmlFor="currentPassword" 
                  className="block text-sm font-medium text-gray-700 tracking-wide"
                >
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  id="currentPassword"
                  required
                  className="w-full p-3.5 border border-violet-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label 
                  htmlFor="newPassword" 
                  className="block text-sm font-medium text-gray-700 tracking-wide"
                >
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  id="newPassword"
                  required
                  className="w-full p-3.5 border border-violet-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label 
                  htmlFor="confirmNewpassword" 
                  className="block text-sm font-medium text-gray-700 tracking-wide"
                >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  id="confirmNewpassword"
                  required
                  className="w-full p-3.5 border border-violet-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all duration-200"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h6 className="text-sm font-semibold text-gray-800">Password Requirements:</h6>
                  <p className="text-sm text-gray-600">Ensure that these requirements are met:</p>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    <li>Minimum 8 characters long - the more, the better</li>
                    <li>At least one lowercase character</li>
                    <li>At least one uppercase character</li>
                    <li>At least one number, symbol, or whitespace character</li>
                  </ul>
                </div>
                <button
                  type="submit"
                  className="w-full md:w-auto px-8 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 focus:ring-4 focus:ring-violet-300/50 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailSetting