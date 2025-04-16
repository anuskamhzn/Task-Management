import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ReactQuill from "react-quill"; // Import React Quill
import "react-quill/dist/quill.snow.css"; // Import Quill styles

const CreateProjectForm = ({ onClose, onProjectCreated }) => {
  const [projectData, setProjectData] = useState({
    title: "",
    description: "", // This will now store HTML from React Quill
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

  // Handle rich text editor change
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
      if (onProjectCreated) onProjectCreated(response.data.project);
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

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96 relative max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xl text-gray-600 hover:text-gray-800"
        >
          ×
        </button>
        <h1 className="text-2xl font-bold mb-6">Create New Project</h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={projectData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter project title"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
            <ReactQuill
              value={projectData.description}
              onChange={handleDescriptionChange}
              className="bg-white"
              theme="snow"
              placeholder="Enter project description"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={projectData.dueDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Add Members</label>
            <div className="flex mb-4">
              <input
                type="email"
                name="newMember"
                value={projectData.newMember || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter member email"
              />
              <button
                type="button"
                onClick={handleAddMember}
                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap">
              {projectData.members.map((email, index) => (
                <span
                  key={index}
                  className="inline-flex items-center bg-blue-200 text-blue-700 py-1 px-3 rounded-full mr-2 mb-2"
                >
                  {email}
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(email)}
                    className="ml-2 text-red-500"
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
            <select
              name="status"
              value={projectData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectForm;