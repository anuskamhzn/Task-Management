const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User creating the task (owner)
  initials: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dueDate: { type: Date },
  subTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubTask' }],
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Completed'], // Status of the task
    default: 'To Do',
  },
  isOverdue: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
},
{ timestamps: true }
);

// ✅ Add TTL index separately (only applies when `deletedAt` is set)
taskSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days (30 * 24 * 60 * 60)

module.exports = mongoose.model('Task', taskSchema);
