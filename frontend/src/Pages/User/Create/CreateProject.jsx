import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../Components/Navigation/Sidebar";
import Navbar from "../../../Components/Navigation/Navbar";
import toast from "react-hot-toast";

const CreateProjectForm = ({ onClose, onProjectCreated }) => {
  const [projectData, setProjectData] = useState({
    title: "",
    description: "",
    members: [], // Store members as an array of emails
    dueDate: "",
    status: "To Do",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null); // Store logged-in user
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the logged-in user from local storage
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

  const handleAddMember = () => {
    if (projectData.newMember && !projectData.members.includes(projectData.newMember)) {
      setProjectData({
        ...projectData,
        members: [...projectData.members, projectData.newMember],
        newMember: "", // Clear the new member input field after adding
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
        {
          ...projectData,
          members: projectData.members,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` }, // Pass JWT token
        }
      );
  
      toast.success("Project created successfully!");
  
      // Pass the newly created task to the parent component (Tasks)
      if (onProjectCreated) {
        onProjectCreated(response.data.project); // This updates the task list in the parent
      }
  
      // Close modal before resetting the state
      onClose(); 
  
      // Reset form after closing the modal
      setProjectData({
        title: "",
        description: "",
        members: [],
        dueDate: "",
        status: "To Do",
        newMember: "",
      });
  
    } catch (err) {
      setError(err.response?.data?.message || "Error creating project. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      {/* Modal Container */}
      <div className="bg-white p-8 rounded-lg shadow-lg w-96 relative">
        {/* Close Button (X) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xl text-gray-600 hover:text-gray-800"
        >
          &times;
        </button>
        {/* <div className="flex items-center justify-center flex-1 p-6">
          <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md"> */}
            <h1 className="text-2xl font-bold mb-6 text-center">Create New Project</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  name="title"
                  value={projectData.title}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  placeholder="Enter project title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={projectData.description}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  placeholder="Enter project description"
                  required
                />
              </div>

              {/* Due Date */}
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

              <div>
                <label className="block text-sm font-medium text-gray-700">Members (Add Emails)</label>
                <div className="flex mb-4">
                  <input
                    type="email"
                    name="newMember"
                    value={projectData.newMember || ""}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md"
                    placeholder="Enter email"
                  />
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md"
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

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  value={projectData.status}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  className={`w-full py-3 px-4 bg-blue-500 text-white rounded-md ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
    //   </div>
    // </div>
  );
};

export default CreateProjectForm;
