const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Owner of the project
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Registered users
  dueDate: { type: Date },
  pendingInvites: [{ type: String }], // Store emails of unregistered users
  subProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubProject' }],
  deletedAt: { type: Date, default: null },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Completed'],
    default: 'To Do',
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// ✅ Add TTL index separately (only applies when `deletedAt` is set)
projectSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days (30 * 24 * 60 * 60)

module.exports = mongoose.model('Project', projectSchema);
