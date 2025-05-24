const Message = require('../models/Message');
const User = require('../models/User');
const Project = require('../models/Project');
const fs = require('fs');                    
const mongoose = require('mongoose');

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

// In your message controller file
exports.sendPrivateMessageReply = async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipientId, content, parentMessageId } = req.fields || {};
    const file = req.files?.file;
    const photo = req.files?.photo;

    if (!recipientId) return res.status(400).json({ success: false, message: "Recipient ID is required" });
    if (!parentMessageId) return res.status(400).json({ success: false, message: "Parent message ID is required" });
    if (!content && !photo && !file) {
      return res.status(400).json({ success: false, message: "Message must contain text, a photo, or a file" });
    }

    const parentMessage = await Message.findById(parentMessageId);
    if (!parentMessage) return res.status(404).json({ success: false, message: "Parent message not found" });

    const isSenderOrRecipient = (
      (parentMessage.sender.toString() === userId && parentMessage.recipient.toString() === recipientId) ||
      (parentMessage.sender.toString() === recipientId && parentMessage.recipient.toString() === userId)
    );
    if (!isSenderOrRecipient) {
      return res.status(403).json({ success: false, message: "Parent message is not part of this conversation" });
    }

    const messageData = {
      sender: userId,
      recipient: recipientId,
      content: content || "",
      type: "text",
      replies: [parentMessageId], // Consistent naming
    };

    const MAX_SIZE = 10 * 1024 * 1024;
    if (photo) {
      const photoData = fs.readFileSync(photo.path);
      if (photoData.length > MAX_SIZE) return res.status(400).json({ success: false, message: "Photo exceeds 10MB limit" });
      messageData.photo = { data: photoData, contentType: photo.type };
      messageData.type = "photo";
      fs.unlinkSync(photo.path);
    } else if (file) {
      const fileData = fs.readFileSync(file.path);
      if (fileData.length > MAX_SIZE) return res.status(400).json({ success: false, message: "File exceeds 10MB limit" });
      messageData.file = { data: fileData, contentType: file.type, fileName: file.name };
      messageData.type = "file";
      fs.unlinkSync(file.path);
    }

    const message = new Message(messageData);
    await message.save();

    await Message.findByIdAndUpdate(parentMessageId, { $push: { replies: message._id } });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name')
      .populate('recipient', 'name');

    res.status(200).json({ success: true, message: populatedMessage });
  } catch (error) {
    console.error("Error sending reply:", error);
    res.status(500).json({ success: false, message: "Error sending reply", error: error.message });
  }
};


// Delete private message (updated to handle replies)
exports.deletePrivateMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.body;

    if (!messageId) {
      return res.status(400).json({ success: false, message: 'No message ID provided' });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'You can only delete your own messages' });
    }
    if (message.deletedAt) {
      return res.status(400).json({ success: false, message: 'Message already deleted' });
    }

    // Soft delete the message
    message.deletedAt = new Date();
    await message.save();

    // If this message is a reply, remove it from the parent's replies array
    if (message.replies && message.replies.length > 0) {
      const parentMessageId = message.replies[0];
      await Message.findByIdAndUpdate(parentMessageId, {
        $pull: { replies: messageId },
      });
    }

    res.status(200).json({ success: true, message: 'Message deleted', messageId });
  } catch (error) {
    console.error('Error deleting private message:', error);
    res.status(500).json({ success: false, message: 'Error deleting private message', error: error.message });
  }
};

// Edit private message
exports.editPrivateMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId, content } = req.fields || {};

    if (!messageId) {
      return res.status(400).json({ success: false, message: 'No message ID provided' });
    }
    if (!content || content.trim() === "") {
      return res.status(400).json({ success: false, message: 'New content cannot be empty' });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'You can only edit your own messages' });
    }
    if (message.deletedAt) {
      return res.status(400).json({ success: false, message: 'Cannot edit a deleted message' });
    }
    if (message.type !== 'text') {
      return res.status(400).json({ success: false, message: 'Only text messages can be edited' });
    }

    message.content = content;
    message.updatedAt = new Date(); // Optional: track edit time
    await message.save();

    const populatedMessage = await Message.findById(messageId)
      .populate('sender', 'name')
      .populate('recipient', 'name');

    res.status(200).json({ success: true, message: populatedMessage });
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({ success: false, message: 'Error editing message', error: error.message });
  }
};

// Update getPrivateMessages to include replies
exports.getPrivateMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const recipientId = req.params.recipientId;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: recipientId },
        { sender: recipientId, recipient: userId },
      ],
      // deletedAt: null,
    })
      .populate('sender', 'name initials')
      .populate('recipient', 'name initials')
      .populate({
        path: 'replies',
        populate: { path: 'sender', select: 'name' },
      })
      .sort({ timestamp: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalMessages = await Message.countDocuments({
      $or: [
        { sender: userId, recipient: recipientId },
        { sender: recipientId, recipient: userId },
      ],
      // deletedAt: null,
    });
    const totalPages = Math.ceil(totalMessages / limit);

    res.status(200).json({
      success: true,
      messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalMessages,
        limit: parseInt(limit),
      },
    });
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
      .populate('sender', 'name')
      .sort({ timestamp: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching messages', error });
  }
};

// Get recent private message senders with counts and user details
exports.getRecentPrivateSenders = async (req, res) => {
  try {
    const userId = req.user.id;

    const recentSenders = await Message.aggregate([
      {
        $match: {
          $or: [
            { recipient: new mongoose.Types.ObjectId(userId), deletedAt: null }, // Received messages
            { sender: new mongoose.Types.ObjectId(userId), deletedAt: null },   // Sent messages
          ],
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', new mongoose.Types.ObjectId(userId)] },
              '$recipient',
              '$sender',
            ],
          },
          latestTimestamp: { $max: '$timestamp' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$recipient', new mongoose.Types.ObjectId(userId)] }, { $eq: ['$isRead', false] }] },
                1,
                0,
              ],
            },
          },
          totalCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          _id: 0,
          senderId: '$_id',
          name: '$userInfo.name',
          email: '$userInfo.email',
          initials: '$userInfo.initials',
          latestTimestamp: 1,
          unreadCount: 1,
          totalCount: 1,
        },
      },
      { $sort: { latestTimestamp: -1 } },
    ]);

    res.status(200).json({
      success: true,
      recentSenders,
      total: recentSenders.length,
    });
  } catch (error) {
    console.error('Error fetching recent private senders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent private senders',
      error: error.message,
    });
  }
};