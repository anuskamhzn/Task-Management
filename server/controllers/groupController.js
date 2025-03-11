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

exports.addMemberToGroup = async (req, res) => {
  try {
    const { groupId, emails } = req.body;

    // Validate inputs
    if (!groupId || !emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: 'Group ID and an array of emails are required' });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only group creator can add members' });
    }

    // Find users by their emails
    const usersToAdd = await User.find({ email: { $in: emails } });

    // Identify registered and unregistered emails
    const registeredUserIds = usersToAdd.map(user => user._id.toString());
    const registeredEmails = usersToAdd.map(user => user.email);
    const unregisteredEmails = emails.filter(email => !registeredEmails.includes(email));

    // Filter out users already in the group and the creator
    const newMembers = usersToAdd
      .filter(user => !group.members.includes(user._id) && user._id.toString() !== req.user.id)
      .map(user => user._id);

    // If no new valid members to add
    if (newMembers.length === 0 && unregisteredEmails.length === 0) {
      return res.status(400).json({ 
        message: 'All provided emails are either already in the group or belong to the creator'
      });
    }

    // Add new members to the group if there are any
    let message = '';
    if (newMembers.length > 0) {
      group.members.push(...newMembers);
      await group.save();
      message += `${newMembers.length} member(s) added successfully`;
    } else {
      message += 'No new members added';
    }

    // Prepare response
    const response = {
      success: true,
      group,
      addedMembers: newMembers.length,
      message
    };

    // Include unregistered emails if any
    if (unregisteredEmails.length > 0) {
      response.unregisteredEmails = unregisteredEmails;
      response.message += `. The following emails are not registered: ${unregisteredEmails.join(', ')}`;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error adding members', error });
  }
};

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

exports.getGroupMessages = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    
    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const messages = await GrpMsg.find({ group: groupId })
      .populate('sender', 'username')
      .sort({ timestamp: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching messages' });
  }
};

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