import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/auth";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import sanitizeHtml from "sanitize-html";

const CreateSubtask = ({ onClose, onSubTaskCreated }) => {
  const [auth] = useAuth();
  const { taskId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [subtaskData, setSubtaskData] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "To Do",
  });

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split("T")[0];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubtaskData({ ...subtaskData, [name]: value });
  };

  // Handle description changes from ReactQuill
  const handleDescriptionChange = (value) => {
    setSubtaskData({ ...subtaskData, description: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!auth || !auth.token) {
      setError("You are not authenticated!");
      toast.error("You are not authenticated!");
      setLoading(false);
      return;
    }

    try {
      // Sanitize description before submitting
      const cleanDescription = sanitizeHtml(subtaskData.description, {
        allowedTags: ['h1', 'h2', 'h3', 'p', 'strong', 'em', 'u', 'ul', 'ol', 'li'],
        allowedAttributes: {},
        disallowedTagsMode: 'discard',
      });
      const sanitizedSubtaskData = {
        ...subtaskData,
        description: cleanDescription,
        owner: auth.user.id,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API}/api/task/create-task/${taskId}`,
        sanitizedSubtaskData,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      toast.success("Subtask created successfully!");

      // Pass the newly created subtask to the parent component
      if (onSubTaskCreated) {
        onSubTaskCreated(response.data);
      }
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error creating subtask";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error:", error.response?.data);
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
          <h2 className="text-xl font-semibold text-gray-800">Create Subtask</h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-xl font-medium"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={subtaskData.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Enter subtask title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <ReactQuill
              value={subtaskData.description}
              onChange={handleDescriptionChange}
              className="bg-white"
              theme="snow"
              modules={quillModules}
              placeholder="Enter subtask description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={subtaskData.dueDate}
              onChange={handleChange}
              min={today}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={subtaskData.status}
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
            {loading ? "Creating..." : "Create Subtask"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateSubtask;