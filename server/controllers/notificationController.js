const Notification = require('../models/Notifications');
const User = require('../models/User'); // Assuming a User model exists
const mongoose = require('mongoose');

// Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const { message, recipients, referenceType, referenceId } = req.body;
    const io = req.app.get('io'); // Get Socket.IO instance

    if (!message || !recipients || !Array.isArray(recipients)) {
      return res.status(400).json({ success: false, message: 'Message and recipients are required' });
    }

    const notification = new Notification({
      message,
      recipients,
      referenceType,
      referenceId,
      isRead: recipients.map(userId => ({ userId, isRead: false })),
    });

    await notification.save();

    // Emit Socket.IO event to all recipients
    recipients.forEach(userId => {
      io.to(userId).emit('newNotification', {
        _id: notification._id,
        message: notification.message,
        recipients: notification.recipients,
        referenceType: notification.referenceType,
        referenceId: notification.referenceId,
        createdAt: notification.createdAt,
        isRead: false,
      });
    });

    res.status(201).json({ success: true, notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ success: false, message: 'Error creating notification', error: error.message });
  }
};

// Get notifications for the logged-in user
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { isRead, page = 1, limit = 10 } = req.query;

    const query = { recipients: userId };
    if (isRead !== undefined) {
      query['isRead'] = {
        $elemMatch: { userId: userId, isRead: isRead === 'true' },
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(parseInt(limit))
      .populate('recipients', 'name email')
      .lean();

    // Transform notifications to include user's isRead status
    const transformedNotifications = notifications.map(notification => {
      const userReadStatus = notification.isRead.find(status => status.userId.toString() === userId);
      return {
        ...notification,
        isRead: userReadStatus ? userReadStatus.isRead : false,
      };
    });

    const totalNotifications = await Notification.countDocuments(query);

    res.status(200).json({
      success: true,
      notifications: transformedNotifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalNotifications / parseInt(limit)),
        totalNotifications,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Error fetching notifications', error: error.message });
  }
};

// Mark a notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID' });
    }

    const notification = await Notification.findOne({ _id: notificationId, recipients: userId });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found or you do not have access' });
    }

    const userReadStatus = notification.isRead.find(status => status.userId.toString() === userId);
    if (userReadStatus && userReadStatus.isRead) {
      return res.status(400).json({ success: false, message: 'Notification is already marked as read' });
    }

    if (userReadStatus) {
      userReadStatus.isRead = true;
    } else {
      notification.isRead.push({ userId, isRead: true });
    }

    await notification.save();

    res.status(200).json({ success: true, message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Error marking notification as read', error: error.message });
  }
};

// Mark all notifications as read for the user
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { recipients: userId, 'isRead': { $elemMatch: { userId, isRead: false } } },
      { $set: { 'isRead.$[elem].isRead': true } },
      { arrayFilters: [{ 'elem.userId': userId }] }
    );

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: 'Error marking all notifications as read', error: error.message });
  }
};

// Get notification preferences for the logged-in user
exports.getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('notificationPreferences');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      preferences: user.notificationPreferences || {
        projectInvite: true,
        dueDateProject: true,
        groupChatCreated: true,
        dueDateTask: true,
      },
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ success: false, message: 'Error fetching notification preferences', error: error.message });
  }
};

// Save notification preferences for the logged-in user
exports.saveNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { preferences } = req.body;

    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid preferences data' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { notificationPreferences: preferences },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'Notification preferences saved successfully' });
  } catch (error) {
    console.error('Error saving notification preferences:', error);
    res.status(500).json({ success: false, message: 'Error saving notification preferences', error: error.message });
  }
};