import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../context/auth";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../../../Components/Navigation/Navbar";
import Sidebar from "../../../Components/Navigation/Sidebar";

const CreateSubproject = () => {
  const [auth] = useAuth(); // Use authentication context
  const navigate = useNavigate();
  const { projectId } = useParams(); // Get the mainProjectId from URL
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [subprojectData, setSubprojectData] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "To Do",
    members: [], // Store members as emails
    newMember: "", // Input for adding a new member by email
  });

  useEffect(() => {
    if (!auth || !auth.token) {
      toast.error("You must be logged in to create a subproject.");
    }
  }, [auth]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubprojectData({ ...subprojectData, [name]: value });
  };

  // Add a new member by email
  const handleAddMember = () => {
    if (subprojectData.newMember && !subprojectData.members.includes(subprojectData.newMember)) {
      setSubprojectData({
        ...subprojectData,
        members: [...subprojectData.members, subprojectData.newMember],
        newMember: "", // Clear the new member input field after adding
      });
    }
  };

  // Remove a member from the list
  const handleRemoveMember = (email) => {
    setSubprojectData({
      ...subprojectData,
      members: subprojectData.members.filter((member) => member !== email),
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth || !auth.token) {
      toast.error("You are not authenticated!");
      return;
    }

    if (!subprojectData.title || !subprojectData.description) {
      setError("Title and Description are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API}/api/project/create-project/${projectId}`,
        { ...subprojectData, owner: auth.user.id }, // Include owner (user ID)
        {
          headers: {
            Authorization: `Bearer ${auth.token}`, // Include the auth token
          },
        }
      );

      toast.success("Subproject created successfully!");
      navigate(`/dashboard/project/subproject/${projectId}`); // Redirect to subproject detail page
    } catch (err) {
      setError(err.response?.data?.message || "Error creating subproject.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex bg-gray-50 min-h-screen">
        {/* Sidebar */}
        <aside className="h-screen sticky top-0 w-64 bg-gray-800 text-white">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Navbar />

          {/* Form Section */}
          <div className="p-10">
            <h1 className="text-2xl font-bold mb-6">Create Subproject</h1>

            {/* Error Message */}
            {error && <p className="text-red-600">{error}</p>}

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
              {/* Title */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={subprojectData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                <textarea
                  name="description"
                  value={subprojectData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Due Date */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={subprojectData.dueDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Status */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
                <select
                  name="status"
                  value={subprojectData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* Members Section */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Add Members</label>
                <div className="flex mb-4">
                  <input
                    type="email"
                    name="newMember"
                    value={subprojectData.newMember || ""}
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
                  {subprojectData.members.map((email, index) => (
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

              {/* Submit Button */}
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Subproject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSubproject;
