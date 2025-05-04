const nodemailer = require('nodemailer');
const User = require('../models/User');
const Task = require('../models/Task');
const Project = require('../models/Project');
const mongoose = require('mongoose');

// Nodemailer setup (unchanged)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// All users (unchanged)
exports.users = async (req, res) => {
  try {
    const users = await User.find({
      role: { $ne: 'Admin' } // Exclude users with role 'admin'
    }).select('username name email initials phone location createdAt');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get recent users (unchanged)
exports.getRecentUsers = async (req, res) => {
  try {
    const admin = req.user;
    if (admin.role !== 'Admin') {
      return res.status(403).json({ message: "You are not authorized to view this data." });
    }

    const totalUsers = await User.countDocuments({ role: { $ne: 'Admin' } });
    const totalUser = await User.countDocuments({ role: 'User' });

    const recentUsers = await User
      .find({ role: 'User' })
      .select('initials name email phone location photo createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const formattedUsers = recentUsers.map(user => {
      const photoData = user.photo && user.photo.data ? {
        contentType: user.photo.contentType || 'image/png',
        data: Buffer.isBuffer(user.photo.data) ? user.photo.data.toString('base64') : user.photo.data
      } : null;

      return {
        _id: user._id,
        initials:user.initials,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        createdAt: user.createdAt,
        photo: photoData
      };
    });

    res.status(200).json({
      totalUsers,
      totalUser,
      recentUsers: formattedUsers,
    });
  } catch (error) {
    console.error("Error fetching recent users and counts:", error);
    res.status(500).json({ message: "Error fetching data", error: error.message });
  }
};

// Get all users (unchanged)
exports.getAllUsers = async (req, res) => {
  try {
    const admin = req.user;
    if (admin.role !== 'Admin') {
      return res.status(403).json({ message: "You are not authorized to view this data." });
    }

    const totalUsers = await User.countDocuments({ role: { $ne: 'Admin' } });
    const totalUser = await User.countDocuments({ role: 'User' });

    const recentUsers = await User
      .find({ role: 'User' })
      .select('name initials email phone location createdAt photo')
      .sort({ createdAt: -1 });

    const formattedUsers = recentUsers.map(user => {
      const photoData = user.photo && user.photo.data ? {
        contentType: user.photo.contentType || 'image/png',
        data: Buffer.isBuffer(user.photo.data) ? user.photo.data.toString('base64') : user.photo.data
      } : null;

      return {
        _id: user._id,
        initials:user.initials,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        createdAt: user.createdAt,
        photo: photoData
      };
    });

    res.status(200).json({
      totalUsers,
      totalUser,
      recentUsers: formattedUsers,
    });
  } catch (error) {
    console.error("Error fetching recent users and counts:", error);
    res.status(500).json({ message: "Error fetching data", error: error.message });
  }
};

// Get user by ID
exports.getUserByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    // Find user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    res.status(200).json({ success: true, message: "User found", user });
  } catch (error) {
    console.error('Error fetching user:', error); // Log the error
    res.status(500).json({ success: false, message: "Error in fetching user", error });
  }
};

// Delete user (unchanged)
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const admin = req.user;
    if (admin.role !== 'Admin') {
      return res.status(403).json({ message: "Only admins can delete users." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.role === 'Admin') {
      return res.status(400).json({ message: "Cannot delete admin accounts." });
    }

    await user.deleteOne();
    res.status(200).json({
      success: true,
      message: `User ${user.name} has been deleted successfully.`,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Error deleting user", error: error.message });
  }
};

// Get website analytics (unchanged)
exports.getWebsiteAnalytics = async (req, res) => {
  try {
    const admin = req.user;
    if (admin.role !== 'Admin') {
      return res.status(403).json({ message: 'You are not authorized to view this data.' });
    }

    const currentDate = new Date();

    const userStats = await User.aggregate([
      {
        $match: { role: { $ne: 'Admin' } },
      },
      {
        $facet: {
          totalUsers: [{ $count: 'totalCount' }],
          newUsers: [
            {
              $match: {
                createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
              },
            },
            { $count: 'newCount' },
          ],
        },
      },
    ]);

    const taskStats = await Task.aggregate([
      {
        $match: {
          $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
        },
      },
      {
        $facet: {
          totalTasks: [{ $count: 'totalCount' }],
          statusCounts: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ],
          overdueTasks: [
            {
              $match: {
                dueDate: { $lt: currentDate },
                status: { $ne: 'Completed' },
              },
            },
            { $count: 'overdueCount' },
          ],
        },
      },
    ]);

    const projectStats = await Project.aggregate([
      {
        $match: {
          deletedAt: null,
        },
      },
      {
        $facet: {
          totalProjects: [{ $count: 'totalCount' }],
          statusCounts: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ],
          overdueProjects: [
            {
              $match: {
                dueDate: { $lt: currentDate },
                status: { $ne: 'Completed' },
              },
            },
            { $count: 'overdueCount' },
          ],
        },
      },
    ]);

    const totalUsers = userStats[0].totalUsers[0]?.totalCount || 0;
    const newUsers = userStats[0].newUsers[0]?.newCount || 0;

    const totalTasks = taskStats[0].totalTasks[0]?.totalCount || 0;
    const taskStatusCounts = { toDo: 0, inProgress: 0, completed: 0 };
    taskStats[0].statusCounts.forEach((group) => {
      switch (group._id) {
        case 'To Do':
          taskStatusCounts.toDo = group.count;
          break;
        case 'In Progress':
          taskStatusCounts.inProgress = group.count;
          break;
        case 'Completed':
          taskStatusCounts.completed = group.count;
          break;
      }
    });
    const overdueTasks = taskStats[0].overdueTasks[0]?.overdueCount || 0;

    const totalProjects = projectStats[0].totalProjects[0]?.totalCount || 0;
    const projectStatusCounts = { toDo: 0, inProgress: 0, completed: 0 };
    projectStats[0].statusCounts.forEach((group) => {
      switch (group._id) {
        case 'To Do':
          projectStatusCounts.toDo = group.count;
          break;
        case 'In Progress':
          projectStatusCounts.inProgress = group.count;
          break;
        case 'Completed':
          projectStatusCounts.completed = group.count;
          break;
      }
    });
    const overdueProjects = projectStats[0].overdueProjects[0]?.overdueCount || 0;

    const taskCompletionRate = totalTasks > 0 ? ((taskStatusCounts.completed / totalTasks) * 100).toFixed(2) + '%' : '0%';
    const projectCompletionRate = totalProjects > 0 ? ((projectStatusCounts.completed / totalProjects) * 100).toFixed(2) + '%' : '0%';

    res.status(200).json({
      message: 'Website analytics retrieved successfully',
      analytics: {
        users: {
          totalUsers,
          newUsers,
        },
        tasks: {
          totalTasks,
          statusCounts: taskStatusCounts,
          overdueTasks,
          completionRate: taskCompletionRate,
        },
        projects: {
          totalProjects,
          statusCounts: projectStatusCounts,
          overdueProjects,
          completionRate: projectCompletionRate,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching website analytics:', error);
    res.status(500).json({ message: 'Error fetching website analytics', error: error.message });
  }
};

// Get tasks per month (fixed)
exports.getTasksPerMonth = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const tasksPerMonth = await Task.aggregate([
      {
        $match: {
          $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json(tasksPerMonth);
  } catch (error) {
    console.error('Error fetching tasks per month:', error);
    res.status(500).json({ message: 'Error fetching tasks per month', error: error.message });
  }
};

// Get projects per month (fixed)
exports.getProjectsPerMonth = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const projectsPerMonth = await Project.aggregate([
      {
        $match: {
          $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json(projectsPerMonth);
  } catch (error) {
    console.error('Error fetching projects per month:', error);
    res.status(500).json({ message: 'Error fetching projects per month', error: error.message });
  }
};
