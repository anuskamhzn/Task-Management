import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const CreateProjectForm = ({ onClose, onProjectCreated }) => {
  const [projectData, setProjectData] = useState({
    title: "",
    description: "",
    members: [],
    dueDate: "",
    status: "To Do",
    newMember: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("auth"));
    if (storedUser && storedUser.token) {
      setUser(storedUser);
    } else {
      toast.error("You must be logged in to create a project.");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData({ ...projectData, [name]: value });
  };

  const handleDescriptionChange = (value) => {
    setProjectData({ ...projectData, description: value });
  };

  const handleAddMember = () => {
    if (projectData.newMember && !projectData.members.includes(projectData.newMember)) {
      setProjectData({
        ...projectData,
        members: [...projectData.members, projectData.newMember],
        newMember: "",
      });
    }
  };

  const handleRemoveMember = (email) => {
    setProjectData({
      ...projectData,
      members: projectData.members.filter((member) => member !== email),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectData.title || !projectData.description) {
      setError("Title and Description are required.");
      return;
    }
    if (!user) {
      setError("You must be logged in.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API}/api/project/create`,
        { ...projectData, members: projectData.members },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      toast.success("Project created successfully!");
      if (onProjectCreated) {
        onProjectCreated(response.data.project);
      }
      onClose();
      setProjectData({
        title: "",
        description: "",
        members: [],
        dueDate: "",
        status: "To Do",
        newMember: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Error creating project.");
      console.error(err);
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
          <h2 className="text-xl font-semibold text-gray-800">Create New Project</h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-xl font-medium"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={projectData.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Enter project title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <ReactQuill
              value={projectData.description}
              onChange={handleDescriptionChange}
              className="bg-white"
              theme="snow"
              modules={quillModules}
              placeholder="Enter project description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={projectData.dueDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Add Members</label>
            <div className="flex gap-2 mb-2">
              <input
                type="email"
                name="newMember"
                value={projectData.newMember || ""}
                onChange={handleChange}
                className="flex-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Enter member email"
              />
              <button
                type="button"
                onClick={handleAddMember}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 transition"
              >
                Add
              </button>
            </div>

            <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50">
              {projectData.members.length === 0 ? (
                <p className="text-gray-500 text-sm">No members added</p>
              ) : (
                projectData.members.map((email, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-blue-100 rounded-md p-1 mb-1"
                  >
                    <span className="text-blue-800 text-sm truncate flex-1">{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(email)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={projectData.status}
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
            className={`w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:opacity-50 transition ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Project"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectForm;