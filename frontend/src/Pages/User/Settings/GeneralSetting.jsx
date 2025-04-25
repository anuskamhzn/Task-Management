import React, { useEffect, useState } from 'react';
import axios from 'axios';
import countries from '../../../Assests/Users/Countries'; // Adjust the path
import { useAuth } from '../../../context/auth'; // Adjust the path
import toast from 'react-hot-toast';

const GeneralSetting = () => {
  const [auth, setAuth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    photo: null,
    initials: '',
  });

  // Fetch user info on mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!auth?.token) {
        setError('Please log in to view your profile');
        setLoading(false);
        return;
      }

      try {
        // console.log('Fetching user info with token:', auth.token);
        const response = await axios.get(`${process.env.REACT_APP_API}/api/auth/user-info`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });

        const userData = response.data;
        // console.log('User info response:', userData);

        if (!userData || typeof userData !== 'object') {
          throw new Error('Invalid user data received');
        }

        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          country: userData.location || '',
          photo: null,
          initials: userData.initials || '',
        });
      } catch (err) {
        console.error('Error fetching user info:', err);
        setError(err.response?.data?.message || 'Error fetching user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [auth?.token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, photo: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('location', formData.country);
      if (formData.photo) {
        data.append('photo', formData.photo);
      }

      // console.log('Sending update profile request to:', `${process.env.REACT_APP_API}/api/auth/updateProfile`);
      // console.log('Form data:', Object.fromEntries(data));

      const response = await axios.put(
        `${process.env.REACT_APP_API}/api/auth/updateProfile`,
        data,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // console.log('Update profile response:', response.data);

      if (response.data?.error) {
        toast.error(response.data.error);
        return;
      }

      const updatedUser = response.data.updatedUser;
      if (!updatedUser) {
        // console.warn('No updated user data received in response:', response.data);
        toast.error('Profile updated, but no user data returned');
        return;
      }

      setAuth({ ...auth, user: updatedUser });
      localStorage.setItem('auth', JSON.stringify({ ...auth, user: updatedUser }));
      setFormData((prev) => ({
        ...prev,
        name: updatedUser.name || '',
        email: updatedUser.email || '',
        phone: updatedUser.phone || '',
        country: updatedUser.location || '',
        initials: updatedUser.initials || '',
      }));
      toast.success('Profile Updated Successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
      if (error.response?.status === 401) {
        setAuth({ user: null, token: '' });
        localStorage.removeItem('auth');
        window.location.href = '/login';
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-violet-200/50">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 to-violet-800 px-6 py-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPjxwYXR0ZXJuIGlkPSJhIiB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48Y2lyY2xlIGN4PSIuNSIgY3k9Ii41IiByPSIuNSIgZmlsbD0iI2ZmZiIvPjwvcGF0dGVybj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')]"></div>
          <h4 className="text-2xl font-bold text-white relative z-10">General Settings</h4>
          <p className="text-violet-100 mt-2 text-sm relative z-10">Personalize your profile experience</p>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-10">
          {/* Avatar Section */}
          <div className="pb-8 border-b border-violet-100/50">
            <h5 className="text-xl font-semibold text-gray-800 mb-5 tracking-tight">Profile Avatar</h5>
            <div className="flex items-center gap-6">
              <div className="relative group">
                {formData.photo ? (
                  <img
                    src={URL.createObjectURL(formData.photo)}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-violet-100 transition-all duration-300 group-hover:ring-violet-300"
                  />
                ) : formData.initials ? (
                  <div className="w-20 h-20 rounded-full bg-violet-600 text-white flex items-center justify-center text-xl font-semibold ring-4 ring-violet-100 transition-all duration-300 group-hover:ring-violet-300">
                    {formData.initials}
                  </div>
                ) : (
                  <img
                    src="/images/avatar/avatar-5.jpg"
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-violet-100 transition-all duration-300 group-hover:ring-violet-300"
                  />
                )}
                {/* <div className="absolute -bottom-1 -right-1 bg-violet-600 w-5 h-5 rounded-full border-3 border-white animate-pulse"></div> */}
              </div>
            </div>
          </div>

          {/* Cover Photo Section */}
          {/* <div className="pb-8 border-b border-violet-100/50">
            <h5 className="text-xl font-semibold text-gray-800 mb-5 tracking-tight">Cover Photo</h5>
            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-600 file:mr-5 file:py-3 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 hover:file:text-violet-800 transition-all duration-200 cursor-pointer shadow-sm"
              />
            </div>
          </div> */}

          {/* Basic Information Form */}
          <div>
            <h4 className="text-2xl font-semibold text-gray-800 mb-8 tracking-tight">Basic Information</h4>
            <form onSubmit={handleSubmit} className="space-y-7">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 tracking-wide">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full name"
                  className="w-full p-3.5 border border-violet-200 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 tracking-wide">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full p-3.5 border border-violet-200 rounded-xl"
                  required
                  disabled
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 tracking-wide">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className="w-full p-3.5 border border-violet-200 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 tracking-wide">
                  Country
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full p-3.5 border border-violet-200 rounded-xl"
                >
                  <option value="">Select Country</option>
                  {countries.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4">
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
  );
};

export default GeneralSetting;