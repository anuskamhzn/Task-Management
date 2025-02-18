import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../context/auth";

const ModifyProject = ({ auth, setProjects, projectId , onClose}) => {
  const [project, setProject] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (auth && auth.user && projectId) {
      fetchProjects();
    }
  }, [auth, projectId]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/api/project`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const ProjectData = response.data.find((project) => project._id === projectId);
      console.log(ProjectData);
      if (ProjectData) {
        setProject(ProjectData);
      } else {
        setError("Project not found.");
      }
    } catch (err) {
      setError("Error fetching projects");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject({ ...project, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = `${process.env.REACT_APP_API}/api/project/update-project/${projectId}`;
      const response = await axios.put(url, project, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
  
      // Ensure that `response.data.Task` exists
      if (response.data && response.data.project) {
        setProjects((prevProjects) =>
          prevProjects.map((project) =>
            project._id === projectId ? { ...project, ...response.data.project } : project
          )
        );
      }
  
      toast.success("Project updated successfully!");
      onClose(); // Close modal after success
    } catch (err) {
      toast.error("Error updating Project.");
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
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Project</h2>
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
              value={project?.title || ""}
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
              value={project?.description || ""}
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
              value={project?.dueDate ? project.dueDate.split("T")[0] : ""}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Status</label>
            <select
              name="status"
              value={project?.status || "To Do"}
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

export default ModifyProject;