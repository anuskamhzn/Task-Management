import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/auth'; // Adjust the path
import toast from 'react-hot-toast';

const EmailSetting = () => {
  const [auth] = useAuth();
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API}/api/auth/updatePass`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      toast.success(response.data.message);
      // Clear form after success
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error updating password';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-violet-200/50">
        <div className="bg-gradient-to-r from-purple-700 to-violet-800 px-6 py-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPjxwYXR0ZXJuIGlkPSJhIiB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48Y2lyY2xlIGN4PSIuNSIgY3k9Ii41IiByPSIuNSIgZmlsbD0iI2ZmZiIvPjwvcGF0dGVybj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')]"></div>
          <h4 className="text-2xl font-bold text-white relative z-10">Change Password</h4>
          <p className="text-violet-100 mt-2 text-sm relative z-10">Update your account password</p>
        </div>

        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="oldPassword"
                className="block text-sm font-medium text-gray-700 tracking-wide"
              >
                Current Password
              </label>
              <input
                type="password"
                placeholder="Enter current password"
                id="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
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
                value={formData.newPassword}
                onChange={handleChange}
                required
                className="w-full p-3.5 border border-violet-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmNewPassword"
                className="block text-sm font-medium text-gray-700 tracking-wide"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                id="confirmNewPassword"
                value={formData.confirmNewPassword}
                onChange={handleChange}
                required
                className="w-full p-3.5 border border-violet-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all duration-200"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <div className="space-y-4">
              <div>
                <h6 className="text-sm font-semibold text-gray-800">Password Requirements:</h6>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>Minimum 6 characters long</li>
                </ul>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full md:w-auto px-8 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 focus:ring-4 focus:ring-violet-300/50 transition-all duration-200 font-medium shadow-md hover:shadow-lg ${
                  loading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmailSetting;