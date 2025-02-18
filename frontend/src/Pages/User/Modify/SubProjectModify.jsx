import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../context/auth";

const ModifySubproject = ({ auth, setProjects, subProjectId, onClose }) => {
  const { projectId } = useParams(); // Get main project ID from the URL
  const [subproject, setSubproject] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (auth && auth.user && projectId && subProjectId) {
      fetchSubProject();
    }
    console.log("Updated projects:", subproject); 
  }, [auth, projectId, subProjectId]);

  const fetchSubProject = async () => {
    if (!projectId || !subProjectId) return;
    setLoading(true);
    try {
      // Correctly fetching subproject data with both projectId and subProjectId
      const response = await axios.get(
        `${process.env.REACT_APP_API}/api/project/subproject/${projectId}/${subProjectId}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      const subProjectData = response.data;
      if (subProjectData) {
        setSubproject(subProjectData);
      } else {
        setError("Subproject not found.");
      }
    } catch (err) {
      setError("Failed to fetch subproject.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubproject({ ...subproject, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = `${process.env.REACT_APP_API}/api/project/update-subproject/${projectId}/${subProjectId}`;
      const response = await axios.put(url, subproject, {
        headers: { Authorization: `Bearer ${auth.token}` },
      }); 

      setProjects((prev) =>
        prev.map((project) =>
          project._id === subProjectId ? { ...project, ...response.data.subProject } : project
        )
      );
      
      toast.success("Subproject updated successfully!");
      onClose();
    } catch (err) {
      toast.error("Error updating subproject.");
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
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Subproject</h2>
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
              value={subproject?.title || ""}
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
              value={subproject?.description || ""}
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
              value={subproject?.dueDate ? subproject.dueDate.split("T")[0] : ""}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Status</label>
            <select
              name="status"
              value={subproject?.status || "To Do"}
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

export default ModifySubproject;
