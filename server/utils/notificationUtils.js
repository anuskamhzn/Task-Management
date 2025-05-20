const Notification = require('../models/Notifications');
const User = require('../models/User');

const createNotification = async (recipientIds, type, message, entityId, entityModel, dueDate = null, io = null, metadata = {}) => {
  try {
    // Ensure recipientIds is an array
    const recipients = Array.isArray(recipientIds) ? recipientIds : [recipientIds];

    // Fetch users and check preferences
    const users = await User.find({ _id: { $in: recipients } });
    const validRecipients = users
      .filter(user => user.notificationPreferences?.[type] !== false)
      .map(user => user._id);

    if (validRecipients.length === 0) {
      return null; // No users want this notification
    }

    // Initialize isRead array with false for each recipient
    const isRead = validRecipients.map(recipientId => ({
      userId: recipientId,
      isRead: false,
    }));

    const notification = new Notification({
      recipients: validRecipients,
      type,
      message,
      entityId,
      entityModel,
      dueDate,
      isRead,
      additionalData: metadata, // Store isReminder and other metadata
    });

    await notification.save();

    // Emit Socket.IO event to all recipients
    if (io) {
      const populatedNotification = await Notification.findById(notification._id)
        .populate('recipients', 'name email')
        .lean();

      validRecipients.forEach(recipientId => {
        const userReadStatus = populatedNotification.isRead.find(status => status.userId.toString() === recipientId.toString());
        io.to(recipientId.toString()).emit('newNotification', {
          ...populatedNotification,
          isRead: userReadStatus ? userReadStatus.isRead : false,
        });

        // Update notification count
        Notification.countDocuments({
          recipients: recipientId,
          isRead: { $elemMatch: { userId: recipientId, isRead: false } },
        }).then(unreadCount => {
          io.to(recipientId.toString()).emit('notificationCountUpdate', { unreadCount });
        });
      });
    }

    return notification;
  } catch (error) {
    console.error(`Error creating notification:`, error.message);
    return null;
  }
};

module.exports = { createNotification };