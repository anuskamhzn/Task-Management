import React, { Suspense, useState } from 'react';
import Navbar from '../../Components/Navigation/Navbar';
import Sidebar from '../../Components/Navigation/Sidebar';
import { useAuth } from '../../context/auth';

import GeneralSetting from './Settings/GeneralSetting';
import EmailSetting from './Settings/EmailSetting';
import DeleteAccount from './Settings/DeleteAccount';
import Notifications from './Settings/Notifications';

const Setting = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsSidebarOpen, setIsSettingsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const toggleMainSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleSettingsSidebar = () => setIsSettingsSidebarOpen(!isSettingsSidebarOpen);

  // Settings menu items for the secondary sidebar
  const settingsMenu = [
    { id: 'general', label: 'General', icon: 'cog' },
    { id: 'password', label: 'Password', icon: 'lock' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' },
    // { id: 'deactivate', label: 'Deactivate Account', icon: 'cancel' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Main Navigation Sidebar */}
        <aside className="h-screen sticky top-0 w-64 bg-gray-800 text-white">
          <Sidebar />
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          <Navbar />

          {/* Mobile Toggle Buttons */}
          <div className="lg:hidden fixed top-4 left-4 z-50 flex space-x-2">
            {/* Main Sidebar Toggle */}
            <button
              className="p-3 bg-gray-800 text-white rounded-lg shadow-md"
              onClick={toggleMainSidebar}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                ></path>
              </svg>
            </button>
            {/* Settings Sidebar Toggle */}
            <button
              className="p-3 bg-purple-600 text-white rounded-lg shadow-md"
              onClick={toggleSettingsSidebar}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
            </button>
          </div>

          {/* Settings Layout */}
          <div className="flex w-full max-w-[90rem] mx-auto mt-16 lg:mt-8 px-4 sm:px-6 lg:px-8">
            {/* Settings Sidebar */}
            <aside
              className={`w-80 bg-white shadow-lg rounded-xl p-6 transform transition-transform duration-300 ${isSettingsSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0 lg:block fixed lg:static top-0 left-0 h-screen lg:h-auto z-40 bg-white/95 backdrop-blur-sm lg:bg-white`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-700">Settings</h2>
                <button
                  className="lg:hidden p-2 text-gray-600 hover:text-gray-800"
                  onClick={toggleSettingsSidebar}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>
              <nav className="space-y-2">
                {settingsMenu.map((item) => (
                  <button
                    key={item.id}
                    className={`w-full flex items-center space-x-3 py-3 px-4 rounded-lg text-base font-medium transition-colors ${activeTab === item.id
                        ? 'bg-blue-100 text-purple-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                      }`}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsSettingsSidebarOpen(false); // Close sidebar on mobile after selection
                    }}
                  >
                    <i className={`fas fa-${item.icon} text-lg`}></i>
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </aside>

            {/* Settings Content */}
            <main className="flex-1 bg-white shadow-lg rounded-xl p-8 ml-2">
              <div className="space-y-6">
                {activeTab === 'general' && (
                  <div >
                    <GeneralSetting />
                  </div>
                )}
                {activeTab === 'password' && (
                  <div className="p-6">
                    {/* <h2 className="text-2xl font-semibold text-gray-800 mb-4">Email Settings</h2>
                    <p className="text-gray-600">Manage your email preferences and notifications.</p> */}
                    <EmailSetting/>
                  </div>
                )}
                {activeTab === 'notifications' && (
                  <div className="p-6">
                    {/* <h2 className="text-2xl font-semibold text-gray-800 mb-4">Notifications</h2>
                    <p className="text-gray-600">Configure your notification settings.</p> */}
                    <Notifications/>
                  </div>
                )}
                {activeTab === 'deactivate' && (
                  <div className="p-6 ">
                    {/* <h2 className="text-2xl font-semibold text-gray-800 mb-4">deactivate Account</h2>
                    <p className="text-gray-600">Permanently deactivate your account and data.</p> */}
                    <DeleteAccount/>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebars */}
      {(isSidebarOpen || isSettingsSidebarOpen) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => {
            setIsSidebarOpen(false);
            setIsSettingsSidebarOpen(false);
          }}
        ></div>
      )}
    </div>
  );
};

export default Setting;