import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/auth";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../Components/Navigation/Navbar";
import Sidebar from "../../../Components/Navigation/Sidebar";

const CreateSubtask = () => {
  const [auth] = useAuth(); // Use authentication context
  const navigate = useNavigate();
  const { mainTaskId } = useParams(); // Get the mainTaskId from URL
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [subtaskData, setSubtaskData] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "To Do",
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubtaskData({ ...subtaskData, [name]: value });
  };

  // Handle form submission
// Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!auth || !auth.token) {
    toast.error("You are not authenticated!");
    return;
  }

  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API}/api/task/create-task/${mainTaskId}`, // POST request with mainTaskId
      { ...subtaskData, owner: auth.user.id }, // Include owner (user ID)
      {
        headers: {
          Authorization: `Bearer ${auth.token}`, // Include the auth token
        },
      }
    );

    // Success notification
    toast.success("Subtask created successfully!");

    // Assuming the response contains the subtask ID as response.data.subtaskId
    const subtaskId = response.data.subtaskId;

    // Navigate to the subtask detail page
    navigate(`/task/subtask/${mainTaskId}`); // Redirect after success to the correct subtask URL
    console.log(response.data);
  } catch (error) {
    // Log the error response to see what went wrong
    console.error("Error:", error.response?.data);
    toast.error(error.response?.data?.message || "Error creating subtask");
  }
};

  return (
    <div>
      <div className="flex bg-gray-50 min-h-screen">
        {/* Sidebar */}
        <aside className="h-screen sticky top-0 w-64 bg-gray-800 text-white">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Navbar />

          {/* Form Section */}
          <div className="p-10">
            <h1 className="text-2xl font-bold mb-6">Create Subtask</h1>

            {/* Success & Error Messages */}
            {message && <p className="text-green-600">{message}</p>}
            {error && <p className="text-red-600">{error}</p>}

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
              {/* Title */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={subtaskData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                <textarea
                  name="description"
                  value={subtaskData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Due Date */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={subtaskData.dueDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Status */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
                <select
                  name="status"
                  value={subtaskData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Subtask'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSubtask;
