const Notification = require('../models/Notifications');
const User = require('../models/User');
const mongoose = require('mongoose');

// Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const { message, recipients, referenceType, referenceId } = req.body;
    const io = req.app.get('io'); // Get Socket.IO instance

    if (!message || !recipients || !Array.isArray(recipients)) {
      return res.status(400).json({ success: false, message: 'Message and recipients are required' });
    }

    // Validate recipient IDs
    const validRecipients = recipients.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validRecipients.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid recipients provided' });
    }

    // Check notification preferences for each recipient
    const users = await User.find({ _id: { $in: validRecipients } }).select('notificationPreferences');
    const filteredRecipients = [];
    const notificationPreferencesMap = {};

    for (const user of users) {
      const preferences = user.notificationPreferences || {
        createProject: true,
        createProject: true,
        projectInvite: true,
        dueDateProject: true,
        groupChatCreated: true,
        dueDateTask: true,
        subProjectAssign: true,
      };
      if (preferences[referenceType] !== false) {
        filteredRecipients.push(user._id);
        notificationPreferencesMap[user._id] = preferences;
      }
    }

    if (filteredRecipients.length === 0) {
      return res.status(200).json({ success: true, message: 'No recipients with enabled preferences', notification: null });
    }

    const notification = new Notification({
      message,
      recipients: filteredRecipients,
      referenceType,
      referenceId,
      isRead: filteredRecipients.map(userId => ({ userId, isRead: false })),
    });

    await notification.save();

    // Emit Socket.IO event to filtered recipients
    const populatedNotification = await Notification.findById(notification._id)
      .populate('recipients', 'name email')
      .lean();

    filteredRecipients.forEach(userId => {
      const userReadStatus = populatedNotification.isRead.find(status => status.userId.toString() === userId.toString());
      io.to(userId.toString()).emit('newNotification', {
        ...populatedNotification,
        isRead: userReadStatus ? userReadStatus.isRead : false,
      });
    });

    // Update notification count for each recipient
    filteredRecipients.forEach(async (userId) => {
      const unreadCount = await Notification.countDocuments({
        recipients: userId,
        isRead: { $elemMatch: { userId, isRead: false } },
      });
      io.to(userId.toString()).emit('notificationCountUpdate', { unreadCount });
    });

    res.status(201).json({ success: true, notification: populatedNotification });
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
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('recipients', 'name email')
      .lean();

    const transformedNotifications = notifications.map(notification => {
      const userReadStatus = notification.isRead.find(status => status.userId.toString() === userId);
      return {
        ...notification,
        isRead: userReadStatus ? userReadStatus.isRead : false,
      };
    });

    const totalNotifications = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipients: userId,
      isRead: { $elemMatch: { userId, isRead: false } },
    });

    // Emit notification count update via Socket.IO
    const io = req.app.get('io');
    io.to(userId).emit('notificationCountUpdate', { unreadCount });

    res.status(200).json({
      success: true,
      notifications: transformedNotifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalNotifications / parseInt(limit)),
        totalNotifications,
        limit: parseInt(limit),
      },
      unreadCount,
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
    const io = req.app.get('io');

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

    const updatedNotification = await Notification.findById(notificationId)
      .populate('recipients', 'name email')
      .lean();

    const transformedNotification = {
      ...updatedNotification,
      isRead: updatedNotification.isRead.find(status => status.userId.toString() === userId).isRead,
    };

    io.to(userId).emit('notificationRead', transformedNotification);

    // Update notification count
    const unreadCount = await Notification.countDocuments({
      recipients: userId,
      isRead: { $elemMatch: { userId, isRead: false } },
    });
    io.to(userId).emit('notificationCountUpdate', { unreadCount });

    res.status(200).json({ success: true, message: 'Notification marked as read', notification: transformedNotification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Error marking notification as read', error: error.message });
  }
};

// Mark all notifications as read for the user
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const io = req.app.get('io');

    await Notification.updateMany(
      { recipients: userId, 'isRead': { $elemMatch: { userId, isRead: false } } },
      { $set: { 'isRead.$[elem].isRead': true } },
      { arrayFilters: [{ 'elem.userId': userId }] }
    );

    io.to(userId).emit('allNotificationsRead', { userId });

    // Update notification count
    const unreadCount = await Notification.countDocuments({
      recipients: userId,
      isRead: { $elemMatch: { userId, isRead: false } },
    });
    io.to(userId).emit('notificationCountUpdate', { unreadCount: 0 });

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: 'Error marking all notifications as read', error: error.message });
  }
};

// Delete a notification for the user
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    const io = req.app.get('io');

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID' });
    }

    const notification = await Notification.findOne({ _id: notificationId, recipients: userId });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found or you do not have access' });
    }

    // Remove the user from the recipients list
    notification.recipients = notification.recipients.filter(recipient => recipient.toString() !== userId);
    notification.isRead = notification.isRead.filter(status => status.userId.toString() !== userId);

    // If no recipients remain, delete the notification entirely
    if (notification.recipients.length === 0) {
      await Notification.deleteOne({ _id: notificationId });
    } else {
      await notification.save();
    }

    // Emit Socket.IO event to update the client
    io.to(userId).emit('notificationDeleted', { notificationId });

    // Update notification count
    const unreadCount = await Notification.countDocuments({
      recipients: userId,
      isRead: { $elemMatch: { userId, isRead: false } },
    });
    io.to(userId).emit('notificationCountUpdate', { unreadCount });

    res.status(200).json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Error deleting notification', error: error.message });
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
        createTask: true,
        createProject: true,
        projectInvite: true,
        dueDateProject: true,
        groupChatCreated: true,
        dueDateTask: true,
        subProjectAssign : true,
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
    const io = req.app.get('io');

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

    io.to(userId).emit('notificationPreferencesUpdated', {
      preferences: user.notificationPreferences,
    });

    res.status(200).json({ success: true, message: 'Notification preferences saved successfully' });
  } catch (error) {
    console.error('Error saving notification preferences:', error);
    res.status(500).json({ success: false, message: 'Error saving notification preferences', error: error.message });
  }
};