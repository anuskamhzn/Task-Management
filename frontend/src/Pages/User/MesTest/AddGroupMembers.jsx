// src/components/Message/AddGroupMembers.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/auth';
import toast from 'react-hot-toast';

const AddGroupMembers = ({ groupId, onClose, onMembersAdded }) => {
  const [auth] = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle adding a single email to the list
  const handleAddEmail = () => {
    if (emailInput.trim() && !emails.includes(emailInput.trim())) {
      setEmails([...emails, emailInput.trim()]);
      setEmailInput(''); // Clear input after adding
      setError(null); // Clear any previous error
    } else if (emails.includes(emailInput.trim())) {
      setError('This email is already in the list.');
    } else {
      setError('Please enter a valid email.');
    }
  };

  // Handle removing an email from the list
  const handleRemoveEmail = (emailToRemove) => {
    setEmails(emails.filter(email => email !== emailToRemove));
    setError(null); // Clear any error when removing
  };

  // Handle submitting the email list to the server
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (emails.length === 0) {
      setError('Please add at least one email.');
      toast.error('Please add at least one email.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API}/api/group-chat/add-member`,
        {
          groupId,
          emails,
        },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );

      if (response.data.success) {
        if (response.data.addedMembers === 0) {
          // Treat as error if no members were added (e.g., unregistered emails)
          setError(response.data.message);
          toast.error(response.data.message);
        } else {
          toast.success(response.data.message || 'Members added successfully!');
          if (onMembersAdded) onMembersAdded(response.data.group); // Update parent state
          onClose(); // Close modal on success
        }
      } else {
        setError(response.data.message || 'Failed to add members');
        toast.error(response.data.message || 'Failed to add members');
      }
    } catch (err) {
      console.error('Error adding members:', err);
      const errorMessage = err.response?.data?.message || 'An error occurred while adding members';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg relative w-96">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✖
        </button>
        <h3 className="text-lg font-bold mb-4">Add Members to Group</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Add Email</label>
          <div className="flex space-x-2 mt-1">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="p-2 w-full border border-gray-300 rounded-lg"
              placeholder="Enter an email"
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleAddEmail}
              className="px-4 py-1 bg-blue-500 text-white rounded-lg disabled:bg-gray-400"
              disabled={loading || !emailInput.trim()}
            >
              Add
            </button>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {emails.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Members to Add</label>
            <ul className="mt-2 space-y-2">
              {emails.map((email, index) => (
                <li key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
                  <span>{email}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveEmail(email)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <button
          type="submit"
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white py-2 rounded-lg disabled:bg-gray-400"
          disabled={loading || emails.length === 0}
        >
          {loading ? 'Adding...' : 'Add Members'}
        </button>
      </div>
    </div>
  );
};

export default AddGroupMembers;