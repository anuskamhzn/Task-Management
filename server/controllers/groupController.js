// controllers/groupChatController.js
const Group = require('../models/GroupChat');
const Message = require('../models/Message');
const GrpMsg = require('../models/GrpMsg');
const User = require('../models/User');
const fs = require('fs');

exports.createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Group name is required' });

    const group = new Group({
      name,
      creator: req.user.id,
      members: [req.user.id]
    });

    await group.save();
    res.status(201).json({ success: true, group });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error creating group' });
  }
};

// Enhanced addMemberToGroup with Socket.IO integration
exports.addMemberToGroup = async (req, res) => {
  try {
    const { groupId, emails } = req.body;
    const userId = req.user.id;
    const io = req.app.get('io');

    if (!groupId || !emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: 'Group ID and valid email list are required' });
    }

    const group = await Group.findById(groupId).populate('members', '_id').populate('creator', '_id');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if the requesting user is a member of the group
    const isMember = group.members.some(member => member._id.toString() === userId);
    if (!isMember) {
      return res.status(403).json({ message: 'Only group members can add new members' });
    }

    const newMembers = [];
    const existingMembers = group.members.map(member => member._id.toString());
    const failedEmails = [];

    for (const email of emails) {
      const user = await User.findOne({ email });
      if (!user) {
        failedEmails.push(email);
        continue;
      }
      if (!existingMembers.includes(user._id.toString())) {
        group.members.push(user._id);
        newMembers.push(user._id);
      }
    }

    if (newMembers.length === 0 && failedEmails.length > 0) {
      return res.status(400).json({
        success: false,
        message: `No new members added. Users with emails ${failedEmails.join(', ')} not found.`,
      });
    }

    await group.save();

    if (io) {
      io.to(`group_${groupId}`).emit('memberAdded', {
        groupId,
        newMembers: newMembers.map(memberId => ({ _id: memberId })), // Simplified for event
        addedBy: userId,
      });
      newMembers.forEach(memberId => {
        io.to(memberId.toString()).emit('addedToGroup', {
          groupId,
          groupName: group.name,
        });
      });
    }

    return res.status(200).json({
      success: true,
      group,
      addedMembers: newMembers.length,
      message: `${newMembers.length} member(s) added successfully${failedEmails.length > 0 ? `. Users with emails ${failedEmails.join(', ')} not found.` : ''}`,
    });
  } catch (error) {
    console.error('Error adding member:', error);
    return res.status(500).json({ success: false, message: 'Error adding member', error: error.message });
  }
};

// exports.addMemberToGroup = async (req, res) => {
//   try {
//     const { groupId, emails } = req.body;

//     // Validate inputs
//     if (!groupId || !emails || !Array.isArray(emails) || emails.length === 0) {
//       return res.status(400).json({ message: 'Group ID and an array of emails are required' });
//     }

//     const group = await Group.findById(groupId);
//     if (!group) return res.status(404).json({ message: 'Group not found' });

//     if (group.creator.toString() !== req.user.id) {
//       return res.status(403).json({ message: 'Only group creator can add members' });
//     }

//     // Find users by their emails
//     const usersToAdd = await User.find({ email: { $in: emails } });

//     // Identify registered and unregistered emails
//     const registeredUserIds = usersToAdd.map(user => user._id.toString());
//     const registeredEmails = usersToAdd.map(user => user.email);
//     const unregisteredEmails = emails.filter(email => !registeredEmails.includes(email));

//     // Filter out users already in the group and the creator
//     const newMembers = usersToAdd
//       .filter(user => !group.members.includes(user._id) && user._id.toString() !== req.user.id)
//       .map(user => user._id);

//     // If no new valid members to add
//     if (newMembers.length === 0 && unregisteredEmails.length === 0) {
//       return res.status(400).json({ 
//         message: 'All provided emails are either already in the group or belong to the creator'
//       });
//     }

//     // Add new members to the group if there are any
//     let message = '';
//     if (newMembers.length > 0) {
//       group.members.push(...newMembers);
//       await group.save();
//       message += `${newMembers.length} member(s) added successfully`;
//     } else {
//       message += 'No new members added';
//     }

//     // Prepare response
//     const response = {
//       success: true,
//       group,
//       addedMembers: newMembers.length,
//       message
//     };

//     // Include unregistered emails if any
//     if (unregisteredEmails.length > 0) {
//       response.unregisteredEmails = unregisteredEmails;
//       response.message += `. The following emails are not registered: ${unregisteredEmails.join(', ')}`;
//     }

//     res.status(200).json(response);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Error adding members', error });
//   }
// };

// exports.sendGroupMessage = async (req, res) => {
//   try {
//     const { groupId, content } = req.body;
    
//     const group = await Group.findById(groupId);
//     if (!group || !group.members.includes(req.user.id)) {
//       return res.status(403).json({ message: 'Unauthorized' });
//     }

//     const message = new Message({
//       sender: req.user.id,
//       group: groupId,
//       content
//     });

//     await message.save();
//     res.status(200).json({ success: true, message });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Error sending message' });
//   }
// };

exports.sendGroupMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { groupId, content } = req.fields || {};
    const file = req.files?.file; // Uploaded file
    const photo = req.files?.photo; // Uploaded photo


    // Validation
    if (!groupId) {
      return res.status(400).json({ success: false, message: 'Group ID is required' });
    }

    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const messageData = {
      sender: userId,
      group: groupId,
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

    const message = new GrpMsg(messageData);
    await message.save();

    res.status(200).json({ success: true, message });
  } catch (error) {
    console.error('Error sending group message:', error);
    res.status(500).json({ success: false, message: 'Error sending message', error: error.message });
  }
};

// Send group message reply
exports.sendGroupMessageReply = async (req, res) => {
  try {
    const userId = req.user.id;
    const { groupId, content, parentMessageId } = req.fields || {};
    const photo = req.files?.photo;
    const file = req.files?.file;

    if (!groupId) return res.status(400).json({ success: false, message: 'Group ID is required' });
    if (!parentMessageId) return res.status(400).json({ success: false, message: 'Parent message ID is required' });

    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(userId)) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const parentMessage = await GrpMsg.findById(parentMessageId);
    if (!parentMessage || parentMessage.group.toString() !== groupId) {
      return res.status(400).json({ success: false, message: 'Invalid parent message' });
    }

    const messageData = {
      sender: userId,
      group: groupId,
      content: content || "",
      type: "text",
      replies: [parentMessageId], // Store parent ID in replies array
    };

    const MAX_SIZE = 10 * 1024 * 1024;
    if (photo) {
      const photoData = fs.readFileSync(photo.path);
      if (photoData.length > MAX_SIZE) return res.status(400).json({ success: false, message: 'Photo exceeds 10MB limit' });
      messageData.photo = { data: photoData, contentType: photo.type };
      messageData.type = "photo";
      fs.unlinkSync(photo.path);
    } else if (file) {
      const fileData = fs.readFileSync(file.path);
      if (fileData.length > MAX_SIZE) return res.status(400).json({ success: false, message: 'File exceeds 10MB limit' });
      messageData.file = { data: fileData, contentType: file.type, fileName: file.name };
      messageData.type = "file";
      fs.unlinkSync(file.path);
    } else if (!content || content.trim() === "") {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty when no file or photo is provided' });
    }

    const message = new GrpMsg(messageData);
    await message.save();

    // Update parent message to include this reply
    await GrpMsg.findByIdAndUpdate(parentMessageId, { $push: { replies: message._id } });

    const populatedMessage = await GrpMsg.findById(message._id).populate('sender', 'username');
    res.status(200).json({ success: true, message: populatedMessage });
  } catch (error) {
    console.error('Error sending group message reply:', error);
    res.status(500).json({ success: false, message: 'Error sending group message reply', error: error.message });
  }
};

// Delete group message
exports.deleteGroupMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.body;

    if (!messageId) return res.status(400).json({ success: false, message: 'No message ID provided' });

    const message = await GrpMsg.findById(messageId);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'You can only delete your own messages' });
    }
    if (message.deletedAt) return res.status(400).json({ success: false, message: 'Message already deleted' });

    // Soft delete the message
    message.deletedAt = new Date();
    await message.save();

    // If this message is a reply, remove it from the parent's replies array
    if (message.replies && message.replies.length > 0) {
      const parentMessageId = message.replies[0];
      await GrpMsg.findByIdAndUpdate(parentMessageId, {
        $pull: { replies: messageId },
      });
    }

    res.status(200).json({ success: true, message: 'Message deleted', messageId });
  } catch (error) {
    console.error('Error deleting group message:', error);
    res.status(500).json({ success: false, message: 'Error deleting group message', error: error.message });
  }
};

// Edit group message
exports.editGroupMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId, content } = req.fields || {};

    if (!messageId) return res.status(400).json({ success: false, message: 'No message ID provided' });
    if (!content || content.trim() === "") return res.status(400).json({ success: false, message: 'New content cannot be empty' });

    const message = await GrpMsg.findById(messageId);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'You can only edit your own messages' });
    }
    if (message.deletedAt) return res.status(400).json({ success: false, message: 'Cannot edit a deleted message' });
    if (message.type !== 'text') return res.status(400).json({ success: false, message: 'Only text messages can be edited' });

    message.content = content;
    message.isEdited = true;
    message.updatedAt = new Date();
    await message.save();

    const populatedMessage = await GrpMsg.findById(messageId).populate('sender', 'username');
    res.status(200).json({ success: true, message: populatedMessage });
  } catch (error) {
    console.error('Error editing group message:', error);
    res.status(500).json({ success: false, message: 'Error editing group message', error: error.message });
  }
};

// Get group messages (unchanged from previous)
exports.getGroupMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const groupId = req.params.groupId;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(userId)) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const messages = await GrpMsg.find({ 
      group: groupId, 
      // deletedAt: null 
    })
      .populate('sender', 'username')
      .populate({ path: 'replies', populate: { path: 'sender', select: 'username' } })
      .sort({ timestamp: 1 }) // Ascending order
      .skip(skip)
      .limit(parseInt(limit));

    const totalMessages = await GrpMsg.countDocuments({ 
      group: groupId, 
      // deletedAt: null 
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
    res.status(500).json({ success: false, message: 'Error fetching group messages', error });
  }
};

// exports.getGroupMessages = async (req, res) => {
//   try {
//     const groupId = req.params.groupId;
    
//     const group = await Group.findById(groupId);
//     if (!group || !group.members.includes(req.user.id)) {
//       return res.status(403).json({ message: 'Unauthorized' });
//     }

//     const messages = await GrpMsg.find({ group: groupId })
//       .populate('sender', 'username')
//       .sort({ timestamp: 1 });

//     res.status(200).json({ success: true, messages });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Error fetching messages' });
//   }
// };

exports.getUserGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id })
      .populate('members', 'username email')
      .populate('creator', 'username');
    
    res.status(200).json({ success: true, groups });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching groups' });
  }
};

// Get group members
exports.getGroupMembers = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user.id;

    const group = await Group.findById(groupId)
      .populate('members', 'username email')
      .populate('creator', 'username email');

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // if (!group.members.some(member => member._id.toString() === userId)) {
    //   return res.status(403).json({ success: false, message: 'You are not a member of this group' });
    // }

    res.status(200).json({
      success: true,
      groupName: group.name,
      creator: group.creator,
      members: group.members,
      totalMembers: group.members.length
    });
  } catch (error) {
    console.error('Error fetching group members:', error);
    res.status(500).json({ success: false, message: 'Error fetching group members', error: error.message });
  }
};

// Add to existing exports.removeMemberFromGroup
exports.removeMemberFromGroup = async (req, res) => {
  try {
    const { groupId, memberId } = req.body;
    const userId = req.user.id;
    const io = req.app.get('io');

    if (!groupId || !memberId) {
      return res.status(400).json({ message: 'Group ID and member ID are required' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.creator.toString() !== userId) {
      return res.status(403).json({ message: 'Only group creator can remove members' });
    }

    if (memberId === group.creator.toString()) {
      return res.status(400).json({ message: 'Cannot remove the group creator' });
    }

    if (!group.members.includes(memberId)) {
      return res.status(400).json({ message: 'User is not a member of this group' });
    }

    group.members = group.members.filter(member => member.toString() !== memberId);
    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate('members', 'username email')
      .populate('creator', 'username email');

    // Notify group and removed member
    io.to(`group_${groupId}`).emit('memberRemoved', {
      groupId,
      memberId,
      removedBy: userId
    });
    io.to(memberId.toString()).emit('removedFromGroup', {
      groupId,
      groupName: group.name
    });

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
      group: updatedGroup
    });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ success: false, message: 'Error removing member', error: error.message });
  }
};

// Add to existing exports.quitGroup
exports.quitGroup = async (req, res) => {
  try {
    const { groupId } = req.body;
    const userId = req.user.id;
    const io = req.app.get('io');

    if (!groupId) {
      return res.status(400).json({ message: 'Group ID is required' });
    }

    // Fetch the group and populate members
    const group = await Group.findById(groupId).populate('members', '_id');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if the user is the creator
    if (group.creator.toString() === userId) {
      return res.status(403).json({ message: 'Creator cannot quit group. Delete it instead.' });
    }

    // Check if the user is a member
    const isMember = group.members.some(member => member._id.toString() === userId);
    if (!isMember) {
      return res.status(400).json({ message: 'You are not a member of this group' });
    }

    // Remove the user from the group
    group.members = group.members.filter(member => member._id.toString() !== userId);
    await group.save();

    // Emit Socket.IO event to notify others
    if (io) {
      io.to(`group_${groupId}`).emit('memberQuit', {
        groupId,
        memberId: userId
      });
    } else {
      console.warn('Socket.IO instance not available');
    }

    return res.status(200).json({
      success: true,
      message: 'You have quit the group successfully'
    });
  } catch (error) {
    console.error('Error quitting group:', error);
    return res.status(500).json({ success: false, message: 'Error quitting group', error: error.message });
  }
};

// Add to existing exports.deleteGroup
exports.deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.body;
    const userId = req.user.id;
    const io = req.app.get('io');

    if (!groupId) {
      return res.status(400).json({ message: 'Group ID is required' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.creator.toString() !== userId) {
      return res.status(403).json({ message: 'Only the creator can delete the group' });
    }

    await Group.findByIdAndDelete(groupId);

    if (io) {
      io.to(`group_${groupId}`).emit('groupDeleted', { groupId });
    } else {
      console.warn('Socket.IO instance not available');
    }

    return res.status(200).json({
      success: true,
      message: 'Group deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    return res.status(500).json({ success: false, message: 'Error deleting group', error: error.message });
  }
};