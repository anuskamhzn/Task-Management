import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/auth";
import parse from 'html-react-parser';

const ViewSubtaskDetail = ({ mainTaskId, subTaskId, onClose }) => {
  const [auth] = useAuth();
  const [subTask, setSubTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mainTaskId && subTaskId && auth.token) {
      fetchSubTask(); // Fixed function name casing
    }
  }, [mainTaskId, subTaskId, auth.token]);

  const fetchSubTask = async () => { // Consistent casing
    try {
      console.log("Fetching subtask with mainTaskId:", mainTaskId, "subTaskId:", subTaskId);
      const response = await axios.get(
        `${process.env.REACT_APP_API}/api/task/subtask/${mainTaskId}/${subTaskId}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      console.log("API Response:", response.data);

      if (response.data) {
        setSubTask(response.data); // Response is the subtask object directly
      } else {
        setError("No subtask found.");
      }
    } catch (err) {
      console.error("Error fetching subtask:", err.response?.data || err.message);
      if (err.response && err.response.status === 404) {
        setError(err.response.data.message || "No subtask found.");
      } else {
        setError("Failed to fetch subtask. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <p className="text-center text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <p className="text-center text-red-500">{error}</p>
        <button
          onClick={onClose}
          className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
        >
          Close
        </button>
      </div>
    );
  }

  if (!subTask) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <p className="text-center text-gray-500">No subtask data available.</p>
        <button
          onClick={onClose}
          className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Subtask Name: {subTask.title}</h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">Description</h3>
          <p className="text-gray-600 description-content">
            {subTask.description ? parse(subTask.description) : "No description available."}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700">Due Date</h3>
          <p className="text-gray-600">{new Date(subTask.dueDate).toLocaleDateString()}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700">Status</h3>
          <span
            className={`px-2 py-1 rounded-full text-sm ${subTask.status === "Completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
              }`}
          >
            {subTask.status}
          </span>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700">Task Owner</h3>
          <p className="text-gray-600">{subTask.owner?.username} ({subTask.owner?.email})</p>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
        >
          Close
        </button>
      </div>
      <style jsx>{`
    .description-content ul,
    .description-content ol {
      list-style: disc inside;
      padding-left: 1rem;
      margin: 0.5rem 0;
    }
    .description-content ol {
      list-style: decimal inside;
    }
    .description-content li {
      margin-bottom: 0.25rem;
    }
.description-content h1 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.5rem 0;
        }
        .description-content h2 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.5rem 0;
        }
        .description-content h3 {
          font-size: 1.1rem;
          font-weight: bold;
          margin: 0.5rem 0;
        }
        .description-content h4 {
          font-size: 1rem;
          font-weight: bold;
          margin: 0.5rem 0;
        }
  `}</style>
    </div>
  );
};

export default ViewSubtaskDetail;