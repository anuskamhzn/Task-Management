import React from 'react';
import axios from 'axios';

const AddGroupModal = ({
  show,
  onClose,
  groupNameInput,
  setGroupNameInput,
  token,
  setGroups,
  groups,
  setNewGroupId,
  setShowAddMembersModal,
}) => {
  if (!show) return null;

  const handleCreateGroup = async () => {
    if (!groupNameInput.trim()) {
      alert("Please enter a group name.");
      return;
    }
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API}/api/group-chat/create`,
        { name: groupNameInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        const newGroup = {
          id: response.data.group._id,
          name: response.data.group.name,
          avatar: 'https://example.com/default-group-avatar.jpg',
        };
        setGroups([...groups, newGroup]);
        setNewGroupId(response.data.group._id);
        setShowAddMembersModal(true);
        onClose();
        setGroupNameInput('');
      }
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Failed to create group.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-4 rounded-lg relative w-80">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✖
        </button>
        <h3 className="text-lg font-bold mb-3">Create Group</h3>
        <input
          type="text"
          value={groupNameInput}
          onChange={(e) => setGroupNameInput(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
          placeholder="Enter group name"
        />
        <button
          onClick={handleCreateGroup}
          className="w-full mt-3 bg-green-500 text-white py-2 rounded-lg text-sm"
        >
          Create
        </button>
      </div>
    </div>
  );
};

export default AddGroupModal;