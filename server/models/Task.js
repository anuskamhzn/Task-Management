const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User creating the task (owner)
  dueDate: { type: Date },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Completed'], // Status of the task
    default: 'To Do',
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Task', taskSchema);
