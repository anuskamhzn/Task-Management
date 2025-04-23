import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../context/auth";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import sanitizeHtml from "sanitize-html";

const ModifySubproject = ({ auth, setProjects, subProjectId, onClose }) => {
  const { projectId } = useParams();
  const [subproject, setSubproject] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "",
    members: [],
    newMember: "",
  });
  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split("T")[0];
  const [initialSubproject, setInitialSubproject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [availableMembers, setAvailableMembers] = useState([]);

  useEffect(() => {
    if (auth && auth.user && projectId && subProjectId) {
      fetchSubProject();
      fetchMainProjectMembers();
    }
  }, [auth, projectId, subProjectId]);

    // Prevent scrolling when modal is open
    useEffect(() => {
      document.body.style.overflow = "hidden";
      document.body.style.height = "100vh";
      return () => {
        document.body.style.overflow = "auto";
        document.body.style.height = "auto";
      };
    }, []);

  const fetchSubProject = async () => {
    if (!projectId || !subProjectId) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API}/api/project/subproject/${projectId}/${subProjectId}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      const subProjectData = response.data;
      if (subProjectData) {
        // Sanitize the description to remove Quill artifacts and unwanted tags
        const cleanDescription = sanitizeHtml(subProjectData.description || "", {
          allowedTags: ['h1', 'h2', 'h3', 'p', 'strong', 'em', 'u', 'ul', 'ol', 'li'],
          allowedAttributes: {},
          disallowedTagsMode: 'discard',
        });
        const formattedSubproject = {
          ...subProjectData,
          description: cleanDescription,
          members: subProjectData.members.map((member) => ({
            email: member.email,
            initials: member.initials || member.username?.slice(0, 2).toUpperCase() || "U",
          })),
          dueDate: subProjectData.dueDate ? subProjectData.dueDate.split("T")[0] : "",
          newMember: "",
        };
        setSubproject({
          ...formattedSubproject,
          members: formattedSubproject.members.map((m) => m.email),
        });
        setInitialSubproject({
          ...formattedSubproject,
          members: formattedSubproject.members.map((m) => m.email),
        });
      } else {
        setError("Subproject not found.");
      }
    } catch (err) {
      setError("Failed to fetch subproject.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMainProjectMembers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/project", {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const mainProject = response.data.find((p) => p._id === projectId);
      if (mainProject && mainProject.members) {
        const members = mainProject.members.map((member) => ({
          email: member.email,
          initials: member.initials || member.username?.slice(0, 2).toUpperCase() || "U",
        }));
        setAvailableMembers([...new Set(members.map((m) => m.email))]);
      } else {
        toast.error("Main project not found.");
      }
    } catch (err) {
      console.error("Error fetching main project members:", err);
      toast.error("Failed to fetch project members.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubproject({ ...subproject, [name]: value });
  };

  const handleDescriptionChange = (value) => {

    setSubproject({ ...subproject, description: value });
  };

  const handleAddMember = () => {
    if (subproject.newMember && !subproject.members.includes(subproject.newMember)) {
      setSubproject({
        ...subproject,
        members: [...subproject.members, subproject.newMember],
        newMember: "",
      });
      setShowDropdown(false);
    }
  };

  const handleSelectSuggestion = (email) => {
    setSubproject({
      ...subproject,
      newMember: email,
    });
    setShowDropdown(false);
  };

  const handleRemoveMember = (email) => {
    setSubproject({
      ...subproject,
      members: subproject.members.filter((member) => member !== email),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const addMembers = subproject.members.filter(
        (email) => !initialSubproject.members.includes(email)
      );
      const removeMembers = initialSubproject.members.filter(
        (email) => !subproject.members.includes(email)
      );

      const payload = {
        title: subproject.title,
        description: subproject.description,
        dueDate: subproject.dueDate,
        status: subproject.status,
        addMembers: addMembers.length > 0 ? addMembers : undefined,
        removeMembers: removeMembers.length > 0 ? removeMembers : undefined,
      };

      const url = `${process.env.REACT_APP_API}/api/project/update-subproject/${projectId}/${subProjectId}`;
      const response = await axios.put(url, payload, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      const updatedSubproject = {
        ...response.data.subProject,
        members: response.data.subProject.members.map((member) => ({
          ...member,
          initials: member.initials || member.username?.slice(0, 2).toUpperCase() || "U",
        })),
      };
      setSubproject({
        ...updatedSubproject,
        members: updatedSubproject.members.map((m) => m.email),
        newMember: "",
      });
      setInitialSubproject({
        ...updatedSubproject,
        members: updatedSubproject.members.map((m) => m.email),
      });

      setProjects((prev) =>
        prev.map((project) =>
          project._id === subProjectId ? updatedSubproject : project
        )
      );

      toast.success("Subproject updated successfully!");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating subproject.");
      setSubproject(initialSubproject);
    } finally {
      setLoading(false);
    }
  };

  const membersToShow = availableMembers.filter(
    (email) => !subproject.members.includes(email)
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
        <h2 className="text-xl font-semibold text-gray-800">Edit Subproject</h2>
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
              value={subproject.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Enter subproject title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <ReactQuill
              value={subproject.description || ""}
              onChange={handleDescriptionChange}
              modules={quillModules}
              className="bg-white"
              theme="snow"
              placeholder="Enter project description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={subproject.dueDate}
              onChange={handleChange}
              min={today}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={subproject.status || "To Do"}
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
                value={subproject.newMember}
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
              {subproject.members.length === 0 ? (
                <p className="text-gray-500 text-sm">No members added</p>
              ) : (
                subproject.members.map((email, index) => (
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

export default ModifySubproject;