import React, { useState, useRef, useEffect } from "react";
import { FaPlusCircle, FaEdit, FaTrash, FaList, FaSpinner, FaCheck } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";
import ModifySubtask from "../../../Pages/User/Modify/SubTaskModify";
import CreateSubtask from "../../../Pages/User/Create/CreateSubtask";
import ViewSubtaskDetail from "../../../Pages/User/Tasks/ViewSubtaskDetail";
import parse from 'html-react-parser';

const TaskTableView = ({ tasks, setTasks, auth }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const { taskId } = useParams();
  const [selectedSubtask, setSelectedSubtask] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, subTaskId: null, subTaskTitle: "" });
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewSubTaskId, setViewSubTaskId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const actionButtonRefs = useRef({});

  const handleCreateSubtaskClick = () => setIsCreateModalOpen(true);
  const handleCloseCreateSubtaskModal = () => setIsCreateModalOpen(false);
  const handleSubtaskCreated = (subTask) => setTasks((prev) => [subTask.subTask, ...prev]);

    // Prevent scrolling when modals are open
    useEffect(() => {
      if (isDetailModalOpen || isCreateModalOpen ) {
        document.body.style.overflow = "hidden";
        document.body.style.height = "100vh";
      } else {
        document.body.style.overflow = "auto";
        document.body.style.height = "auto";
      }
      return () => {
        document.body.style.overflow = "auto";
        document.body.style.height = "auto";
      };
    }, [isDetailModalOpen, isCreateModalOpen]);

  const handleStatusChange = async (subTaskId, newStatus) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API}/api/task/subtask/status`,
        { taskId: subTaskId, status: newStatus },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      setTasks((prev) =>
        prev.map((task) => (task._id === subTaskId ? { ...task, status: newStatus } : task))
      );
      toast.success(`Status updated to "${newStatus}"!`);
      setOpenMenu(null);
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status.");
    }
  };

  const handleModify = (subTaskId) => {
    setSelectedSubtask(subTaskId);
    setOpenMenu(null);
  };

  const handleCloseModal = () => setSelectedSubtask(null);

  const handleDelete = async (subTaskId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API}/api/task/delete-subtask/${taskId}/${subTaskId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setTasks((prev) => prev.filter((task) => task._id !== subTaskId));
      toast.success("Subtask deleted!");
    } catch (err) {
      console.error("Error deleting subtask:", err);
      toast.error("Failed to delete subtask.");
    }
  };

  const openConfirmDialog = (subTaskId, subTaskTitle) => {
    setConfirmDialog({ isOpen: true, subTaskId, subTaskTitle });
    setOpenMenu(null);
  };

  const closeConfirmDialog = () => setConfirmDialog({ isOpen: false, subTaskId: null, subTaskTitle: "" });

  const handleConfirmDelete = () => {
    handleDelete(confirmDialog.subTaskId);
    closeConfirmDialog();
  };

  const handleViewDetail = (subTaskId) => {
    setViewSubTaskId(subTaskId);
    setIsDetailModalOpen(true);
    setOpenMenu(null);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setViewSubTaskId(null);
  };

  const handleActionClick = (taskId, e) => {
    const buttonRect = e.target.getBoundingClientRect();
    const menuWidth = 192; // Based on w-48 (48 * 4px = 192px)
    const viewportWidth = window.innerWidth;
    let leftPosition = buttonRect.left + window.scrollX;

    // Adjust left position to prevent overflow
    if (leftPosition + menuWidth > viewportWidth) {
      leftPosition = viewportWidth - menuWidth - 10; // 10px padding from edge
    }

    setMenuPosition({
      top: buttonRect.bottom + window.scrollY + 5, // Position below the button
      left: Math.max(10, leftPosition), // Ensure it doesn't go off the left edge
    });
    setOpenMenu(openMenu === taskId ? null : taskId);
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Task Table</h2>
        <button
          onClick={handleCreateSubtaskClick}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-md"
        >
          <FaPlusCircle /> Add Subtask
        </button>
      </div>
      {tasks && tasks.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md border border-gray-100">
            <thead>
              <tr className="bg-indigo-50 text-gray-700 text-left">
                <th className="py-4 px-6 font-semibold text-sm">Title</th>
                <th className="py-4 px-6 font-semibold text-sm">Description</th>
                <th className="py-4 px-6 font-semibold text-sm">Status</th>
                <th className="py-4 px-6 font-semibold text-sm">Due Date</th>
                <th className="py-4 px-6 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task._id} className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200">
                  <td className="py-4 px-6 text-gray-800 cursor-pointer" onClick={() => handleViewDetail(task._id)}>
                    {task.title}
                  </td>
                  <td className="py-4 px-6 text-gray-600 cursor-pointer" onClick={() => handleViewDetail(task._id)}>
                    <div className="description-content line-clamp-2 relative group">
                      {parse(task.description.substring(0, 50) + (task.description.length > 50 ? "..." : ""))}
                      <div className="absolute hidden  bg-gray-800 text-white text-xs rounded py-1 px-2 z-10 -top-8 left-0">
                        {parse(task.description)}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${task.status === "To Do"
                          ? "bg-gray-100 text-gray-800"
                          : task.status === "In Progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-600">{new Date(task.dueDate).toLocaleDateString()}</td>
                  <td className="py-4 px-6 relative">
                    <button
                      ref={(el) => (actionButtonRefs.current[task._id] = el)}
                      onClick={(e) => handleActionClick(task._id, e)}
                      className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-lg hover:bg-indigo-200 focus:outline-none transition-all duration-300 shadow-sm"
                    >
                      Actions
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-10">No tasks available.</p>
      )}

      {/* Action Options Displayed Outside as a Vertical List */}
      {openMenu && (
        <div
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 w-48"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            boxShadow: "0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)", // Glowing aura effect
          }}
        >
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleModify(openMenu)}
              className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-yellow-50 text-yellow-800 hover:bg-yellow-100 transition-all duration-300"
            >
              <FaEdit className="text-yellow-600" /> Modify
            </button>
            <button
              onClick={() => openConfirmDialog(openMenu, tasks.find((task) => task._id === openMenu).title)}
              className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-800 hover:bg-red-100 transition-all duration-300"
            >
              <FaTrash className="text-red-600" /> Delete
            </button>
            <hr className="my-2 border-gray-200" />
            <button
              onClick={() => handleStatusChange(openMenu, "To Do")}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border border-gray-200 ${tasks.find((task) => task._id === openMenu).status === "To Do"
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-800 hover:bg-gray-50"
                }`}
              disabled={tasks.find((task) => task._id === openMenu).status === "To Do"}
            >
              <FaList className="text-gray-600" /> To Do
            </button>
            <button
              onClick={() => handleStatusChange(openMenu, "In Progress")}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border border-yellow-200 ${tasks.find((task) => task._id === openMenu).status === "In Progress"
                  ? "bg-yellow-200 text-yellow-400 cursor-not-allowed"
                  : "bg-white text-yellow-800 hover:bg-yellow-50"
                }`}
              disabled={tasks.find((task) => task._id === openMenu).status === "In Progress"}
            >
              <FaSpinner className="text-yellow-600" /> In Progress
            </button>
            <button
              onClick={() => handleStatusChange(openMenu, "Completed")}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border border-blue-200 ${tasks.find((task) => task._id === openMenu).status === "Completed"
                  ? "bg-blue-200 text-blue-400 cursor-not-allowed"
                  : "bg-white text-blue-800 hover:bg-blue-50"
                }`}
              disabled={tasks.find((task) => task._id === openMenu).status === "Completed"}
            >
              <FaCheck className="text-blue-600" /> Completed
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedSubtask && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <ModifySubtask auth={auth} setTasks={setTasks} subTaskId={selectedSubtask} onClose={handleCloseModal} />
        </div>
      )}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Delete Subtask</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "<span className="font-medium">{confirmDialog.subTaskTitle}</span>"?
              <span className="block text-sm text-red-500 mt-1">This action will move the task to the trash.</span>
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeConfirmDialog}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {isCreateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <CreateSubtask onClose={handleCloseCreateSubtaskModal} onSubTaskCreated={handleSubtaskCreated} />
        </div>
      )}
      {isDetailModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <ViewSubtaskDetail mainTaskId={taskId} subTaskId={viewSubTaskId} onClose={handleCloseDetailModal} />
        </div>
      )}

      <style jsx>{`
  .description-content ul,
  .description-content ol {
    list-style: disc inside;
    padding-left: 1rem;
    margin: 0.5rem 0;
  }
  .description-content ol {
    list-style: decimal inside;
  }
  .description-content li {
    margin-bottom: 0.25rem;
  }
`}</style>
    </div>
  );
};

export default TaskTableView;