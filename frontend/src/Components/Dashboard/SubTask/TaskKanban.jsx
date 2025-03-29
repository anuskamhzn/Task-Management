import React, { useState } from "react";
import { FaEllipsisV, FaPlusCircle } from "react-icons/fa";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useParams } from "react-router-dom";
import ModifySubtask from "../../../Pages/User/Modify/SubTaskModify";
import CreateSubtask from "../../../Pages/User/Create/CreateSubtask";
import ViewSubtaskDetail from '../../../Pages/User/Tasks/ViewSubtaskDetail';

const TaskKanban = ({ toDoTasks, inProgressTasks, completedTasks, setTasks, auth }) => {
  const [hoveredTask, setHoveredTask] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const { taskId } = useParams();
  const [selectedSubtask, setSelectedSubtask] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, subTaskId: null, subTaskTitle: '' });

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); // State for ViewProjectDetail popup
  const [viewSubTaskId, setViewSubTaskId] = useState(null); // Track project to view

  // Modal visibility state for CreateTask
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Toggle modal visibility
  const handleCreateSubtaskClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateSubtaskModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleSubtaskCreated = (subTask) => {
    setTasks((prevTasks) => [...prevTasks, subTask.subTask,]); // Add to the top
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const subtaskId = e.dataTransfer.getData("id");

    if (!subtaskId) return;

    const url = `${process.env.REACT_APP_API}/api/task/subtask/status`;

    try {
      await axios.patch(
        url,
        { taskId: subtaskId, status: newStatus },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      setTasks((prev) =>
        prev.map((task) =>
          task._id === subtaskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleModify = (subTaskId) => {
    setSelectedSubtask(subTaskId);
    setOpenMenu(null); // Close dropdown after selecting modify
  };

  const handleCloseModal = () => {
    setSelectedSubtask(null);
  };

  const handleDelete = async (subTaskId) => {
    try {
      const url = `${process.env.REACT_APP_API}/api/task/delete-subtask/${taskId}/${subTaskId}`;
      await axios.delete(url, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== subTaskId));
      toast.success("Subtask deleted successfully!");
    } catch (err) {
      console.error("Error deleting subtask:", err);
      toast.error("There was an error deleting the subtask.");
    }
  };

  const openConfirmDialog = (subTaskId, subTaskTitle) => {
    setConfirmDialog({ isOpen: true, subTaskId, subTaskTitle });
    setOpenMenu(null); // Close dropdown when opening confirm dialog
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, subTaskId: null, subTaskTitle: '' });
  };

  const handleConfirmDelete = () => {
    handleDelete(confirmDialog.subTaskId);
    closeConfirmDialog();
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("id", taskId);
  };

  const renderTasks = (tasks) => {
    return tasks.map((task) => (
      <div
        key={task._id}
        className="relative bg-white p-4 mb-4 rounded-lg shadow-md cursor-grab"
        draggable
        onDragStart={(e) => handleDragStart(e, task._id)}
        onMouseEnter={() => setHoveredTask(task._id)}
        onMouseLeave={() => {
          setHoveredTask(null);
          setOpenMenu(null);
        }}
        onClick={() => handleViewDetail(task._id)}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{task.title}</h3>

          {hoveredTask === task._id && (
            <div className="relative">
              <FaEllipsisV
                className="cursor-pointer"
                onClick={() => setOpenMenu(openMenu === task._id ? null : task._id)}
              />

              {openMenu === task._id && (
                <div
                  className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-md"
                  onMouseEnter={() => setHoveredTask(task._id)}
                  onMouseLeave={() => {
                    setHoveredTask(null);
                    setOpenMenu(null);
                  }}
                >
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => handleModify(task._id)}
                  >
                    Modify
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                    onClick={() => openConfirmDialog(task._id, task.title)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="text-sm text-gray-600">{task.description}</p>
        <p className="text-xs text-gray-500">
          Due Date: {new Date(task.dueDate).toLocaleDateString()}
        </p>
      </div>
    ));
  };

  const handleViewDetail = (subTaskId) => {
    setViewSubTaskId(subTaskId); // Use subproject ID
    setIsDetailModalOpen(true);
    setOpenMenu(null);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false); // Close ViewProjectDetail popup
    setViewSubTaskId(null);
  };

  return (
    <div className="flex gap-6 p-6">
      <div
        className="flex-1 p-4 bg-gray-300 rounded-lg shadow-md"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, "To Do")}
      >
        {/* <h2 className="text-xl font-semibold text-center mb-4">To Do</h2> */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-center mb-4">To Do</h2>
          <div className="relative inline-block">
            <button
              onClick={handleCreateSubtaskClick}
              className="text-2xl text-gray-800 hover:text-gray-600"
            >
              <FaPlusCircle />
            </button>
          </div>
        </div>
        {toDoTasks.length === 0 ? <div>No tasks</div> : renderTasks(toDoTasks)}
      </div>

      <div
        className="flex-1 p-4 bg-yellow-300 rounded-lg shadow-md"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, "In Progress")}
      >
        <h2 className="text-xl font-semibold text-center mb-4">In Progress</h2>
        {inProgressTasks.length === 0 ? <div>No tasks</div> : renderTasks(inProgressTasks)}
      </div>

      <div
        className="flex-1 p-4 bg-green-300 rounded-lg shadow-md"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, "Completed")}
      >
        <h2 className="text-xl font-semibold text-center mb-4">Completed</h2>
        {completedTasks.length === 0 ? <div>No tasks</div> : renderTasks(completedTasks)}
      </div>

      {selectedSubtask && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <ModifySubtask
            auth={auth}
            setTasks={setTasks}
            subTaskId={selectedSubtask}
            onClose={handleCloseModal}
          />
        </div>
      )}

      {/* Custom Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm transform transition-all">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Delete Subtask</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "<span className="font-medium">{confirmDialog.subTaskTitle}</span>"?
              <span className="block text-sm text-red-500 mt-1">This action will move the task to the trash.</span>
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeConfirmDialog}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Creating Task */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <CreateSubtask onClose={handleCloseCreateSubtaskModal} onSubTaskCreated={handleSubtaskCreated} />
        </div>
      )}

      {/* Modal for Viewing Project Details */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <ViewSubtaskDetail
            mainTaskId={taskId} // Main task ID from useParams
            subTaskId={viewSubTaskId} // Subtask ID from clicked card
            onClose={handleCloseDetailModal}
          />
        </div>
      )}
    </div>
  );
};

export default TaskKanban;