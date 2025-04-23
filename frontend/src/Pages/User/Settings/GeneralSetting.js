import { useState } from 'react';
import countries from '../../../Assests/Users/Countries'; // Adjust the path based on your file structure

const GeneralSetting = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    zipcode: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log('Selected file:', file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

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
                <img
                  src="/images/avatar/avatar-5.jpg"
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-violet-100 transition-all duration-300 group-hover:ring-violet-300"
                />
                <div className="absolute -bottom-1 -right-1 bg-violet-600 w-5 h-5 rounded-full border-3 border-white animate-pulse"></div>
              </div>
              {/* <div className="flex gap-4">
                <button
                  type="button"
                  className="px-5 py-2.5 bg-violet-50 text-violet-700 rounded-xl hover:bg-violet-100 hover:text-violet-800 transition-all duration-200 font-medium shadow-sm"
                >
                  Change
                </button>
                <button
                  type="button"
                  className="px-5 py-2.5 bg-violet-50 text-violet-700 rounded-xl hover:bg-violet-100 hover:text-violet-800 transition-all duration-200 font-medium shadow-sm"
                >
                  Remove
                </button>
              </div> */}
            </div>
          </div>

          {/* Cover Photo Section */}
          <div className="pb-8 border-b border-violet-100/50">
            <h5 className="text-xl font-semibold text-gray-800 mb-5 tracking-tight">Cover Photo</h5>
            <div className="relative group">
              <input
                type="file"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-600 file:mr-5 file:py-3 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 hover:file:text-violet-800 transition-all duration-200 cursor-pointer shadow-sm"
              />
            </div>
          </div>

          {/* Basic Information Form */}
          <div>
            <h4 className="text-2xl font-semibold text-gray-800 mb-8 tracking-tight">Basic Information</h4>
            <form onSubmit={handleSubmit} className="space-y-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 tracking-wide">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    className="w-full p-3.5 border border-violet-200 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 tracking-wide">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                    className="w-full p-3.5 border border-violet-200 rounded-xl"
                    required
                  />
                </div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="space-y-2">
                  <label htmlFor="zipcode" className="block text-sm font-medium text-gray-700 tracking-wide">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    name="zipcode"
                    value={formData.zipcode}
                    onChange={handleChange}
                    placeholder="12345"
                    className="w-full p-3.5 border border-violet-200 rounded-xl"
                    required
                  />
                </div>
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