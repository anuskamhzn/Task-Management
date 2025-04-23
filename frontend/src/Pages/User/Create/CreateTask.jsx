import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/auth";
import toast from "react-hot-toast";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import sanitizeHtml from "sanitize-html";

const CreateTask = ({ onClose, onTaskCreated }) => {
  const [auth] = useAuth();
  const [loading, setLoading] = useState(false);
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "To Do",
  });

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData({ ...taskData, [name]: value });
  };

  const handleDescriptionChange = (value) => {
    setTaskData({ ...taskData, description: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sanitize description before submitting
      const cleanDescription = sanitizeHtml(taskData.description, {
        allowedTags: ['h1', 'h2', 'h3', 'p', 'strong', 'em', 'u', 'ul', 'ol', 'li'],
        allowedAttributes: {},
        disallowedTagsMode: 'discard',
      });
      const sanitizedTaskData = { ...taskData, description: cleanDescription };

      const response = await axios.post(
        `${process.env.REACT_APP_API}/api/task/create`,
        sanitizedTaskData,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      toast.success("Task created successfully!");
      if (onTaskCreated) {
        onTaskCreated(response.data.task);
      }
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating task");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Quill toolbar configuration
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean'],
    ],
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Create Task</h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-xl font-medium"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={taskData.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <ReactQuill
              value={taskData.description}
              onChange={handleDescriptionChange}
              className="bg-white"
              theme="snow"
              modules={quillModules}
              placeholder="Enter task description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={taskData.dueDate}
              onChange={handleChange}
              min={today}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={taskData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:opacity-50 transition"
          >
            {loading ? "Creating..." : "Create Task"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;