const Task = require('../models/Task');
const SubTask = require('../models/SubTask');
const mongoose = require('mongoose');
const { createNotification } = require('../utils/notificationUtils');

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, status } = req.body;

    // Validate input
    if (!title || !description || !dueDate) {
      return res.status(400).json({ message: 'Title, description, and due date are required.' });
    }

    // Assuming the logged-in user's ID is available in req.user
    const owner = req.user.id; // The user creating the task (owner)

    const newTask = new Task({
      title,
      description, // Store HTML description from rich text editor
      owner, // Set the owner to the logged-in user
      dueDate,
      status,
    });

    await newTask.save();
    // Create DUE_DATE_TASK notification for the owner
    await createNotification(
      owner,
      'CREATE_TASK',
      `The task "${title}" is created and due on ${new Date(dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`,
      newTask._id,
      'Task',
      dueDate,
      req.app.get('io')
    );
    res.status(201).json({ message: 'Task created successfully', task: { ...newTask.toObject(), description } });
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
};
// Get all tasks for an individual (owner) excluding soft-deleted ones
exports.getTasksByOwner = async (req, res) => {
  try {
    const ownerId = req.user.id;  // Get ownerId from the authenticated user's data

    // Find tasks where the owner is the logged-in user and deletedAt is either not set or null
    const tasks = await Task.find({
      owner: ownerId,
      $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
    }).lean();

    // Ensure description is returned as-is (HTML content)
    const formattedTasks = tasks.map(task => ({
      ...task,
      description: task.description,
      isOverdue: task.isOverdue || (new Date(task.dueDate) < new Date() && task.status !== 'Completed'),
    }));

    res.status(200).json(formattedTasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
};

// Update task status
// Update task status
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId, status } = req.body;

    // Prepare update object
    const updateFields = { status };
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (status === 'Completed') {
      updateFields.isOverdue = false; // Reset isOverdue when task is completed
    } else if (new Date(task.dueDate) < new Date()) {
      updateFields.isOverdue = true; // Set isOverdue to true if dueDate is in the past and status is not Completed
    }

    const updateTask = await Task.findByIdAndUpdate(
      taskId,
      { $set: updateFields },
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

// Delete a main task and its associated subtasks
exports.deleteTaskPermananet = async (req, res) => {
  try {
    const { mainTaskId } = req.params; // Get mainTaskId from the URL
    const ownerId = req.user.id;  // Get the authenticated user's ID

    // Find the main task
    const mainTask = await Task.findOne({ _id: mainTaskId, owner: ownerId });

    if (!mainTask) {
      return res.status(404).json({ message: 'Main task not found or you do not have permission to delete it' });
    }

    // Soft delete the associated subtasks
    await SubTask.deleteMany({ mainTask: mainTaskId });

    // Soft delete the main task
    await Task.deleteOne({ _id: mainTaskId });

    res.status(200).json({ message: 'Main task and its subtasks moved to trash' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting main task and its subtasks', error: error.message });
  }
};

// Soft delete a main task and its associated subtasks
exports.deleteTask = async (req, res) => {
  try {
    const { mainTaskId } = req.params; // Get mainTaskId from the URL
    const ownerId = req.user.id;  // Get the authenticated user's ID

    // Find the main task
    const mainTask = await Task.findOne({ _id: mainTaskId, owner: ownerId });

    if (!mainTask) {
      return res.status(404).json({ message: 'Main task not found or you do not have permission to delete it' });
    }

    // Soft delete the associated subtasks
    await SubTask.updateMany({ mainTask: mainTaskId }, { $set: { deletedAt: Date.now() } });

    // Soft delete the main task
    await Task.updateOne({ _id: mainTaskId }, { $set: { deletedAt: Date.now() } });

    res.status(200).json({ message: 'Main task and its subtasks moved to trash' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting main task and its subtasks', error: error.message });
  }
};

// Fetch all soft-deleted tasks (main tasks)
exports.getSoftDeletedTasks = async (req, res) => {
  try {
    const ownerId = req.user.id; // Get the authenticated user's ID

    // Query to fetch tasks where 'deletedAt' exists and is not null
    const query = {
      owner: ownerId,
      deletedAt: { $ne: null, $exists: true },
    };

    // Fetch tasks that match the query
    const deletedTasks = await Task.find(query);

    if (deletedTasks.length === 0) {
      return res.status(404).json({ message: 'Tasks not found' });
    }

    // Return the deleted tasks in the response
    res.status(200).json({ deletedTasks });
  } catch (error) {
    console.error('Error fetching soft-deleted tasks:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Restore a soft-deleted main task and its subtasks
exports.restoreTask = async (req, res) => {
  try {
    const { mainTaskId } = req.params;
    const ownerId = req.user.id;

    // Find the soft-deleted main task
    const mainTask = await Task.findOne({ _id: mainTaskId, owner: ownerId, deletedAt: { $ne: null } });

    if (!mainTask) {
      return res.status(404).json({ message: 'Task not found or already active' });
    }

    // Restore the main task
    await Task.updateOne({ _id: mainTaskId }, { $set: { deletedAt: null } });

    // Restore associated subtasks
    await SubTask.updateMany({ mainTask: mainTaskId }, { $set: { deletedAt: null } });

    res.status(200).json({ message: 'Task and subtasks restored successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error restoring task and subtasks', error: error.message });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const taskId = req.params.taskId; // Get task ID from URL parameters
    const { title, description, dueDate, status } = req.body; // Get updated task data from request body
    const ownerId = req.user.id; // Get ownerId from the authenticated user's data

    // Find the task by ID and ensure the task belongs to the logged-in user
    const task = await Task.findOne({ _id: taskId, owner: ownerId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or you do not have permission to update it' });
    }

    // Store the original dueDate for comparison
    const originalDueDate = task.dueDate;

    // Update task fields only if provided
    task.title = title ?? task.title;
    task.description = description ?? task.description; // Store HTML description from rich text editor
    task.dueDate = dueDate ?? task.dueDate;
    task.status = status ?? task.status;

    // Update isOverdue based on new dueDate and status
    if (dueDate || status) {
      if (task.status === 'Completed') {
        task.isOverdue = false; // Reset isOverdue if task is completed
      } else if (task.dueDate) {
        task.isOverdue = new Date(task.dueDate) < new Date(); // Set isOverdue based on dueDate
      }
    }

    // Send notification if dueDate changed
    if (dueDate && new Date(dueDate).getTime() !== new Date(originalDueDate).getTime()) {
      await createNotification(
        ownerId,
        'DUE_DATE_TASK',
        `The task "${task.title}" due date has been updated to ${new Date(dueDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}`,
        task._id,
        'Task',
        dueDate,
        req.app.get('io')
      );
    }

    // Save the updated task
    await task.save();

    res.status(200).json({ message: 'Task updated successfully', task: { ...task.toObject(), description } });
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
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

    // Validate sub-task due date does not exceed main task due date
    if (dueDate && mainTask.dueDate && new Date(dueDate) > new Date(mainTask.dueDate)) {
      return res.status(400).json({
        message: `Sub-task due date (${new Date(dueDate).toLocaleDateString()}) cannot be after the main task due date (${new Date(mainTask.dueDate).toLocaleDateString()})`
      });
    }

    // Create the subtask
    const newSubTask = new SubTask({
      title,
      description, // Store HTML description from rich text editor
      dueDate,
      status,
      mainTask: mainTaskId,
      owner,
    });

    await newSubTask.save();
    // Add the new subtask to the parent task's subTasks array
    mainTask.subTasks.push(newSubTask._id);
    await mainTask.save();
    // Create DUE_DATE_TASK notification for the owner
    await createNotification(
      owner,
      'CREATE_SUBTASK',
      `The sub task "${title}" is created and due on ${new Date(dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`,
      newSubTask._id,
      'SubTask',
      dueDate,
      req.app.get('io')
    );
    res.status(201).json({ message: "Subtask created successfully", subTask: { ...newSubTask.toObject(), description } });
  } catch (error) {
    console.error("Error creating subtask:", error);
    res.status(500).json({ message: "Error creating subtask", error: error.message });
  }
};

// Get all subtasks for a main task excluding soft-deleted ones
exports.getSubTasksByMainTask = async (req, res) => {
  try {
    const { mainTaskId } = req.params;
    const ownerId = req.user.id;

    const subTasks = await SubTask.find({
      owner: ownerId,
      mainTask: mainTaskId,
      deletedAt: null, // Exclude soft-deleted subtasks
    }).lean();

    // Ensure description is returned as-is (HTML content)
    const formattedSubTasks = subTasks.map(subTask => ({
      ...subTask,
      description: subTask.description, // Preserve HTML content
      isOverdue: subTask.isOverdue || (new Date(subTask.dueDate) < new Date() && subTask.status !== 'Completed'),
    }));

    if (formattedSubTasks.length === 0) {
      return res.status(200).json([]); // Return an empty array instead of 404
    }

    res.status(200).json(formattedSubTasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subtasks', error: error.message });
  }
};

// Update main task and subtask statuses
// Update main task and subtask statuses
exports.updateSubTaskStatus = async (req, res) => {
  try {
    const { taskId, status } = req.body;

    // Ensure taskId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: 'Invalid taskId' });
    }

    // Prepare update object
    const subTask = await SubTask.findById(taskId);
    if (!subTask) {
      return res.status(404).json({ message: 'Subtask not found' });
    }

    const updateFields = { status };
    if (status === 'Completed') {
      updateFields.isOverdue = false; // Reset isOverdue when subtask is completed
    } else if (new Date(subTask.dueDate) < new Date()) {
      updateFields.isOverdue = true; // Set isOverdue to true if dueDate is in the past and status is not Completed
    }

    // Find the subtask by its ID and update the status
    const updatedSubTask = await SubTask.findByIdAndUpdate(
      taskId,  // Subtask ID
      { $set: updateFields },  // Update the status and isOverdue fields
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

// Delete a subtask for a main task
exports.deleteSubTaskPermananet = async (req, res) => {
  try {
    const { mainTaskId, subTaskId } = req.params; // Get both mainTaskId and subTaskId from the URL
    const ownerId = req.user.id; // Get the authenticated user's ID

    // Check if the subtask exists and belongs to the logged-in user and the main task
    const subTask = await SubTask.findOne({ _id: subTaskId, mainTask: mainTaskId, owner: ownerId });

    if (!subTask) {
      return res.status(404).json({ message: 'Subtask not found or you do not have permission to delete it' });
    }

    // Soft delete: Set deletedAt to the current timestamp
    await SubTask.deleteOne({ _id: subTaskId });

    res.status(200).json({ message: 'Subtask deleted', subTask });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting subtask', error: error.message });
  }
};

// Soft delete a subtask for a main task
exports.deleteSubTask = async (req, res) => {
  try {
    const { mainTaskId, subTaskId } = req.params; // Get both mainTaskId and subTaskId from the URL
    const ownerId = req.user.id; // Get the authenticated user's ID

    // Check if the subtask exists and belongs to the logged-in user and the main task
    const subTask = await SubTask.findOne({ _id: subTaskId, mainTask: mainTaskId, owner: ownerId });

    if (!subTask) {
      return res.status(404).json({ message: 'Subtask not found or you do not have permission to delete it' });
    }

    // Soft delete: Set deletedAt to the current timestamp
    subTask.deletedAt = new Date();
    await subTask.save();

    res.status(200).json({ message: 'Subtask moved to trash', subTask });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting subtask', error: error.message });
  }
};

exports.restoreSubTask = async (req, res) => {
  try {
    const { subTaskId } = req.params;

    const subTask = await SubTask.findByIdAndUpdate(
      subTaskId,
      { deletedAt: null },
      { new: true }
    );

    if (!subTask) {
      return res.status(404).json({ message: 'Subtask not found' });
    }

    res.status(200).json({ message: 'Subtask restored successfully', subTask });
  } catch (error) {
    res.status(500).json({ message: 'Error restoring subtask', error: error.message });
  }
};

// Get all deleted subtasks for a specific main task
exports.getDeletedSubTasks = async (req, res) => {
  try {
    const { mainTaskId } = req.params;
    const ownerId = req.user.id; // Assuming you're using user authentication

    const deletedSubTasks = await SubTask.find({
      owner: ownerId,
      mainTask: mainTaskId,
      deletedAt: { $ne: null }, // Fetch subtasks where deletedAt is not null (soft-deleted)
    });

    if (deletedSubTasks.length === 0) {
      return res.status(200).json([]); // Return an empty array if no deleted subtasks are found
    }

    res.status(200).json(deletedSubTasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching deleted subtasks', error: error.message });
  }
};

// Update a subtask for a main task
exports.updateSubTask = async (req, res) => {
  try {
    const { mainTaskId, subTaskId } = req.params; // Get mainTaskId and subTaskId from URL parameters
    const { title, description, dueDate, status } = req.body;  // Get updated task data from request body
    const ownerId = req.user.id;  // Get ownerId from the authenticated user's data

    const query = {
      _id: subTaskId,  // If using `id` field
      mainTask: mainTaskId,
      owner: ownerId,
    };

    // Check if the subtask exists and belongs to the logged-in user and the main task
    const subTask = await SubTask.findOne(query);

    if (!subTask) {
      return res.status(404).json({ message: 'Subtask not found or you do not have permission to update it' });
    }

    // Check if the main task exists
    const mainTask = await Task.findById(mainTaskId);
    if (!mainTask) {
      return res.status(404).json({ message: "Main task not found" });
    }

    // Validate sub-task due date does not exceed main task due date
    if (dueDate && mainTask.dueDate && new Date(dueDate) > new Date(mainTask.dueDate)) {
      return res.status(400).json({
        message: `Sub-task due date (${new Date(dueDate).toLocaleDateString()}) cannot be after the main task due date (${new Date(mainTask.dueDate).toLocaleDateString()})`
      });
    }

    // Store the original dueDate for comparison
    const originalDueDate = subTask.dueDate;

    // Update subtask fields only if the fields are provided
    subTask.title = title || subTask.title;
    subTask.description = description || subTask.description; // Store HTML description from rich text editor
    subTask.dueDate = dueDate || subTask.dueDate;
    subTask.status = status || subTask.status;

    // Update isOverdue based on new dueDate and status
    if (dueDate || status) {
      if (subTask.status === 'Completed') {
        subTask.isOverdue = false; // Reset isOverdue if subtask is completed
      } else if (subTask.dueDate) {
        subTask.isOverdue = new Date(subTask.dueDate) < new Date(); // Set isOverdue based on dueDate
      }
    }

    // Send notification if dueDate changed
    if (dueDate && new Date(dueDate).getTime() !== new Date(originalDueDate).getTime()) {
      await createNotification(
        ownerId,
        'DUE_DATE_SUBTASK',
        `The sub task "${subTask.title}" due date has been updated to ${new Date(dueDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}`,
        subTask._id,
        'SubTask',
        dueDate,
        req.app.get('io')
      );
    }

    // Save the updated subtask
    await subTask.save();

    res.status(200).json({ message: 'Subtask updated successfully', subTask: { ...subTask.toObject(), description } });
  } catch (error) {
    res.status(500).json({ message: 'Error updating subtask', error: error.message });
  }
};

// Get a specific task by ID
exports.getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params; // Get taskId from URL parameters
    const ownerId = req.user.id;   // Get the authenticated user's ID

    // Find the task by ID, ensuring it belongs to the owner and is not soft-deleted
    const task = await Task.findOne({
      _id: taskId,
      owner: ownerId,
      $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
    })
      .populate('owner', 'name email initials')
      .lean();

    if (!task) {
      return res.status(404).json({
        message: 'Task not found or you do not have permission to access it'
      });
    }

    // Ensure description is returned as-is (HTML content)
    const formattedTask = {
      ...task,
      description: task.description, // Preserve HTML content
      isOverdue: task.isOverdue || (new Date(task.dueDate) < new Date() && task.status !== 'Completed'),
    };

    res.status(200).json(formattedTask);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching task',
      error: error.message
    });
  }
};

//get the sub task by main id and id
exports.getSubtaskById = async (req, res) => {
  const { mainTaskId, subTaskId } = req.params;

  try {
    const mainTask = await Task.findById(mainTaskId);
    if (!mainTask) {
      return res.status(404).json({ message: "Main task not found" });
    }
    // Fetch the subtask and populate the referenced fields (mainTask, owner)
    const subtask = await SubTask.findById(subTaskId)
      .populate('mainTask')  // Populating the mainTask reference (Task model)
      .populate('owner', 'name email initials')
      .lean();

    if (!subtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    // Ensure description is returned as-is (HTML content)
    const formattedSubtask = {
      ...subtask,
      description: subtask.description, // Preserve HTML content
      isOverdue: subtask.isOverdue || (new Date(subtask.dueDate) < new Date() && subtask.status !== 'Completed'),
    };

    res.json(formattedSubtask);
  } catch (error) {
    console.error("Error fetching subtask:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get task status counts using aggregation
exports.getTaskStatusCountsWithAggregation = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const statusCounts = await Task.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(ownerId),
          $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    let totalTasks = 0;
    let counts = { toDo: 0, inProgress: 0, completed: 0 };

    statusCounts.forEach((group) => {
      totalTasks += group.count;
      switch (group._id) {
        case "To Do":
          counts.toDo = group.count;
          break;
        case "In Progress":
          counts.inProgress = group.count;
          break;
        case "Completed":
          counts.completed = group.count;
          break;
      }
    });

    res.status(200).json({
      message: "Task status counts retrieved successfully",
      statusCounts: { totalTasks, ...counts },
    });
  } catch (error) {
    console.error("Error fetching task status counts:", error);
    res.status(500).json({
      message: "Error fetching task status counts",
      error: error.message,
    });
  }
};

// Get detailed task analytics for the logged-in user
exports.getTaskAnalytics = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const currentDate = new Date();

    // Aggregation for task statistics
    const taskStats = await Task.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(ownerId),
          $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
        },
      },
      {
        $facet: {
          // Status counts
          statusCounts: [
            { $group: { _id: "$status", count: { $sum: 1 } } },
          ],
          // Overdue tasks
          overdueTasks: [
            {
              $match: {
                dueDate: { $lt: currentDate },
                status: { $ne: "Completed" },
              },
            },
            { $count: "overdueCount" },
          ],
          // Total tasks
          totalTasks: [
            { $count: "totalCount" },
          ],
          // Subtask completion stats
          subTaskStats: [
            {
              $lookup: {
                from: "subtasks",
                localField: "_id",
                foreignField: "mainTask",
                as: "subTasks",
              },
            },
            { $unwind: { path: "$subTasks", preserveNullAndEmptyArrays: true } },
            {
              $group: {
                _id: null,
                totalSubTasks: { $sum: 1 },
                completedSubTasks: {
                  $sum: {
                    $cond: [{ $eq: ["$subTasks.status", "Completed"] }, 1, 0],
                  },
                },
              },
            },
          ],
        },
      },
    ]);

    // Process the results
    const statusCounts = { toDo: 0, inProgress: 0, completed: 0 };
    taskStats[0].statusCounts.forEach((group) => {
      switch (group._id) {
        case "To Do":
          statusCounts.toDo = group.count;
          break;
        case "In Progress":
          statusCounts.inProgress = group.count;
          break;
        case "Completed":
          statusCounts.completed = group.count;
          break;
      }
    });

    const totalTasks = taskStats[0].totalTasks[0]?.totalCount || 0;
    const overdueTasks = taskStats[0].overdueTasks[0]?.overdueCount || 0;
    const totalSubTasks = taskStats[0].subTaskStats[0]?.totalSubTasks || 0;
    const completedSubTasks = taskStats[0].subTaskStats[0]?.completedSubTasks || 0;

    const completionRate = totalTasks > 0 ? (statusCounts.completed / totalTasks) * 100 : 0;
    const subTaskCompletionRate = totalSubTasks > 0 ? (completedSubTasks / totalSubTasks) * 100 : 0;

    // Response
    res.status(200).json({
      message: "Task analytics retrieved successfully",
      analytics: {
        totalTasks,
        statusCounts,
        overdueTasks,
        completionRate: completionRate.toFixed(2) + "%",
        subTaskStats: {
          totalSubTasks,
          completedSubTasks,
          subTaskCompletionRate: subTaskCompletionRate.toFixed(2) + "%",
        },
      },
    });
  } catch (error) {
    console.error("Error fetching task analytics:", error);
    res.status(500).json({
      message: "Error fetching task analytics",
      error: error.message,
    });
  }
};

// In taskController.js
exports.getSubTaskStatusCounts = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { mainTaskId } = req.params; // Get mainTaskId from URL parameters

    // Validate mainTaskId
    if (!mongoose.Types.ObjectId.isValid(mainTaskId)) {
      return res.status(400).json({ message: 'Invalid mainTaskId' });
    }

    // Check if the main task exists and belongs to the user
    const mainTask = await Task.findOne({ _id: mainTaskId, owner: ownerId });
    if (!mainTask) {
      return res.status(404).json({ message: 'Main task not found or you do not have permission to access it' });
    }

    const subTaskStats = await SubTask.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(ownerId),
          mainTask: new mongoose.Types.ObjectId(mainTaskId),
          $or: [
            { deletedAt: null },
            { deletedAt: { $exists: false } }
          ]
        },
      },
      {
        $facet: {
          statusCounts: [
            { $group: { _id: "$status", count: { $sum: 1 } } },
          ],
          overdueSubTasks: [
            { $match: { isOverdue: true } },
            { $count: "overdueCount" },
          ],
        },
      },
    ]);

    let totalSubTasks = 0;
    let counts = { toDo: 0, inProgress: 0, completed: 0 };

    subTaskStats[0].statusCounts.forEach((group) => {
      totalSubTasks += group.count;
      switch (group._id) {
        case "To Do":
          counts.toDo = group.count;
          break;
        case "In Progress":
          counts.inProgress = group.count;
          break;
        case "Completed":
          counts.completed = group.count;
          break;
      }
    });

    const overdueSubTasks = subTaskStats[0].overdueSubTasks[0]?.overdueCount || 0;

    res.status(200).json({
      message: "Subtask status counts retrieved successfully",
      statusCounts: {
        totalSubTasks,
        toDo: counts.toDo,
        inProgress: counts.inProgress,
        completed: counts.completed,
        overdueSubTasks,
      },
    });
  } catch (error) {
    console.error("Error fetching subtask status counts:", error);
    res.status(500).json({
      message: "Error fetching subtask status counts",
      error: error.message,
    });
  }
};