import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Manage = ({ groupId, currentUser, token, socket, onGroupUpdate, onGroupDeleted }) => {
  const [group, setGroup] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch group details
  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API}/api/group-chat/members/${groupId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGroup(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch group details');
      setLoading(false);
      console.error('Error fetching group:', err);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  // Add members
  const handleAddMembers = async () => {
    if (!emailInput.trim()) {
      setError('Please enter an email');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API}/api/group-chat/add-member`,
        { groupId, emails: [emailInput] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchGroupDetails();
      onGroupUpdate(response.data.group);
      setEmailInput('');
      setLoading(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
      setLoading(false);
      console.error('Error adding member:', err);
    }
  };

  // Remove member
  const handleRemoveMember = async (memberId) => {
    if (memberId === currentUser._id) {
      setError('Use "Quit Group" to remove yourself');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API}/api/group-chat/remove-member`,
        { groupId, memberId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGroup(response.data.group);
      onGroupUpdate(response.data.group);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError('Failed to remove member');
      setLoading(false);
      console.error('Error removing member:', err);
    }
  };

  // Quit group
  const handleQuitGroup = async () => {
    if (group.creator._id === currentUser._id) {
      setError('Creator cannot quit. Delete the group instead.');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API}/api/group-chat/quit`,
        { groupId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        onGroupDeleted(groupId);
      } else {
        setError(response.data.message || 'Failed to quit group');
      }
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to quit group');
      setLoading(false);
      console.error('Error quitting group:', err);
    }
  };

  // Delete group
  const handleDeleteGroup = async () => {
    if (group.creator._id !== currentUser._id) {
      setError('Only the creator can delete the group');
      return;
    }
    try {
      setLoading(true);
      await axios.post(
        `${process.env.REACT_APP_API}/api/group-chat/delete`,
        { groupId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      socket.emit('deleteGroup', groupId);
      onGroupDeleted(groupId);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError('Failed to delete group');
      setLoading(false);
      console.error('Error deleting group:', err);
    }
  };

    // Clear error message
    const clearError = () => {
      setError(null);
      // Optionally refetch group details to ensure UI updates correctly
      setEmailInput("");
      fetchGroupDetails();
    };

    const getRandomColor = (name) => {
      const colors = [
        'bg-red-500',
        'bg-blue-500',
        'bg-green-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-indigo-500',
        'bg-yellow-500',
        'bg-teal-500',
      ];
      const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
      return colors[index];
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center space-x-2 text-gray-300">
            <svg
              className="w-6 h-6 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
              />
            </svg>
            <span>Loading...</span>
          </div>
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="p-4">
          <div className="flex items-center justify-between bg-red-900 bg-opacity-30 p-3 rounded-lg animate-fade-in">
            <p className="text-red-300 text-sm">{error}</p>
            <button
              onClick={clearError}
              className="text-red-300 hover:text-red-100 focus:outline-none"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        </div>
      );
    }
  
    if (!group) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-300 text-lg">No group data available</p>
        </div>
      );
    }

  return (
    <div className="text-white space-y-6">
      {/* Group Header */}
      <div className="border-b border-gray-700 pb-4">
        <h3 className="text-2xl font-semibold text-white">{group.groupName}</h3>
        <p className="text-sm text-gray-400 mt-1">
          Admin: <span className="font-medium">{group.creator.name}</span>
        </p>
      </div>

      {/* Add Members Section */}
      <div className="space-y-3">
        <h4 className="text-lg font-medium text-gray-200">Add Members</h4>
        <div className="flex items-center space-x-2">
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="Enter email"
            className="flex-1 p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
          <button
            onClick={handleAddMembers}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 transition duration-200"
          >
            Add
          </button>
        </div>
      </div>

      {/* Members List */}
      <div className="space-y-3">
        <h4 className="text-lg font-medium text-gray-200">
          Members ({group.totalMembers || group.members?.length || 0})
        </h4>
        <ul className="space-y-3 max-h-60 overflow-y-auto bg-gray-800 p-3 rounded-lg">
          {group.members && group.members.length > 0 ? (
            group.members.map((member) => (
              <li
                key={member._id}
                className="flex justify-between items-center p-2 hover:bg-gray-700 rounded-lg transition duration-150"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.initials || 'User'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full ${getRandomColor(member.name || '')} flex items-center justify-center text-white text-sm font-semibold`}>
                        {member.initials || 'U'}
                      </div>
                    )}
                  </div>
                  <span className="text-gray-200">
                    {member.name || 'Unknown User'}{' '}
                    {member._id === group.creator._id && (
                      <span className="text-blue-400 text-sm">(Admin)</span>
                    )}
                  </span>
                </div>
                {group.creator._id === currentUser._id && member._id !== currentUser._id && (
                  <button
                    onClick={() => handleRemoveMember(member._id)}
                    className="text-red-400 hover:text-red-500 text-sm font-medium transition duration-200"
                  >
                    Remove
                  </button>
                )}
              </li>
            ))
          ) : (
            <p className="text-gray-400 text-center">No members found</p>
          )}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {group.creator._id === currentUser._id ? (
          <button
            onClick={handleDeleteGroup}
            disabled={loading}
            className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 transition duration-200"
          >
            Delete Group
          </button>
        ) : (
          <button
            onClick={handleQuitGroup}
            disabled={loading}
            className="w-full py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50 transition duration-200"
          >
            Quit Group
          </button>
        )}
      </div>
    </div>
  );
};

export default Manage;