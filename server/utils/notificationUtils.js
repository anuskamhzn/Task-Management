const Notification = require('../models/Notifications');
const User = require('../models/User');

const createNotification = async (recipientIds, type, message, entityId, entityModel, dueDate = null, io = null) => {
  try {
    // Ensure recipientIds is an array
    const recipients = Array.isArray(recipientIds) ? recipientIds : [recipientIds];

    // Fetch users and check preferences
    const users = await User.find({ _id: { $in: recipients } });
    const validRecipients = users
      .filter(user => user.notificationPreferences[type])
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
    });

    await notification.save();

    // Emit Socket.IO event to all recipients
    if (io) {
      validRecipients.forEach(recipientId => {
        io.to(recipientId.toString()).emit('newNotification', notification);
      });
    }

    return notification;
  } catch (error) {
    console.error(`Error creating notification:`, error.message);
    return null;
  }
};

module.exports = { createNotification };