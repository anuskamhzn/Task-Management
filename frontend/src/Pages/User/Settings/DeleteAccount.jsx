import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const DeleteAccount = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivate, setShowDeactivate] = useState(false);

  const handleDeactivate = () => {
    setShowDeactivate(true);
  };

  const handleCancel = () => {
    setShowDeactivate(false);
  };
  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-violet-200/50">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 to-violet-800 px-6 py-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPjxwYXR0ZXJuIGlkPSJhIiB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48Y2lyY2xlIGN4PSIuNSIgY3k9Ii41IiByPSIuNSIgZmlsbD0iI2ZmZiIvPjwvcGF0dGVybj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')]"></div>
          <h4 className="text-2xl font-bold text-white relative z-10">Account Management</h4>
          <p className="text-violet-100 mt-2 text-sm relative z-10">Choose to deactivate or permanently delete your account below.</p>
        </div>

        {/* Deactivate Account Card */}
        <div className="p-6 md:p-8 space-y-6 bg-blue-50">
          <h3 className="text-lg font-semibold text-gray-800">Deactivate Account</h3>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            Temporarily disable your account. Your content, including articles, comments, reading lists, and chat messages, will be hidden but can be restored later.
          </p>
          <div className="mt-4">
            <button
              onClick={handleDeactivate}
              // to="/login"
              className="inline-flex px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-300/50 transition-all duration-200 text-sm font-medium"
              aria-label="Deactivate your account"
            >
              Deactivate
            </button>
          </div>
        </div>

        {/* Delete Account Card */}
        {/* <div className="p-6 md:p-8 space-y-6 bg-red-50">
          <h3 className="text-lg font-semibold text-gray-800">Delete Account</h3>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            Permanently remove your account and all associated content, including articles, comments, reading lists, and chat messages.{' '}
            <span className="text-red-600 font-medium">This action cannot be undone.</span>
          </p>
          <div className="mt-4">
            <button
              onClick={handleDeleteClick}
              className="inline-flex px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-300/50 transition-all duration-200 text-sm font-medium"
              aria-label="Delete your account permanently"
            >
              Delete
            </button>
          </div>
        </div> */}
      </div>

      {/* Deactivate Confirmation Modal */}
      {showDeactivate && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 animate-slide-up">
            <h3 className="text-lg font-semibold text-gray-900">Confirm Account Deactivate</h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to deactivate your account? This action is irreversible.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-300/50 transition-all duration-200 text-sm font-medium"
                aria-label="Cancel account deletion"
              >
                Cancel
              </button>
              <NavLink
                to="/login"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-300/50 transition-all duration-200 text-sm font-medium"
                onClick={() => setShowDeleteModal(false)}
                aria-label="Confirm account deletion"
              >
                Delete
              </NavLink>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {/* {showDeleteModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 animate-slide-up">
            <h3 className="text-lg font-semibold text-gray-900">Confirm Account Deletion</h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to permanently delete your account? This action is irreversible.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-300/50 transition-all duration-200 text-sm font-medium"
                aria-label="Cancel account deletion"
              >
                Cancel
              </button>
              <NavLink
                to="/login"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-300/50 transition-all duration-200 text-sm font-medium"
                onClick={() => setShowDeleteModal(false)}
                aria-label="Confirm account deletion"
              >
                Delete
              </NavLink>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default DeleteAccount;