import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../context/auth";

const ModifySubtask = ({ auth, setTasks, subTaskId , onClose}) => {
  const { taskId } = useParams(); // Get main task ID from the URL
  const [subtask, setSubtask] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (auth && auth.user && taskId && subTaskId) {
      fetchSubtask();
    }
  }, [auth, taskId, subTaskId]);

  const fetchSubtask = async () => {
    if (!taskId || !subTaskId) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API}/api/task/subtask/${taskId}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      const subtaskData = response.data.find((sub) => sub._id === subTaskId);
      if (subtaskData) setSubtask(subtaskData);
      else setError("Subtask not found.");
    } catch (err) {
      setError("Failed to fetch subtask.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubtask({ ...subtask, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = `${process.env.REACT_APP_API}/api/task/update-subtask/${taskId}/${subTaskId}`;
      const response = await axios.put(url, subtask, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === subtask._id ? { ...task, ...response.data.subTask } : task
        )
      );

      toast.success("Subtask updated successfully!");
      onClose();
    } catch (err) {
      toast.error("Error updating subtask.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-96 bg-white rounded-2xl shadow-lg p-8 relative">
      <button
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
        onClick={onClose}
      >
        ✖
      </button>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Subtask</h2>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-500 font-medium">{error}</p>}

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={subtask?.title || ""}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Enter the title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Description</label>
            <textarea
              name="description"
              value={subtask?.description || ""}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Enter the description"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={subtask?.dueDate ? subtask.dueDate.split("T")[0] : ""}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Status</label>
            <select
              name="status"
              value={subtask?.status || "To Do"}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
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
            className="w-full bg-blue-500 text-white py-3 px-5 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ModifySubtask;