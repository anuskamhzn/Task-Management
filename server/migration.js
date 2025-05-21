// migration.js
const mongoose = require('mongoose');
const Task = require('./models/Task');
const SubTask = require('./models/SubTask');
const Project = require('./models/Project');
const SubProject = require('./models/SubProject');
require('dotenv').config(); // Add this line

async function migrateIsOverdue() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const currentDate = new Date();

    // Update Tasks
    await Task.updateMany(
      {
        dueDate: { $lt: currentDate },
        status: { $ne: 'Completed' },
        $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
      },
      { isOverdue: true }
    );
    await Task.updateMany(
      {
        $or: [
          { dueDate: { $gte: currentDate } },
          { status: 'Completed' },
          { dueDate: null },
        ],
        $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
      },
      { isOverdue: false }
    );
    console.log('Task migration completed');

    // Update SubTasks
    await SubTask.updateMany(
      {
        dueDate: { $lt: currentDate },
        status: { $ne: 'Completed' },
        $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
      },
      { isOverdue: true }
    );
    await SubTask.updateMany(
      {
        $or: [
          { dueDate: { $gte: currentDate } },
          { status: 'Completed' },
          { dueDate: null },
        ],
        $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
      },
      { isOverdue: false }
    );
    console.log('SubTask migration completed');

    // Update Projects
    await Project.updateMany(
      {
        dueDate: { $lt: currentDate },
        status: { $ne: 'Completed' },
        $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
      },
      { isOverdue: true }
    );
    await Project.updateMany(
      {
        $or: [
          { dueDate: { $gte: currentDate } },
          { status: 'Completed' },
          { dueDate: null },
        ],
        $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
      },
      { isOverdue: false }
    );
    console.log('Project migration completed');

    // Update SubProjects
    await SubProject.updateMany(
      {
        dueDate: { $lt: currentDate },
        status: { $ne: 'Completed' },
        $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
      },
      { isOverdue: true }
    );
    await SubProject.updateMany(
      {
        $or: [
          { dueDate: { $gte: currentDate } },
          { status: 'Completed' },
        ],
        $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
      },
      { isOverdue: false }
    );
    console.log('SubProject migration completed');

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

migrateIsOverdue();