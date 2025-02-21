import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/auth";
import toast from "react-hot-toast";

const CreateTask = ({ onClose, onTaskCreated }) => {
  const [auth] = useAuth();
  const [loading, setLoading] = useState(false);
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "To Do",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData({ ...taskData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API}/api/task/create`,
        taskData,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      toast.success("Task created successfully!");
      // Pass the newly created task to the parent component (Tasks)
      if (onTaskCreated) {
        onTaskCreated(response.data.task); // This updates the task list in the parent
      }
      onClose(); // Close modal on successful task creation
    } catch (error) {
      toast.error("Error creating task");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      {/* Modal Container */}
      <div className="bg-white p-8 rounded-lg shadow-lg w-96 relative">
        {/* Close Button (X) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xl text-gray-600 hover:text-gray-800"
        >
          &times;
        </button>

        <h1 className="text-2xl font-bold mb-6 text-center">Create Task</h1>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={taskData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
            <textarea
              name="description"
              value={taskData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={taskData.dueDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
            <select
              name="status"
              value={taskData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;
