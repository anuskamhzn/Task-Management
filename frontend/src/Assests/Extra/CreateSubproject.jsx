import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../context/auth";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const CreateSubproject = ({ onClose, onSubProjectCreated }) => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mainProjectMembers, setMainProjectMembers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [subprojectData, setSubprojectData] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "To Do",
    members: [],
    newMember: "",
  });

  // Fetch main project members
  useEffect(() => {
    if (auth && auth.token) {
      const fetchMainProjectMembers = async () => {
        try {
          const response = await axios.get("http://localhost:5000/api/project", {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          });
          const mainProject = response.data.find((p) => p._id === projectId);
          if (mainProject && mainProject.members) {
            const memberEmails = mainProject.members.map((member) => member.email);
            setMainProjectMembers(memberEmails);
          } else {
            toast.error("Main project not found.");
          }
        } catch (err) {
          console.error("Error fetching main project members:", err);
          toast.error("Failed to fetch project members.");
        }
      };
      fetchMainProjectMembers();
    } else {
      toast.error("You must be logged in to create a subproject.");
    }
  }, [auth, projectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubprojectData({ ...subprojectData, [name]: value });
  };

  const handleAddMember = () => {
    if (subprojectData.newMember && !subprojectData.members.includes(subprojectData.newMember)) {
      setSubprojectData({
        ...subprojectData,
        members: [...subprojectData.members, subprojectData.newMember],
        newMember: "",
      });
      setShowDropdown(false);
    }
  };

  const handleRemoveMember = (email) => {
    setSubprojectData({
      ...subprojectData,
      members: subprojectData.members.filter((member) => member !== email),
    });
  };

  const handleSelectSuggestion = (email) => {
    setSubprojectData({
      ...subprojectData,
      newMember: email,
    });
    setShowDropdown(false);
  };

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
        { ...subprojectData, owner: auth.user.id },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      toast.success("Subproject created successfully!");
      if (onSubProjectCreated) {
        onSubProjectCreated(response.data);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Error creating subproject.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // List all available members (not already added)
  const availableMembers = mainProjectMembers.filter(
    (email) => !subprojectData.members.includes(email)
  );

  return (
    <div>
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
        {/* Modal Container with Scroll */}
        <div className="bg-white p-8 rounded-lg shadow-lg w-96 relative max-h-[90vh] overflow-y-auto">
          {/* Close Button (X) */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-xl text-gray-600 hover:text-gray-800"
          >
            ×
          </button>

          {/* Form Section */}
          <h1 className="text-2xl font-bold mb-6">Create Subproject</h1>

          {/* Error Message */}
          {error && <p className="text-red-600">{error}</p>}

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={subprojectData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
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
                className="w-full px-3 py-2 border rounded-lg h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                required
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
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            {/* Status */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
              <select
                name="status"
                value={subprojectData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Members Section */}
            <div className="mb-4 relative">
              <label className="block text-gray-700 text-sm font-bold mb-2">Add Members</label>
              <div className="flex mb-4">
                <input
                  type="email"
                  name="newMember"
                  value={subprojectData.newMember || ""}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Select or enter member email"
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                />
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  Add
                </button>
              </div>

              {/* Email Suggestions Dropdown */}
              {showDropdown && availableMembers.length > 0 && (
                <div className="absolute z-10 w-full max-w-[calc(100%-80px)] bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {availableMembers.map((email, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm text-gray-700"
                      onMouseDown={() => handleSelectSuggestion(email)}
                    >
                      {email}
                    </div>
                  ))}
                </div>
              )}

              {/* Scrollable Members List */}
              <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50">
                {subprojectData.members.length === 0 ? (
                  <p className="text-gray-500 text-sm">No members added</p>
                ) : (
                  subprojectData.members.map((email, index) => (
                    <span
                      key={index}
                      className="flex items-center justify-between bg-blue-200 text-blue-700 py-1 px-3 rounded-md mb-1"
                    >
                      <span className="truncate flex-1">{email}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(email)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Subproject"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSubproject;