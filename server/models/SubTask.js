const mongoose = require('mongoose');

const SubTaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  status: { type: String, enum: ['To Do', 'In Progress', 'Completed'], default: 'To Do' },
  mainTask: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true }, // Reference to the main task
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Subtask owner
});

module.exports = mongoose.model('SubTask', SubTaskSchema);
