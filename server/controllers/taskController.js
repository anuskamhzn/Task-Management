const Task = require('../models/Task');
const SubTask = require('../models/SubTask');  
const mongoose = require('mongoose');

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, status } = req.body;

    // Assuming the logged-in user's ID is available in req.user
    const owner = req.user.id; // The user creating the task (owner)

    const newTask = new Task({
      title,
      description,
      owner, // Set the owner to the logged-in user
      dueDate,
      status,
    });

    await newTask.save();
    res.status(201).json({ message: 'Task created successfully', task: newTask });
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
};


// Get all tasks for an individual (owner)
exports.getTasksByOwner = async (req, res) => {
  try {
    const ownerId = req.user.id;  // Get ownerId from the authenticated user's data
    
    // Find tasks where the owner is the logged-in user
    const tasks = await Task.find({ owner: ownerId });

    if (!tasks || tasks.length === 0) {
      // Instead of 404, return 200 with an empty array
      return res.status(200).json([]);  // Empty array when no tasks are found
    }

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
};


// Update task status
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId, status } = req.body;

    const updateTask = await Task.findByIdAndUpdate(
      taskId,
      { status },
      { new: true }
    );

    if (!updateTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task status updated', task: updateTask });
  } catch (error) {
    res.status(500).json({ message: 'Error updating task status', error: error.message });
  } 
};

// Create a subtask for a main task
exports.createSubTask = async (req, res) => {
  try {
    const { title, description, dueDate, status } = req.body;
    const { mainTaskId } = req.params; // Extract mainTaskId from URL
    const owner = req.user.id; // Logged-in user

    // Validate title
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Validate status
    const validStatuses = ["To Do", "In Progress", "Completed"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Validate due date
    if (dueDate && isNaN(Date.parse(dueDate))) {
      return res.status(400).json({ message: "Invalid due date format" });
    }
    if (dueDate && new Date(dueDate) < new Date()) {
      return res.status(400).json({ message: "Due date cannot be in the past" });
    }

    // Check if the main task exists
    const mainTask = await Task.findById(mainTaskId);
    if (!mainTask) {
      return res.status(404).json({ message: "Main task not found" });
    }

    // Create the subtask
    const newSubTask = new SubTask({
      title,
      description,
      dueDate,
      status,
      mainTask: mainTaskId,
      owner,
    });

    await newSubTask.save();
    res.status(201).json({ message: "Subtask created successfully", subTask: newSubTask });
  } catch (error) {
    console.error("Error creating subtask:", error);
    res.status(500).json({ message: "Error creating subtask", error: error.message });
  }
};
// Get all subtasks for a main task
exports.getSubTasksByMainTask = async (req, res) => {
  try {
    const { mainTaskId } = req.params;
    const ownerId = req.user.id; 
    
    const subTasks = await SubTask.find({
      //task: taskId,
      owner: ownerId,
      mainTask: mainTaskId
    });

    if (subTasks.length === 0) {
      return res.status(404).json({ message: 'No subtasks found for this main task' });
    }

    res.status(200).json(subTasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subtasks', error: error.message });
  }
};

// Update main task and subtask statuses
exports.updateSubTaskStatus = async (req, res) => {
  try {
    const { taskId, status } = req.body;

    // Ensure taskId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: 'Invalid taskId' });
    }

    // Find the subtask by its ID and update the status
    const updatedSubTask = await SubTask.findByIdAndUpdate(
      taskId,  // Subtask ID
      { status },  // Update the status field
      { new: true }  // Return the updated subtask
    );

    if (!updatedSubTask) {
      return res.status(404).json({ message: 'Subtask not found' });
    }

    res.status(200).json({ message: 'Subtask status updated', subtask: updatedSubTask });
  } catch (error) {
    console.error(error);  // For debugging purposes
    res.status(500).json({ message: 'Error updating subtask status', error: error.message });
  }
};

