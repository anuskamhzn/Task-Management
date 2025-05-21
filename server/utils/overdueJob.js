const cron = require('node-cron');
const Task = require('../models/Task');
const SubTask = require('../models/SubTask');
const Project = require('../models/Project');
const SubProject = require('../models/SubProject');
const User = require('../models/User');
const Notification = require('../models/Notifications');
const { createNotification } = require('../utils/notificationUtils');
const sendOverdueReminder = require('../controllers/projectController');
const mongoose = require('mongoose');

const checkOverdueItems = async (io) => {
  try {
    const currentDate = new Date();

    // Helper function to format due date
    const formatDueDate = (dueDate) =>
      new Date(dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

    // Check overdue tasks
    const overdueTasks = await Task.find({
      dueDate: { $lt: currentDate },
      status: { $ne: 'Completed' },
      $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
    });

    for (const task of overdueTasks) {
      try {
        // Check for existing OVERDUE_TASK notification
        const existingNotification = await Notification.findOne({
          entityId: task._id,
          type: 'OVERDUE_TASK',
          dueDate: task.dueDate,
        });
        if (existingNotification) {
          // console.log(`Skipping duplicate notification for task ${task._id}`);
          task.isOverdue = true;
          await task.save();
          continue;
        }

        const owner = await User.findById(task.owner);
        if (owner) {
          await createNotification(
            task.owner,
            'OVERDUE_TASK',
            `The task "${task.title}" is overdue (due on ${formatDueDate(task.dueDate)})`,
            task._id,
            'Task',
            task.dueDate,
            io,
            { isOverdue: true }
          );
          await sendOverdueReminder.sendOverdueReminder(owner.email, 'Task', task.title, task.dueDate, task._id);
          task.isOverdue = true;
          await task.save();
        }
      } catch (error) {
        console.error(`Error processing task ${task._id}:`, error.message);
      }
    }

    // Check overdue subtasks
    const overdueSubTasks = await SubTask.find({
      dueDate: { $lt: currentDate },
      status: { $ne: 'Completed' },
      $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
    }).populate('mainTask'); // Use mainTask as defined in SubTask schema

    for (const subTask of overdueSubTasks) {
      try {
        // Check for existing OVERDUE_SUBTASK notification
        const existingNotification = await Notification.findOne({
          entityId: subTask._id,
          type: 'OVERDUE_SUBTASK',
          dueDate: subTask.dueDate,
        });
        if (existingNotification) {
          // console.log(`Skipping duplicate notification for subtask ${subTask._id}`);
          subTask.isOverdue = true;
          await subTask.save();
          continue;
        }

        const owner = await User.findById(subTask.owner);
        if (owner) {
          const parentTaskTitle = subTask.mainTask && subTask.mainTask.title ? subTask.mainTask.title : 'unknown task';
          await createNotification(
            subTask.owner,
            'OVERDUE_SUBTASK',
            `The subtask "${subTask.title}" of "${parentTaskTitle}" is overdue (due on ${formatDueDate(subTask.dueDate)})`,
            subTask._id,
            'SubTask',
            subTask.dueDate,
            io,
            { isOverdue: true }
          );
          await sendOverdueReminder.sendOverdueReminder(owner.email, 'SubTask', subTask.title, subTask.dueDate, subTask._id);
          subTask.isOverdue = true;
          await subTask.save();
        }
      } catch (error) {
        console.error(`Error processing subtask ${subTask._id}:`, error.message);
      }
    }

    // Check overdue projects
    const overdueProjects = await Project.find({
      dueDate: { $lt: currentDate },
      status: { $ne: 'Completed' },
      $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
    });

    for (const project of overdueProjects) {
      try {
        // Check for existing OVERDUE_PROJECT notification
        const existingNotification = await Notification.findOne({
          entityId: project._id,
          type: 'OVERDUE_PROJECT',
          dueDate: project.dueDate,
        });
        if (existingNotification) {
          // console.log(`Skipping duplicate notification for project ${project._id}`);
          project.isOverdue = true;
          await project.save();
          continue;
        }

        const recipients = [project.owner, ...project.members].map(id => id.toString());
        const users = await User.find({ _id: { $in: recipients } });
        for (const user of users) {
          await sendOverdueReminder.sendOverdueReminder(user.email, 'Project', project.title, project.dueDate, project._id);
        }
        await createNotification(
          recipients,
          'OVERDUE_PROJECT',
          `The project "${project.title}" is overdue (due on ${formatDueDate(project.dueDate)})`,
          project._id,
          'Project',
          project.dueDate,
          io,
          { isOverdue: true }
        );
        project.isOverdue = true;
        await project.save();
      } catch (error) {
        console.error(`Error processing project ${project._id}:`, error.message);
      }
    }

    // Check overdue subprojects
    const overdueSubProjects = await SubProject.find({
      dueDate: { $lt: currentDate },
      status: { $ne: 'Completed' },
      $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
    }).populate('mainProject'); // Use mainProject as defined in SubProject schema

    for (const subProject of overdueSubProjects) {
      try {
        // Check for existing OVERDUE_SUBPROJECT notification
        const existingNotification = await Notification.findOne({
          entityId: subProject._id,
          type: 'OVERDUE_SUBPROJECT',
          dueDate: subProject.dueDate,
        });
        if (existingNotification) {
          // console.log(`Skipping duplicate notification for subproject ${subProject._id}`);
          subProject.isOverdue = true;
          await subProject.save();
          continue;
        }

        const recipients = [subProject.owner, ...subProject.members].map(id => id.toString());
        const users = await User.find({ _id: { $in: recipients } });
        for (const user of users) {
          await sendOverdueReminder.sendOverdueReminder(user.email, 'SubProject', subProject.title, subProject.dueDate, subProject._id);
        }
        const parentProjectTitle = subProject.mainProject && subProject.mainProject.title ? subProject.mainProject.title : 'unknown project';
        await createNotification(
          recipients,
          'OVERDUE_SUBPROJECT',
          `The subproject "${subProject.title}" of "${parentProjectTitle}" is overdue (due on ${formatDueDate(subProject.dueDate)})`,
          subProject._id,
          'SubProject',
          subProject.dueDate,
          io,
          { isOverdue: true }
        );
        subProject.isOverdue = true;
        await subProject.save();
      } catch (error) {
        console.error(`Error processing subproject ${subProject._id}:`, error.message);
      }
    }

    // console.log('Overdue check completed successfully');
  } catch (error) {
    console.error('Error checking overdue items:', error);
  }
};

// Schedule the job to run at 8 PM
const startOverdueJob = (io) => {
  cron.schedule('* * * * *', () => {
    // console.log('Running overdue check...');
    checkOverdueItems(io);
  }, {
    scheduled: true,
    timezone: 'Asia/Kathmandu'
  });
};

module.exports = { startOverdueJob };