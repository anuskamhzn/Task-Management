import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/auth';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [auth] = useAuth();
  const [preferences, setPreferences] = useState({
    CREATE_TASK : true,
    CREATE_SUBTASK: true,
    PROJECT_INVITE: true,
    DUE_DATE_PROJECT: true,
    GROUP_CHAT_CREATED: true,
    DUE_DATE_TASK: true,
    SUBPROJECT_ASSIGNMENT: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notification preferences on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API}/api/notification/preferences`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setPreferences(response.data.preferences || preferences);
        setError(null);
      } catch (error) {
        console.error('Error fetching notification preferences:', error);
        setError(error.response?.data?.message || 'Failed to fetch preferences');
      } finally {
        setLoading(false);
      }
    };

    if (auth.token) {
      fetchPreferences();
    }
  }, [auth.token]);

  // Handle checkbox changes
  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setPreferences((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Handle saving preferences
  const handleSaveChanges = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API}/api/notification/preferences`,
        { preferences },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      toast.success('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error(error.response?.data?.message || 'Failed to save preferences.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-violet-200/50">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 to-violet-800 px-6 py-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPjxwYXR0ZXJuIGlkPSJhIiB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48Y2lyY2xlIGN4PSIuNSIgY3k9Ii41IiByPSIuNSIgZmlsbD0iI2ZmZiIvPjwvcGF0dGVybj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')]"></div>
          <h4 className="text-2xl font-bold text-white relative z-10">Notification Settings</h4>
          <p className="text-violet-100 mt-2 text-sm relative z-10">Manage how you receive updates</p>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-violet-200/50">
            <div className="p-6 md:p-8 space-y-8">
              {/* Tables */}
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-violet-50">
                      <tr>
                        <th className="py-4 px-6 text-left font-semibold text-gray-800 w-3/5">Individual Task</th>
                        <th className="py-4 px-6 text-center font-semibold text-gray-800 w-1/5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-gray-600 mx-auto"
                          >
                            <path d="M12 22a3 3 0 0 0 3-3H9a3 3 0 0 0 3 3z"></path>
                            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18c0-3-3-9-3-9z"></path>
                          </svg>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-6 align-middle">Task Create</td>
                        <td className="py-3 px-6 text-center align-middle">
                          <input
                            type="checkbox"
                            name="CREATE_TASK"
                            checked={preferences.CREATE_TASK}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-violet-600 rounded mx-auto"
                          />
                        </td>
                      </tr>
                    </tbody>
                    <tbody>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-6 align-middle">Due date of the task</td>
                        <td className="py-3 px-6 text-center align-middle">
                          <input
                            type="checkbox"
                            name="DUE_DATE_TASK"
                            checked={preferences.DUE_DATE_TASK}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-violet-600 rounded mx-auto"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-violet-50">
                      <tr>
                        <th className="py-4 px-6 text-left font-semibold text-gray-800 w-3/5">Project Activity</th>
                        <th className="py-4 px-6 text-center font-semibold text-gray-800 w-1/5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-gray-600 mx-auto"
                          >
                            <path d="M12 22a3 3 0 0 0 3-3H9a3 3 0 0 0 3 3z"></path>
                            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18c0-3-3-9-3-9z"></path>
                          </svg>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-6 align-middle">When someone adds me to a project</td>
                        <td className="py-3 px-6 text-center align-middle">
                          <input
                            type="checkbox"
                            name="PROJECT_INVITE"
                            checked={preferences.PROJECT_INVITE}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-violet-600 rounded mx-auto"
                          />
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-6 align-middle">Project Create</td>
                        <td className="py-3 px-6 text-center align-middle">
                          <input
                            type="checkbox"
                            name="CREATE_PROJECT"
                            checked={preferences.CREATE_PROJECT}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-violet-600 rounded mx-auto"
                          />
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-6 align-middle">Sub Project Assigned</td>
                        <td className="py-3 px-6 text-center align-middle">
                          <input
                            type="checkbox"
                            name="SUBPROJECT_ASSIGNMENT"
                            checked={preferences.SUBPROJECT_ASSIGNMENT}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-violet-600 rounded mx-auto"
                          />
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-6 align-middle">Due date of the project</td>
                        <td className="py-3 px-6 text-center align-middle">
                          <input
                            type="checkbox"
                            name="DUE_DATE_PROJECT"
                            checked={preferences.DUE_DATE_PROJECT}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-violet-600 rounded mx-auto"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-violet-50">
                      <tr>
                        <th className="py-4 px-6 text-left font-semibold text-gray-800 w-3/5">Team Activity</th>
                        <th className="py-4 px-6 text-center font-semibold text-gray-800 w-1/5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-gray-600 mx-auto"
                          >
                            <path d="M12 22a3 3 0 0 0 3-3H9a3 3 0 0 0 3 3z"></path>
                            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18c0-3-3-9-3-9z"></path>
                          </svg>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-6 align-middle">Group Chat Created</td>
                        <td className="py-3 px-6 text-center align-middle">
                          <input
                            type="checkbox"
                            name="GROUP_CHAT_CREATED"
                            checked={preferences.GROUP_CHAT_CREATED}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-violet-600 rounded mx-auto"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <hr className="my-6 border-violet-100/50" />
              {/* Select Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"></div>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  className="w-full md:w-auto px-8 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 focus:ring-4 focus:ring-violet-300/50 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;