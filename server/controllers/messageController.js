const Message = require('../models/Message');
const User = require('../models/User');
const Project = require('../models/Project');
const fs = require('fs');                      // File System module to handle file saving

// Send private message
// exports.sendPrivateMessage = async (req, res) => {
//   try {
//     const userId = req.user.id; // From auth middleware
//     const { recipientId, content } = req.body; // sender's message content and recipient ID

//     const message = new Message({
//       sender: userId,
//       recipient: recipientId,
//       content,
//     });
//     await message.save();

//     res.status(200).json({ success: true, message });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Error sending message', error });
//   }
// };

exports.sendPrivateMessage = async (req, res) => {
  try {
    const userId = req.user.id; // Sender's ID from auth middleware
    const { recipientId, content } = req.fields || {}; // Get text fields from formidable
    const file = req.files?.file; // Uploaded file
    const photo = req.files?.photo; // Uploaded photo

    // Validation
    if (!recipientId) {
      return res.status(400).json({ success: false, message: "Recipient ID is required" });
    }

    if (!content && !photo && !file) {
      return res.status(400).json({ success: false, message: "Message must contain text, a photo, or a file" });
    }

    const messageData = {
      sender: userId,
      recipient: recipientId,
      content: content || "", // Default to empty string if no content
      type: "text",
    };

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB

    // Handle photo upload
    if (photo) {
      try {
        const photoData = fs.readFileSync(photo.path);
        if (photoData.length > MAX_SIZE) {
          return res.status(400).json({ success: false, message: "Photo exceeds 10MB limit" });
        }
        messageData.photo = {
          data: photoData,
          contentType: photo.type,
        };
        messageData.type = "photo";
      } catch (err) {
        return res.status(500).json({ success: false, message: "Error reading photo file" });
      } finally {
        fs.unlink(photo.path, (err) => {
          if (err) console.error("Error deleting temp photo file:", err);
        });
      }
    }

    // Handle file upload
    if (file) {
      try {
        const fileData = fs.readFileSync(file.path);
        if (fileData.length > MAX_SIZE) {
          return res.status(400).json({ success: false, message: "File exceeds 10MB limit" });
        }
        messageData.file = {
          data: fileData,
          contentType: file.type,
          fileName: file.name,
        };
        messageData.type = "file";
      } catch (err) {
        return res.status(500).json({ success: false, message: "Error reading file" });
      } finally {
        fs.unlink(file.path, (err) => {
          if (err) console.error("Error deleting temp file:", err);
        });
      }
    }

    const message = new Message(messageData);
    await message.save();

    res.status(200).json({ success: true, message });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Error sending message", error: error.message });
  }
};

// Send project message (group chat)
exports.sendProjectMessage = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const { projectId, content } = req.body; // Get project and content

    const project = await Project.findById(projectId);
    if (!project || !project.members.includes(userId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const message = new Message({
      sender: userId,
      project: projectId,
      content,
    });
    await message.save();

    res.status(200).json({ success: true, message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error sending message', error });
  }
};

// Get private message history
exports.getPrivateMessages = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const recipientId = req.params.recipientId;

    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: recipientId },
        { sender: recipientId, recipient: userId },
      ],
    })
      .populate('sender', 'username')
      .populate('recipient', 'username') // Ensure recipient is populated properly
      .sort({ timestamp: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching messages', error });
  }
};

// Get project message history
exports.getProjectMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.projectId;

    const project = await Project.findById(projectId);
    if (!project || !project.members.includes(userId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const messages = await Message.find({ project: projectId })
      .populate('sender', 'username')
      .sort({ timestamp: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching messages', error });
  }
};
