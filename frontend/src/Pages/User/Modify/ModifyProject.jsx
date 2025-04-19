import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/auth";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import sanitizeHtml from "sanitize-html";

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
  const [availableMembers, setAvailableMembers] = useState([]);

  useEffect(() => {
    if (auth && auth.user && projectId) {
      fetchProject();
    }
  }, [auth, projectId]);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/api/project`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const projectData = response.data.find((p) => p._id === projectId);
      if (projectData) {
        // Sanitize description only when fetching
        const cleanDescription = sanitizeHtml(projectData.description || "", {
          allowedTags: ['h1', 'h2', 'h3', 'p', 'strong', 'em', 'u', 'ul', 'ol', 'li'],
          allowedAttributes: {},
          disallowedTagsMode: 'discard',
        });
        setProject({
          ...projectData,
          description: cleanDescription,
          members: projectData.members.map((m) => m.email),
          dueDate: projectData.dueDate ? projectData.dueDate.split("T")[0] : "",
          newMember: "",
        });
        setAvailableMembers([...new Set(projectData.members.map((m) => m.email))]);
      } else {
        setError("Project not found.");
      }
    } catch (err) {
      setError("Error fetching project");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject({ ...project, [name]: value });
  };

  const handleDescriptionChange = (value) => {
    // Store raw HTML from ReactQuill without sanitization
    setProject({ ...project, description: value });
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
      // Sanitize description only when submitting
      const cleanDescription = sanitizeHtml(project.description, {
        allowedTags: ['h1', 'h2', 'h3', 'p', 'strong', 'em', 'u', 'ul', 'ol', 'li'],
        allowedAttributes: {},
        disallowedTagsMode: 'discard',
      });
      const updatedProject = { ...project, description: cleanDescription };

      const url = `${process.env.REACT_APP_API}/api/project/update-project/${projectId}`;
      const response = await axios.put(url, updatedProject, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      if (response.data && response.data.project) {
        setProjects((prevProjects) =>
          prevProjects.map((p) =>
            p._id === projectId ? response.data.project : p
          )
        );
      }

      toast.success("Project updated successfully!");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating project.");
    } finally {
      setLoading(false);
    }
  };

  const membersToShow = availableMembers.filter(
    (email) => !project.members.includes(email)
  );

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
            <ReactQuill
              value={project.description || ""}
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
              value={project.dueDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* <div>
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
          </div> */}

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
                project.members.map((email, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-blue-100 rounded-md p-1 mb-1"
                  >
                    <span className="text-blue-700 text-sm truncate flex-1">{email}</span>
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