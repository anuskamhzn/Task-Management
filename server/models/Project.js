const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Owner of the project
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of users involved in the project
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Completed'], // Status of the project
    default: 'To Do',
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Project', projectSchema);
