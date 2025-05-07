import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import sanitizeHtml from "sanitize-html";

const ModifySubtask = ({ auth, setTasks, subTaskId, onClose }) => {
  const { taskId } = useParams();
  const [subtask, setSubtask] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "To Do",
    members: [],
    createdAt: "",
  });
  const [initialSubtask, setInitialSubtask] = useState(null);
  const today = new Date().toISOString().split("T")[0];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch subtask details
  const fetchSubtask = useCallback(async () => {
    if (!taskId || !subTaskId) {
      setError("Invalid task or subtask ID.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API}/api/task/subtask/${taskId}/${subTaskId}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      const subtaskData = response.data;
      if (subtaskData) {
        const rawDescription = typeof subtaskData.description === 'string' ? subtaskData.description : '';
        const cleanDescription = sanitizeHtml(rawDescription, {
          allowedTags: ['h1', 'h2', 'h3', 'p', 'strong', 'em', 'u', 'ul', 'ol', 'li'],
          allowedAttributes: {},
          disallowedTagsMode: 'discard',
        });
        const formattedSubtask = {
          ...subtaskData,
          description: cleanDescription || '<p></p>', // Ensure non-empty description
          dueDate: subtaskData.dueDate ? subtaskData.dueDate.split("T")[0] : "",
          members: subtaskData.members || [],
        };
        setSubtask(formattedSubtask);
        setInitialSubtask(formattedSubtask);
        console.log("Fetched Subtask Description:", formattedSubtask.description); // Debug
      } else {
        setError("Subtask not found.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch subtask.");
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [auth.token, taskId, subTaskId]);

  useEffect(() => {
    if (auth && auth.user && taskId && subTaskId) {
      fetchSubtask();
    }
  }, [auth, taskId, subTaskId, fetchSubtask]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";
    return () => {
      document.body.style.overflow = "auto";
      document.body.style.height = "auto";
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubtask({ ...subtask, [name]: value });
  };

  const handleDescriptionChange = (value) => {
    setSubtask({ ...subtask, description: value || '<p></p>' });
    console.log("Quill Description:", value); // Debug
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!taskId || !subTaskId) {
        throw new Error("Invalid task or subtask ID.");
      }

      // Sanitize description before submitting
      const cleanDescription = sanitizeHtml(subtask.description || '<p></p>', {
        allowedTags: ['h1', 'h2', 'h3', 'p', 'strong', 'em', 'u', 'ul', 'ol', 'li'],
        allowedAttributes: {},
        disallowedTagsMode: 'discard',
      });
      const sanitizedSubtask = {
        title: subtask.title,
        description: cleanDescription,
        dueDate: subtask.dueDate,
        status: subtask.status,
      };
      console.log("Sanitized Subtask Payload:", sanitizedSubtask); // Debug

      const url = `${process.env.REACT_APP_API}/api/task/update-subtask/${taskId}/${subTaskId}`;
      const response = await axios.put(url, sanitizedSubtask, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      console.log("API Response:", response.data); // Debug

      // Normalize the response
      const responseDescription = response.data.subtask?.description || response.data.description || cleanDescription;
      const normalizedDescription = sanitizeHtml(responseDescription, {
        allowedTags: ['h1', 'h2', 'h3', 'p', 'strong', 'em', 'u', 'ul', 'ol', 'li'],
        allowedAttributes: {},
        disallowedTagsMode: 'discard',
      }) || '<p></p>';

      const updatedSubtask = {
        ...subtask,
        ...response.data.subtask || response.data,
        description: normalizedDescription,
        dueDate: response.data.subtask?.dueDate || response.data.dueDate
          ? (response.data.subtask?.dueDate || response.data.dueDate).split("T")[0]
          : subtask.dueDate,
        members: response.data.subtask?.members || response.data.members || subtask.members,
      };

      // Update tasks state
      setTasks((prevTasks) => {
        const newTasks = prevTasks.map((t) =>
          t._id === subTaskId ? updatedSubtask : t
        );
        console.log("Updated Tasks Description:", updatedSubtask.description); // Debug
        return newTasks;
      });

      toast.success("Subtask updated successfully!");
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Error updating subtask.";
      setError(errorMessage);
      toast.error(errorMessage);
      setSubtask(initialSubtask); // Revert to initial state
      console.error("Update Error:", err);
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
    <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Edit Subtask</h2>
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
              value={subtask.title || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Enter subtask title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <ReactQuill
              value={subtask.description || ""}
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
              value={subtask.dueDate || ""}
              onChange={handleChange}
              min={today}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
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

export default ModifySubtask;