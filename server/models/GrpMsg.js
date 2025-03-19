const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For private messages
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // For project chats
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }, // Group messages

  content: { type: String, trim: true }, // Trim whitespace for better storage

  // Photo Storage (Binary)
  photo: {
    data: { type: Buffer },
    contentType: { type: String }
  },

  // File Storage (Binary)
  file: {
    data: { type: Buffer },
    contentType: { type: String },
    fileName: { type: String, trim: true } // Trim filename to prevent unnecessary spaces
  },

  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }, // Track if the message is read

  // Message Type (Text, Photo, File)
  type: { 
    type: String, 
    enum: ['text', 'photo', 'file'], 
    default: 'text' 
  },

  // Message Reactions (Emoji-based)
  reactions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User who reacted
    emoji: { type: String, trim: true } // Example: "❤️", "👍", "😂"
  }],

  // Message Replies (Threaded messages)
  replies: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'GrpMsg' // Self-referencing message model for replies
  }],

  parentMessageId: { type: mongoose.Schema.Types.ObjectId, ref: 'GrpMsg', default: null }, // Add this field
  deletedAt: { type: Date, default: null }, // Set to Date when deleted soft delete
  isEdited: { type: Boolean, default: false } // Added to track edits
});

// Indexing for faster lookups (especially for chat history)
messageSchema.index({ recipient: 1 });
messageSchema.index({ project: 1 });
messageSchema.index({ group: 1 });
messageSchema.index({ timestamp: -1 });

// Ensure at least one of recipient, project, or group is set
messageSchema.pre('save', function(next) {
  if (!this.recipient && !this.project && !this.group) {
    return next(new Error('Message must belong to a recipient, project, or group.'));
  }
  next();
});

module.exports = mongoose.model('GrpMsg', messageSchema);
