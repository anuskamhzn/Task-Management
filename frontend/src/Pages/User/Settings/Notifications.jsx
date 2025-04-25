import React, { useState } from 'react';

const Notifications = () => {
  const notificationOptions = [
    { value: 'Always', label: 'Always' },
    { value: 'One', label: 'One' },
    { value: 'Two', label: 'Two' },
    { value: 'Three', label: 'Three' }
  ];

  const dailyDigestOptions = [
    { value: 'Everyday', label: 'Everyday' },
    { value: 'One', label: 'One' },
    { value: 'Two', label: 'Two' },
    { value: 'Three', label: 'Three' }
  ];

  const timeOptions = [
    { value: '2PM', label: '2PM' },
    { value: 'One', label: 'One' },
    { value: 'Two', label: 'Two' },
    { value: 'Three', label: 'Three' }
  ];

  const [showAlert, setShowAlert] = useState(true);

  return (
    <div className="max-w-5xl mx-auto p-6">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-violet-200/50">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-700 to-violet-800 px-6 py-8 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPjxwYXR0ZXJuIGlkPSJhIiB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48Y2lyY2xlIGN4PSIuNSIgY3k9Ii41IiByPSIuNSIgZmlsbD0iI2ZmZiIvPjwvcGF0dGVybj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')]"></div>
              <h4 className="text-2xl font-bold text-white relative z-10">Notification Settings</h4>
              <p className="text-violet-100 mt-2 text-sm relative z-10">Manage how you receive updates</p>
            </div>
            {/* Content */}
            <div className="p-6 md:p-8 space-y-8">
              {/* Alert */}
              {/* {showAlert && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl flex items-center justify-between transition-all duration-300">
                  <p className="text-yellow-700 text-sm">
                    To start using Slack for personal notifications, please connect Slack first.
                  </p>
                  <button 
                    onClick={() => setShowAlert(false)}
                    className="text-yellow-700 hover:text-yellow-900 text-lg font-bold transition-colors"
                  >
                    ×
                  </button>
                </div>
              )} */}

              {/* Tables */}
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-violet-50">
                      <tr>
                        <th className="py-4 px-6 text-left font-semibold text-gray-800 w-3/5">Activity & Conversation</th>
                        <th className="py-4 px-6 text-center"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg></th>
                        <th className="py-4 px-6 text-center"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"></path><path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"></path><path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z"></path><path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"></path><path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z"></path><path d="M15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"></path><path d="M10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z"></path><path d="M8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z"></path></svg></th>
                        <th className="py-4 px-6 text-center"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-6"></td>
                        <td className="py-3 px-6 text-center"><input type="checkbox" name="customCheckOne" className="h-4 w-4 text-violet-600 rounded" /></td>
                        <td className="py-3 px-6 text-center"><input type="checkbox" name="customCheckTwo" className="h-4 w-4 text-violet-600 rounded" /></td>
                        <td className="py-3 px-6 text-center"><input type="checkbox" name="customCheckThree" className="h-4 w-4 text-violet-600 rounded" /></td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-6">When a file is shared with a team</td>
                        <td className="py-3 px-6 text-center"><input type="checkbox" name="customCheckFour" className="h-4 w-4 text-violet-600 rounded" /></td>
                        <td className="py-3 px-6 text-center"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><line x1="5" y1="12" x2="19" y2="12"></line></svg></td>
                        <td className="py-3 px-6 text-center"><input type="checkbox" name="customCheckFive" className="h-4 w-4 text-violet-600 rounded" /></td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-6">When someone requests access to my design</td>
                        <td className="py-3 px-6 text-center"><input type="checkbox" name="customCheckSix" className="h-4 w-4 text-violet-600 rounded" /></td>
                        <td className="py-3 px-6 text-center"><input type="checkbox" name="customCheckSeven" className="h-4 w-4 text-violet-600 rounded" /></td>
                        <td className="py-3 px-6 text-center"><input type="checkbox" name="customCheckEight" className="h-4 w-4 text-violet-600 rounded" /></td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-6">When someone comments in threads I’m following</td>
                        <td className="py-3 px-6 text-center"><input type="checkbox" name="customCheckNine" className="h-4 w-4 text-violet-600 rounded" /></td>
                        <td className="py-3 px-6 text-center"><input type="checkbox" name="customCheckTen" className="h-4 w-4 text-violet-600 rounded" /></td>
                        <td className="py-3 px-6 text-center"><input type="checkbox" name="customCheckEleven" className="h-4 w-4 text-violet-600 rounded" /></td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-6">When someone @mentions me in any comments</td>
                        <td className="py-3 px-6 text-center"><input type="checkbox" name="customCheckTwelve" className="h-4 w-4 text-violet-600 rounded" /></td>
                        <td className="py-3 px-6 text-center"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><line x1="5" y1="12" x2="19" y2="12"></line></svg></td>
                        <td className="py-3 px-6 text-center"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><line x1="5" y1="12" x2="19" y2="12"></line></svg></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-violet-50">
                      <tr>
                        <th className="py-4 px-6 text-left font-semibold text-gray-800 w-3/5">Project Activity</th>
                        <th className="py-4 px-6 text-center"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg></th>
                        <th className="py-4 px-6 text-center"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"></path><path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"></path><path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z"></path><path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"></path><path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z"></path><path d="M15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"></path><path d="M10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z"></path><path d="M8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z"></path></svg></th>
                        <th className="py-4 px-6 text-center"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-6">When someone adds me to a project</td>
                        <td className="py-3 px-6 text-center"><input type="checkbox" name="customCheckThirteen" className="h-4 w-4 text-violet-600 rounded" /></td>
                        <td className="py-3 px-6 text-center"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><line x1="5" y1="12" x2="19" y2="12"></line></svg></td>
                        <td className="py-3 px-6 text-center"><input type="checkbox" name="customCheckFourteen" className="h-4 w-4 text-violet-600 rounded" /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-violet-50">
                      <tr>
                        <th className="py-4 px-6 text-left font-semibold text-gray-800 w-3/5">Team Activity</th>
                        <th className="py-4 px-6 text-center"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg></th>
                        <th className="py-4 px-6 text-center"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"></path><path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"></path><path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z"></path><path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"></path><path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z"></path><path d="M15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"></path><path d="M10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z"></path><path d="M8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z"></path></svg></th>
                        <th className="py-4 px-6 text-center"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-6">When my invitees sign up</td>
                        <td className="py-3 px-6 text-center"><input type="checkbox" name="customCheckSixteen" className="h-4 w-4 text-violet-600 rounded" /></td>
                        <td className="py-3 px-6 text-center"><input type="checkbox" name="customCheckSeventeen" className="h-4 w-4 text-violet-600 rounded" /></td>
                        <td className="py-3 px-6 text-center"><input type="checkbox" name="customCheckEighteen" className="h-4 w-4 text-violet-600 rounded" /></td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-6">When someone requests access to my team</td>
                        <td className="py-3 px-6 text-center"><input type="checkbox" name="customCheckNineteen" className="h-4 w-4 text-violet-600 rounded" /></td>
                        <td className="py-3 px-6 text-center"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><line x1="5" y1="12" x2="19" y2="12"></line></svg></td>
                        <td className="py-3 px-6 text-center"><input type="checkbox" name="customCheckNineteen" className="h-4 w-4 text-violet-600 rounded" /></td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-6">When someone invites me to a team</td>
                        <td className="py-3 px-6 text-center"><input type="checkbox" name="customCheckTwentyone" className="h-4 w-4 text-violet-600 rounded" /></td>
                        <td className="py-3 px-6 text-center"><input type="checkbox" name="customCheckTwentytwo" className="h-4 w-4 text-violet-600 rounded" /></td>
                        <td className="py-3 px-6 text-center"><input type="checkbox" name="customCheckTwentythree" className="h-4 w-4 text-violet-600 rounded" /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <hr className="my-6 border-violet-100/50" />

              {/* Select Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* <div className="space-y-2">
                  <label htmlFor="notification" className="block text-sm font-medium text-gray-700 tracking-wide">
                    When should we notify you?
                  </label>
                  <select
                    id="notification"
                    defaultValue="Always"
                    className="w-full p-3.5 border border-violet-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all duration-200 hover:border-violet-300"
                  >
                    {notificationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div> */}
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full md:w-auto px-8 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 focus:ring-4 focus:ring-violet-300/50 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
  )
}

export default Notifications