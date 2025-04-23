import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/auth";
import parse from 'html-react-parser';

const ViewTaskDetail = ({ taskId, onClose }) => {
  const [auth] = useAuth();
  const [task, settask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (taskId && auth.token) {
      fetchTaskDetails();
    }
  }, [taskId, auth]);

  const fetchTaskDetails = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/api/task/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      settask(response.data);
    } catch (err) {
      setError("Error fetching task details");
      console.error(err);
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

  if (!task) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <p className="text-center text-gray-500">No task data available.</p>
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
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Task Name: {task.title}</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">Description</h3>
          <div className="text-gray-600 description-content">{parse(task.description)}</div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700">Due Date</h3>
          <p className="text-gray-600">{new Date(task.dueDate).toLocaleDateString()}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700">Status</h3>
          <span
            className={`px-2 py-1 rounded-full text-sm ${
              task.status === "Completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {task.status}
          </span>
        </div>

        {/* <div>
          <h3 className="text-lg font-semibold text-gray-700">Owner</h3>
          <p className="text-gray-600">{task.owner?.username} ({task.owner?.email})</p>
        </div> */}
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

export default ViewTaskDetail;