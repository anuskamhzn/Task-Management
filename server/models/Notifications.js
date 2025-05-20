const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }], // Array of recipients
  type: {
    type: String,
    enum: [
      'CREATE_TASK',
      'CREATE_SUBTASK',
      'DUE_DATE_TASK',
      'DUE_DATE_SUBTASK',
      'CREATE_PROJECT',
      'CREATE_SUBPROJECT',
      'DUE_DATE_PROJECT',
      'DUE_DATE_SUBPROJECT',
      'PROJECT_INVITE',
      'GROUP_CHAT_CREATED',
      'GROUP_CHAT_ADDED',
      'SUBPROJECT_ASSIGNMENT', // Added new notification type
    ],
    required: true,
  },

  message: {
    type: String,
    required: true,
    trim: true,
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'entityModel',
    required: true,
  },
  entityModel: {
    type: String,
    enum: ['Task', 'SubTask', 'Project', 'SubProject', 'Group'],
    required: true,
  },
  status: {
    type: String,
    enum: ['unread', 'read'],
    default: 'unread',
  },
  dueDate: {
    type: Date,
    required: function () {
      return this.type.includes('DUE_DATE');
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  readAt: {
    type: Date,
  },
  isRead: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isRead: { type: Boolean, default: false },
  }], // Array of read statuses per user
  additionalData: { type: mongoose.Schema.Types.Mixed, default: {} }, // Supports isReminder
  deletedAt: { type: Date },
}, {
  timestamps: true,
});

// Compound index for efficient querying by recipient and status
notificationSchema.index({ recipient: 1, status: 1, createdAt: -1 });

// Pre-save hook to validate dueDate for DUE_DATE notifications
notificationSchema.pre('save', function (next) {
  if (this.type.includes('DUE_DATE') && !this.dueDate) {
    return next(new Error('dueDate is required for DUE_DATE notification types'));
  }
  next();
});

// Method to mark notification as read
notificationSchema.methods.markAsRead = async function () {
  this.status = 'read';
  this.readAt = new Date();
  await this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);