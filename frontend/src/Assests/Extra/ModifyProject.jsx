import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/auth";

const ModifyProject = ({ auth, setProjects, projectId, onClose }) => {
  const [project, setProject] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "",
    members: [],
    newMember: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [availableMembers, setAvailableMembers] = useState([]); // Store fetched members

  // Fetch project details and available members
  useEffect(() => {
    if (auth && auth.user && projectId) {
      fetchProjects();
    }
  }, [auth, projectId]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/project`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const projectData = response.data.find((p) => p._id === projectId);
      if (projectData) {
        setProject({
          ...projectData,
          members: projectData.members.map((member) => member.email || member),
          newMember: "",
        });
        // Set available members (all members from response, to allow re-adding removed ones)
        const memberEmails = response.data
          .filter((p) => p._id === projectId)
          .flatMap((p) => p.members.map((m) => m.email));
        setAvailableMembers([...new Set(memberEmails)]);
      } else {
        setError("Project not found.");
      }
    } catch (err) {
      setError("Error fetching projects");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject({ ...project, [name]: value });
  };

  const handleAddMember = () => {
    if (project.newMember && !project.members.includes(project.newMember)) {
      setProject({
        ...project,
        members: [...project.members, project.newMember],
        newMember: "",
      });
      setShowDropdown(false);
    }
  };

  const handleSelectSuggestion = (email) => {
    setProject({
      ...project,
      newMember: email,
    });
    setShowDropdown(false);
  };

  const handleRemoveMember = (email) => {
    setProject({
      ...project,
      members: project.members.filter((member) => member !== email),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = `${process.env.REACT_APP_API}/api/project/update-project/${projectId}`;
      const response = await axios.put(url, project, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      if (response.data && response.data.project) {
        setProjects((prevProjects) =>
          prevProjects.map((p) =>
            p._id === projectId ? { ...p, ...response.data.project } : p
          )
        );
      }

      toast.success("Project updated successfully!");
      onClose();
    } catch (err) {
      toast.error("Error updating Project.");
    } finally {
      setLoading(false);
    }
  };

  // List available members (not already added)
  const membersToShow = availableMembers.filter(
    (email) => !project.members.includes(email)
  );

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Edit Project</h2>
        <button
          className="text-gray-500 hover:text-gray-700 text-xl font-medium"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-4">Loading...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={project.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Enter project title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={project.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
              placeholder="Enter description"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={project.dueDate ? project.dueDate.split("T")[0] : ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={project.status || "To Do"}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Members</label>
            <div className="flex gap-2 mb-2">
              <input
                type="email"
                name="newMember"
                value={project.newMember}
                onChange={handleChange}
                className="flex-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Select or enter member email"
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              />
              <button
                type="button"
                onClick={handleAddMember}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              >
                Add
              </button>
            </div>

            {/* Dropdown for email suggestions */}
            {showDropdown && membersToShow.length > 0 && (
              <div className="absolute z-10 w-full max-w-[calc(100%-80px)] bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                {membersToShow.map((email, index) => (
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

            <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50">
              {project.members.length === 0 ? (
                <p className="text-gray-500 text-sm">No members added</p>
              ) : (
                project.members.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-blue-100 rounded-md p-1 mb-1"
                  >
                    <span className="text-blue-700 text-sm truncate flex-1">
                      {typeof member === "string" ? member : member.email}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.email || member)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:opacity-50 transition"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ModifyProject;