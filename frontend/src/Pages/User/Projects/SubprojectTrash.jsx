import React, { useState, useEffect } from 'react';
import Navbar from "../../../Components/Navigation/Navbar";
import Sidebar from "../../../Components/Navigation/Sidebar";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from '../../../context/auth';

const SubprojectTrash = () => {
  const [projects, setProjects] = useState([]);
  const { mainTaskId } = useParams();
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // Added loading state
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, action: null, projectId: null, projectTitle: '' });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API}/api/project/subproject-trash/${mainTaskId}`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        const data = await response.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching subprojects:', error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [mainTaskId, auth.token]);

  const restoreProject = async (subProjectId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API}/api/project/restore-subproject/${mainTaskId}/${subProjectId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const result = await response.json();
      if (response.ok) {
        setProjects((prevProjects) => prevProjects.filter((project) => project._id !== subProjectId));
        // Removed alert; confirmation dialog is sufficient
      } else {
        console.error('Restore failed:', result.message);
      }
    } catch (error) {
      console.error('Error restoring subproject:', error);
    }
  };

  const deleteProject = async (subProjectId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API}/api/project/pdeleteSubproject/${mainTaskId}/${subProjectId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const result = await response.json();
      if (response.ok) {
        setProjects((prevProjects) => prevProjects.filter((project) => project._id !== subProjectId));
        // Removed alert; confirmation dialog is sufficient
      } else {
        console.error('Delete failed:', result.message);
      }
    } catch (error) {
      console.error('Error deleting subproject:', error);
    }
  };

  const handleConfirm = () => {
    if (confirmDialog.action === 'restore') {
      restoreProject(confirmDialog.projectId);
    } else if (confirmDialog.action === 'delete') {
      deleteProject(confirmDialog.projectId);
    }
    setConfirmDialog({ isOpen: false, action: null, projectId: null, projectTitle: '' });
  };

  const openConfirmDialog = (action, projectId, projectTitle) => {
    setConfirmDialog({ isOpen: true, action, projectId, projectTitle });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, action: null, projectId: null, projectTitle: '' });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Subproject Trash</h1>
            <p className="text-sm text-red-600 mb-6">
              Subprojects in the trash will be permanently deleted after 30 days.
            </p>

            {loading ? (
              <div className="text-center text-gray-500 py-4">Loading...</div>
            ) : projects.length === 0 ? (
              <div className="text-center text-gray-500 py-4 bg-white rounded-lg shadow">
                No deleted subprojects found.
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {projects.map((project) => (
                    <li
                      key={project._id}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
                    >
                      <span className="text-gray-700 truncate flex-1">{project.title}</span>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => openConfirmDialog('restore', project._id, project.title)}
                          className="text-blue-600 hover:text-blue-800 font-medium transition"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => openConfirmDialog('delete', project._id, project.title)}
                          className="text-red-600 hover:text-red-800 font-medium transition"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {confirmDialog.action === 'restore' ? 'Restore Subproject' : 'Delete Subproject Permanently'}
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to {confirmDialog.action === 'restore' ? 'restore' : 'permanently delete'} "
              <span className="font-medium">{confirmDialog.projectTitle}</span>"?
              {confirmDialog.action === 'delete' && (
                <span className="block text-sm text-red-500 mt-1">
                  This action cannot be undone.
                </span>
              )}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeConfirmDialog}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 rounded-md text-white transition ${
                  confirmDialog.action === 'restore'
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {confirmDialog.action === 'restore' ? 'Restore' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubprojectTrash;