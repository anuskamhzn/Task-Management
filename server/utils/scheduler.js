const cron = require('node-cron');
const Task = require('../models/Task');
const SubTask = require('../models/SubTask');
const Project = require('../models/Project');
const SubProject = require('../models/SubProject');
const Notification = require('../models/Notifications');
const { createNotification } = require('./notificationUtils');

// Function to check and send due date notifications
const sendDueDateNotifications = async (io) => {
  try {
    const now = new Date();
    // Calculate the date 2 days from now
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + 2);
    targetDate.setHours(0, 0, 0, 0); // Start of the day
    const targetDateEnd = new Date(targetDate);
    targetDateEnd.setHours(23, 59, 59, 999); // End of the day

    // Query tasks with due date 2 days from now, not soft-deleted
    const tasks = await Task.find({
      dueDate: { $gte: targetDate, $lte: targetDateEnd },
      $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
    }).lean();

    // Query subtasks with due date 2 days from now, not soft-deleted
    const subtasks = await SubTask.find({
      dueDate: { $gte: targetDate, $lte: targetDateEnd },
      $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
    }).lean();

    // Query projects with due date 2 days from now, not soft-deleted
    const projects = await Project.find({
      dueDate: { $gte: targetDate, $lte: targetDateEnd },
      $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
    }).lean();

    // Query subprojects with due date 2 days from now, not soft-deleted
    const subprojects = await SubProject.find({
      dueDate: { $gte: targetDate, $lte: targetDateEnd },
      $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
    }).lean();

    // Process tasks
    for (const task of tasks) {
      try {
        // Check for existing DUE_DATE_TASK notification
        const existingNotification = await Notification.findOne({
          entityId: task._id,
          type: 'DUE_DATE_TASK',
          dueDate: task.dueDate,
        });
        if (existingNotification) {
          // console.log(`Skipping duplicate notification for task ${task._id}`);
          continue;
        }

        await createNotification(
          task.owner,
          'DUE_DATE_TASK',
          `Reminder: Task "${task.title}" is due on ${new Date(task.dueDate).toLocaleDateString()}`,
          task._id,
          'Task',
          task.dueDate,
          io,
          { isReminder: true }
        );
      } catch (error) {
        console.error(`Error sending notification for task ${task._id}:`, error.message);
      }
    }

    // Process subtasks
    for (const subtask of subtasks) {
      try {
        // Check for existing DUE_DATE_SUBTASK notification
        const existingNotification = await Notification.findOne({
          entityId: subtask._id,
          type: 'DUE_DATE_SUBTASK',
          dueDate: subtask.dueDate,
        });
        if (existingNotification) {
          // console.log(`Skipping duplicate notification for subtask ${subtask._id}`);
          continue;
        }

        await createNotification(
          subtask.owner,
          'DUE_DATE_SUBTASK',
          `Reminder: Subtask "${subtask.title}" is due on ${new Date(subtask.dueDate).toLocaleDateString()}`,
          subtask._id,
          'SubTask',
          subtask.dueDate,
          io,
          { isReminder: true }
        );
      } catch (error) {
        console.error(`Error sending notification for subtask ${subtask._id}:`, error.message);
      }
    }

    // Process projects
    for (const project of projects) {
      try {
        // Check for existing DUE_DATE_PROJECT notification
        const existingNotification = await Notification.findOne({
          entityId: project._id,
          type: 'DUE_DATE_PROJECT',
          dueDate: project.dueDate,
        });
        if (existingNotification) {
          // console.log(`Skipping duplicate notification for project ${project._id}`);
          continue;
        }

        const recipients = [project.owner, ...project.members].map(id => id.toString());
        await createNotification(
          recipients,
          'DUE_DATE_PROJECT',
          `Reminder: Project "${project.title}" is due on ${new Date(project.dueDate).toLocaleDateString()}`,
          project._id,
          'Project',
          project.dueDate,
          io,
          { isReminder: true }
        );
      } catch (error) {
        console.error(`Error sending notification for project ${project._id}:`, error.message);
      }
    }

    // Process subprojects
    for (const subproject of subprojects) {
      try {
        // Check for existing DUE_DATE_SUBPROJECT notification
        const existingNotification = await Notification.findOne({
          entityId: subproject._id,
          type: 'DUE_DATE_SUBPROJECT',
          dueDate: subproject.dueDate,
        });
        if (existingNotification) {
          // console.log(`Skipping duplicate notification for subproject ${subproject._id}`);
          continue;
        }

        const recipients = [subproject.owner, ...subproject.members].map(id => id.toString());
        await createNotification(
          recipients,
          'DUE_DATE_SUBPROJECT',
          `Reminder: Subproject "${subproject.title}" is due on ${new Date(subproject.dueDate).toLocaleDateString()}`,
          subproject._id,
          'SubProject',
          subproject.dueDate,
          io,
          { isReminder: true }
        );
      } catch (error) {
        console.error(`Error sending notification for subproject ${subproject._id}:`, error.message);
      }
    }

    // console.log(`Due date notifications processed on ${now.toISOString()}. Tasks: ${tasks.length}, Subtasks: ${subtasks.length}, Projects: ${projects.length}, Subprojects: ${subprojects.length}`);
  } catch (error) {
    console.error('Error in due date notification scheduler:', error.message);
  }
};

// Start the scheduler
const startScheduler = (io) => {
  // Schedule to run every 1 hr
  cron.schedule('0 * * * *', () => {
    // console.log('Running due date notification scheduler...');
    sendDueDateNotifications(io);
  }, {
    scheduled: true,
    timezone: 'Asia/Kathmandu' // Set to local timezone
  });
  // console.log('Due date notification scheduler started.');
};

module.exports = { startScheduler };