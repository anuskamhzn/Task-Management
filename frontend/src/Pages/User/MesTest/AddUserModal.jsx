import React from 'react';
import axios from 'axios';

const AddUserModal = ({ show, onClose, emailInput, setEmailInput, token, setUsers, users }) => {
  if (!show) return null;

  const handleAddUser = async () => {
    if (!emailInput.trim()) {
      alert("Please enter a valid email.");
      return;
    }
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API}/api/chat/add`,
        { email: emailInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.message.includes("User added")) {
        setUsers([...users, response.data.user]);
        onClose();
        setEmailInput('');
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Failed to add user.");
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
        <h3 className="text-lg font-bold mb-3">Add User</h3>
        <input
          type="text"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
          placeholder="Enter user's email"
        />
        <button
          onClick={handleAddUser}
          className="w-full mt-3 bg-blue-500 text-white py-2 rounded-lg text-sm"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default AddUserModal;