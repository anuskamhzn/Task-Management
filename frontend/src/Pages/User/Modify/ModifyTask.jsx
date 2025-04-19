import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/auth";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import sanitizeHtml from "sanitize-html";

const ModifyTask = ({ auth, setTasks, taskId, onClose }) => {
  const [task, setTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (auth && auth.user && taskId) {
      fetchTask();
    }
  }, [auth, taskId]);

  const fetchTask = async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/api/task`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const taskData = response.data.find((t) => t._id === taskId);
      if (taskData) {
        // Sanitize description when fetching
        const cleanDescription = sanitizeHtml(taskData.description || "", {
          allowedTags: ['h1', 'h2', 'h3', 'p', 'strong', 'em', 'u', 'ul', 'ol', 'li'],
          allowedAttributes: {},
          disallowedTagsMode: 'discard',
        });
        setTask({
          ...taskData,
          description: cleanDescription,
          dueDate: taskData.dueDate ? taskData.dueDate.split("T")[0] : "",
        });
      } else {
        setError("Task not found.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch task.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask({ ...task, [name]: value });
  };

  const handleDescriptionChange = (value) => {
    // Store raw HTML from ReactQuill without sanitization
    setTask({ ...task, description: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Sanitize description before submitting
      const cleanDescription = sanitizeHtml(task.description, {
        allowedTags: ['h1', 'h2', 'h3', 'p', 'strong', 'em', 'u', 'ul', 'ol', 'li'],
        allowedAttributes: {},
        disallowedTagsMode: 'discard',
      });
      const sanitizedTask = { ...task, description: cleanDescription };

      const url = `${process.env.REACT_APP_API}/api/task/update-task/${taskId}`;
      const response = await axios.put(url, sanitizedTask, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      if (response.data && response.data.task) {
        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t._id === taskId ? response.data.task : t
          )
        );
        toast.success("Task updated successfully!");
        onClose();
      } else {
        throw new Error("Invalid response from server.");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error updating task.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Quill toolbar configuration (same as ModifyProject.jsx)
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean'],
    ],
  };

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Edit Task</h2>
        <button
          className="text-gray-500 hover:text-gray-700 text-xl font-medium"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-4">Loading...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={task.title || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <ReactQuill
              value={task.description || ""}
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
              value={task.dueDate || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={task.status || "To Do"}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              required
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
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ModifyTask;