const cron = require('node-cron');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Notification = require('../models/Notifications');
const { createNotification } = require('./notificationUtils');

const DUE_THRESHOLD_DAYS = 2; // Notify 2 days before due date
const CHECK_INTERVAL = '0 0 * * *'; // Run daily at midnight

const scheduleNearDueNotifications = () => {
  cron.schedule(CHECK_INTERVAL, async () => {
    try {
      console.log('Checking for near-due projects and tasks...');

      const now = new Date();
      const thresholdDate = new Date(now.getTime() + DUE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000);

      // Check projects
      const projects = await Project.find({
        dueDate: { $gte: now, $lte: thresholdDate },
        deletedAt: null,
      });

      for (const project of projects) {
        const existingNotification = await Notification.findOne({
          type: 'DUE_DATE_PROJECT',
          entityId: project._id,
          message: { $regex: `is due soon`, $options: 'i' },
        });

        if (!existingNotification) {
          const recipients = [project.owner, ...project.members];
          await createNotification(
            recipients,
            'DUE_DATE_PROJECT',
            `The project "${project.title}" is due soon on ${new Date(project.dueDate).toLocaleDateString()}`,
            project._id,
            'Project',
            project.dueDate
          );
        }
      }

      // Check tasks
      const tasks = await Task.find({
        dueDate: { $gte: now, $lte: thresholdDate },
        deletedAt: null,
      });

      for (const task of tasks) {
        const existingNotification = await Notification.findOne({
          recipients: task.owner,
          type: 'DUE_DATE_TASK',
          entityId: task._id,
          message: { $regex: `is due soon`, $options: 'i' },
        });

        if (!existingNotification) {
          await createNotification(
            [task.owner], // Single recipient for tasks
            'DUE_DATE_TASK',
            `The task "${task.title}" is due soon on ${new Date(task.dueDate).toLocaleDateString()}`,
            task._id,
            'Task',
            task.dueDate
          );
        }
      }

      console.log('Near-due notifications processed.');
    } catch (error) {
      console.error('Error in near-due notification scheduler:', error);
    }
  });
};

module.exports = { scheduleNearDueNotifications };