const mongoose = require("mongoose");

const SubProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    mainProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dueDate: {
      type: Date,
      required: true, // Ensure a due date is always provided
    },
    status: {
      type: String,
      enum: ["To Do", "In Progress", "Completed"],
      default: "To Do",
    },
    initials:{ type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// ✅ Add TTL index separately (only applies when `deletedAt` is set)
SubProjectSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days (30 * 24 * 60 * 60)

module.exports = mongoose.model("SubProject", SubProjectSchema);
