import React, { useState } from "react";
import { FaEllipsisV } from "react-icons/fa";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useParams } from "react-router-dom";
import ModifySubtask from "../../../Pages/User/Modify/SubTaskModify";

const TaskKanban = ({ toDoTasks, inProgressTasks, completedTasks, setTasks, auth }) => {
  const [hoveredTask, setHoveredTask] = useState(null); // Track hovered task
  const [openMenu, setOpenMenu] = useState(null); // Track open menu
  const { taskId } = useParams(); // Get the main task ID from the route params
  const [selectedSubtask, setSelectedSubtask] = useState(null); // Track selected subtask

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
    console.log("Modify task:", subTaskId);
    // Implement modify logic
    setSelectedSubtask(subTaskId); // Open modal with subtask ID
  };

  const handleCloseModal = () => {
    setSelectedSubtask(null); // Close modal
  };

  const handleDelete = async (subTaskId) => {

    // Confirmation dialog
    const confirmDelete = window.confirm("Are you sure you want to delete this subtask?");

    if (!confirmDelete) {
      return; // If the user cancels the delete, do nothing
    }


    // Assuming mainTaskId is now passed correctly, we use it dynamically
    try {
      // Make the DELETE request to the backend API
      const url = `${process.env.REACT_APP_API}/api/task/delete-subtask/${taskId}/${subTaskId}`;

      await axios.delete(url, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      // Update the tasks list by removing the deleted subtask
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== subTaskId));

      // Show a success toast notification
      toast.success("Subtask deleted successfully!");
    } catch (err) {
      console.error("Error deleting subtask:", err);
      toast.error("There was an error deleting the subtask.");
    }
  };


  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("id", taskId);  // Ensure correct taskId is set for drag
  };

  const renderTasks = (tasks) => {
    return tasks.map((task) => (
      <div
        key={task._id}
        className="relative bg-white p-4 mb-4 rounded-lg shadow-md cursor-grab"
        draggable
        onDragStart={(e) => handleDragStart(e, task._id)}  // Use subtask _id here
        onMouseEnter={() => setHoveredTask(task._id)} // Show menu when hovering
        onMouseLeave={() => {
          setHoveredTask(null); // Hide menu when not hovering
          setOpenMenu(null); // Close options menu as well
        }}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{task.title}</h3>

          {/* Three Dots Icon - Only show on hover */}
          {hoveredTask === task._id && (
            <div className="relative">
              <FaEllipsisV
                className="cursor-pointer"
                onClick={() => setOpenMenu(openMenu === task._id ? null : task._id)}
              />

              {/* Dropdown Menu */}
              {openMenu === task._id && (
                <div
                  className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-md"
                  onMouseEnter={() => setHoveredTask(task._id)} // Keep open on hover
                  onMouseLeave={() => {
                    setHoveredTask(null); // Hide if mouse leaves
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
                    onClick={() => handleDelete(task._id)}
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

  return (
    <div className="flex gap-6 p-6">
      {/* To Do Column */}
      <div
        className="flex-1 p-4 bg-gray-300 rounded-lg shadow-md"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, "To Do")}
      >
        <h2 className="text-xl font-semibold text-center mb-4">To Do</h2>
        {toDoTasks.length === 0 ? <div>No tasks</div> : renderTasks(toDoTasks)}
      </div>

      {/* In Progress Column */}
      <div
        className="flex-1 p-4 bg-yellow-300 rounded-lg shadow-md"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, "In Progress")}
      >
        <h2 className="text-xl font-semibold text-center mb-4">In Progress</h2>
        {inProgressTasks.length === 0 ? <div>No tasks</div> : renderTasks(inProgressTasks)}
      </div>

      {/* Completed Column */}
      <div
        className="flex-1 p-4 bg-green-300 rounded-lg shadow-md"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, "Completed")}
      >
        <h2 className="text-xl font-semibold text-center mb-4">Completed</h2>
        {completedTasks.length === 0 ? <div>No tasks</div> : renderTasks(completedTasks)}
      </div>
      {/* Modal for Modifying Subtask */}
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

    </div>
  );
};

export default TaskKanban;
