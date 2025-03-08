const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For private messages
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // For project chats
  group: {  // group messages
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }, // Track if the message is read
  type: { type: String, enum: ['text', 'image', 'file'], default: 'text' } // Allow different types of content
});

module.exports = mongoose.model('Message', messageSchema);
