import React from 'react';
import axios from 'axios';

const TaskKanban = ({ toDoTasks, inProgressTasks, completedTasks, tasks, setTasks, auth }) => {
  
  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const subtaskId = e.dataTransfer.getData("id");  // Use subtaskId here
  
    if (!subtaskId) return;
  
    const url = `${process.env.REACT_APP_API}/api/task/subtask/status`;
  
    try {
      // Update the subtask status via API
      await axios.patch(
        url,
        { taskId: subtaskId, status: newStatus },  // Send subtaskId and new status
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
  
      // Update the local state to reflect the change
      setTasks((prev) =>
        prev.map((task) =>
          task._id === subtaskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };
  

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("id", taskId);  // Ensure correct taskId is set for drag
  };

  const renderTasks = (tasks) => {
    return tasks.map((task) => (
      <div
        key={task._id}
        className="bg-white p-4 mb-4 rounded-lg shadow-md cursor-grab"
        draggable
        onDragStart={(e) => handleDragStart(e, task._id)}  // Use subtask _id here
      >
        <h3 className="text-lg font-semibold">{task.title}</h3>
        <p className="text-sm text-gray-600">{task.description}</p>
        <p className="text-xs text-gray-500">Due Date: {new Date(task.dueDate).toLocaleDateString()}</p>
      </div>
    ));
  };

  return (
    <div className="flex gap-6 p-6">
      {/* To Do Column */}
      <div
        className="flex-1 p-4 bg-red-100 rounded-lg shadow-md"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, "To Do")}
      >
        <h2 className="text-xl font-semibold text-center mb-4">To Do</h2>
        {toDoTasks.length === 0 ? <div>No tasks</div> : renderTasks(toDoTasks)}
      </div>

      {/* In Progress Column */}
      <div
        className="flex-1 p-4 bg-yellow-100 rounded-lg shadow-md"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, "In Progress")}
      >
        <h2 className="text-xl font-semibold text-center mb-4">In Progress</h2>
        {inProgressTasks.length === 0 ? <div>No tasks</div> : renderTasks(inProgressTasks)}
      </div>

      {/* Completed Column */}
      <div
        className="flex-1 p-4 bg-green-100 rounded-lg shadow-md"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, "Completed")}
      >
        <h2 className="text-xl font-semibold text-center mb-4">Completed</h2>
        {completedTasks.length === 0 ? <div>No tasks</div> : renderTasks(completedTasks)}
      </div>
    </div>
  );
};

export default TaskKanban;
