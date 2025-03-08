const Message = require('../models/Message');
const Project = require('../models/Project');

// Send private message
exports.sendPrivateMessage = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const { recipientId, content } = req.body; // sender's message content and recipient ID

    const message = new Message({
      sender: userId,
      recipient: recipientId,
      content,
    });
    await message.save();

    res.status(200).json({ success: true, message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error sending message', error });
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
