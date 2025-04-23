import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../context/auth";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

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

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split("T")[0];

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
            const members = mainProject.members.map((member) => ({
              email: member.email,
              initials: member.initials || member.username?.slice(0, 2).toUpperCase() || "U",
            }));
            setMainProjectMembers(members);
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

  const handleDescriptionChange = (value) => {
    setSubprojectData({ ...subprojectData, description: value });
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
      const newSubproject = {
        ...response.data.subProject,
        members: response.data.subProject.members.map((member) => ({
          ...member,
          initials: member.initials || member.username?.slice(0, 2).toUpperCase() || "U",
        })),
      };
      toast.success("Subproject created successfully!");
      if (onSubProjectCreated) {
        onSubProjectCreated({ subProject: newSubproject });
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Error creating subproject.");
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

  const availableMembers = mainProjectMembers.filter(
    (member) => !subprojectData.members.includes(member.email)
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Create Subproject</h2>
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
              value={subprojectData.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Enter subproject title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <ReactQuill
              value={subprojectData.description}
              onChange={handleDescriptionChange}
              className="bg-white"
              theme="snow"
              modules={quillModules}
              placeholder="Enter subproject description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={subprojectData.dueDate}
              onChange={handleChange}
              min={today}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={subprojectData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Add Members</label>
            <div className="flex mb-4">
              <input
                type="email"
                name="newMember"
                value={subprojectData.newMember || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Select or enter member email"
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              />
              <button
                type="button"
                onClick={handleAddMember}
                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 transition"
              >
                Add
              </button>
            </div>

            {showDropdown && availableMembers.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                {availableMembers.map((member, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm text-gray-700"
                    onMouseDown={() => handleSelectSuggestion(member.email)}
                  >
                    {member.email} ({member.initials})
                  </div>
                ))}
              </div>
            )}

            <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50">
              {subprojectData.members.length === 0 ? (
                <p className="text-gray-500 text-sm">No members added</p>
              ) : (
                subprojectData.members.map((email, index) => (
                  <span
                    key={index}
                    className="flex items-center justify-between bg-blue-100 text-blue-800 py-1 px-3 rounded-md mb-1"
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

          <button
            type="submit"
            className={`w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:opacity-50 transition ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Subproject"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateSubproject;