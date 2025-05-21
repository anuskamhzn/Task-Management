const mongoose = require('mongoose');

// Define the Project schema
const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  initials:{ type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  dueDate: { type: Date },
  pendingInvites: [{ type: String }],
  subProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubProject' }],
  deletedAt: { type: Date, default: null },
  isOverdue: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Completed'],
    default: 'To Do',
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  // Add an array of references to chats for multiple conversations
  chats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }],
});

// TTL index for deleting project after 30 days if marked as deleted
projectSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('Project', projectSchema);
