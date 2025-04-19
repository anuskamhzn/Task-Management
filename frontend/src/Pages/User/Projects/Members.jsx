import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/auth";
import { useParams } from "react-router-dom";

const Members = ({ onClose }) => {
  const [auth] = useAuth();
  const { projectId } = useParams(); // Get projectId from URL params
  const [subProjects, setSubProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (projectId && auth.token) {
      fetchSubProjects();
    }
  }, [projectId, auth.token]);

  const fetchSubProjects = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/api/project/subproject/${projectId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (response.data && response.data.subProjects) {
        setSubProjects(response.data.subProjects);
      } else {
        setError("No subprojects found for this project.");
      }
    } catch (err) {
      console.error("Error fetching sub-projects:", err);
      setError(err.response?.status === 404 ? "No subprojects found." : "Failed to fetch sub-projects.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
          <p className="text-center text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
          <p className="text-center text-red-500">{error}</p>
          <button
            onClick={onClose}
            className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Subproject Members</h2>
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition"
          >
            Close
          </button>
        </div>
        {subProjects.length > 0 ? (
          subProjects.map((subProject) => (
            <div key={subProject._id} className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-2">{subProject.title}</h3>
              {subProject.members && subProject.members.length > 0 ? (
                <ul className="space-y-4">
                  {subProject.members.map((member) => (
                    <li key={member._id} className="flex items-center gap-4 border-b pb-2">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                        {member.name ? member.name[0].toUpperCase() : "U"}
                      </div>
                      <div>
                        <p className="text-gray-800 font-medium">{member.name || "Unknown"}</p>
                        <p className="text-gray-600 text-sm">{member.email}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No members assigned to this subproject.</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No subprojects available.</p>
        )}
      </div>
    </div>
  );
};

export default Members;