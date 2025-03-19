const Message = require('../models/Message');
const GrpMsg = require('../models/GrpMsg');
const Project = require('../models/Project');
const Group = require('../models/GroupChat');
const fs = require('fs');

exports.setupSocket = (io) => {
  io.on('connection', (socket) => {
    socket.join(socket.user?.id || socket.id);

    // Private message handler (unchanged, still using Message model)
    socket.on('sendPrivateMessage', async ({ recipientId, content, photo, file }) => {
      try {
        if (!socket.user?.id) throw new Error('No sender ID');
        if (!recipientId) throw new Error('No recipient ID');

        const messageData = {
          sender: socket.user.id,
          recipient: recipientId,
          content: content || "",
          type: "text",
        };

        if (photo) {
          const photoBuffer = Buffer.from(photo.data, 'base64');
          messageData.photo = {
            data: photoBuffer,
            contentType: photo.contentType || 'image/jpeg',
          };
          messageData.type = "photo";
        }
        else if (file) {
          const fileBuffer = Buffer.from(file.data, 'base64');
          messageData.file = {
            data: fileBuffer,
            contentType: file.contentType || 'application/octet-stream',
            fileName: file.fileName || 'uploaded_file',
          };
          messageData.type = "file";
        }
        else if (!content || content.trim() === "") {
          throw new Error('Message content cannot be empty when no file or photo is provided');
        }

        const MAX_SIZE = 10 * 1024 * 1024;
        if (messageData.photo?.data?.length > MAX_SIZE || messageData.file?.data?.length > MAX_SIZE) {
          // throw new Error('File or photo exceeds 10MB limit');
          return callback('File or photo exceeds 10MB limit');
        }

        const message = new Message(messageData);
        await message.save();

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'username avatar')
          .populate('recipient', 'username avatar');

        io.to(recipientId).emit('newMessage', populatedMessage);
        socket.emit('newMessage', populatedMessage);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Error sending message', error: error.message });
      }
    });

    // New reply handler for private messages
    socket.on('sendPrivateMessageReply', async ({ recipientId, content, photo, file, parentMessageId }) => {
      try {
        if (!socket.user?.id) throw new Error('No sender ID');
        if (!recipientId) throw new Error('No recipient ID');
        if (!parentMessageId) throw new Error('No parent message ID specified');

        const parentMessage = await Message.findById(parentMessageId);
        if (!parentMessage) throw new Error('Parent message not found');

        const isSenderOrRecipient = (
          (parentMessage.sender.toString() === socket.user.id && parentMessage.recipient.toString() === recipientId) ||
          (parentMessage.sender.toString() === recipientId && parentMessage.recipient.toString() === socket.user.id)
        );
        if (!isSenderOrRecipient) {
          throw new Error('Parent message is not part of this conversation');
        }

        const messageData = {
          sender: socket.user.id,
          recipient: recipientId,
          content: content || "",
          type: "text",
          parentMessageId: parentMessageId, // Save parentMessageId in the reply message
        };

        const MAX_SIZE = 10 * 1024 * 1024;
        if (photo) {
          const photoBuffer = Buffer.from(photo.data, 'base64');
          messageData.photo = { data: photoBuffer, contentType: photo.contentType || 'image/jpeg' };
          messageData.type = "photo";
        } else if (file) {
          const fileBuffer = Buffer.from(file.data, 'base64');
          messageData.file = { data: fileBuffer, contentType: file.contentType || 'application/octet-stream', fileName: file.fileName || 'uploaded_file' };
          messageData.type = "file";
        } else if (!content || content.trim() === "") {
          throw new Error('Message content cannot be empty when no file or photo is provided');
        }

        if (messageData.photo?.data?.length > MAX_SIZE || messageData.file?.data?.length > MAX_SIZE) {
          throw new Error('File or photo exceeds 10MB limit');
        }

        const message = new Message(messageData);
        await message.save();

        await Message.findByIdAndUpdate(parentMessageId, { $push: { replies: message._id } });

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'username avatar')
          .populate('recipient', 'username avatar')
          .populate({ path: 'replies', populate: { path: 'sender', select: 'username' } });

        io.to(recipientId).emit('newMessageReply', populatedMessage);
        socket.emit('newMessageReply', populatedMessage);
      } catch (error) {
        console.error('Error sending reply:', error);
        socket.emit('error', { message: 'Error sending reply', error: error.message });
      }
    });

    // Delete private message (updated to handle replies)
    // socket.on('deletePrivateMessage', async ({ messageId }) => {
    //   try {
    //     if (!socket.user?.id) throw new Error('No sender ID');
    //     if (!messageId) throw new Error('No message ID provided');

    //     const message = await Message.findById(messageId);
    //     if (!message) throw new Error('Message not found');
    //     if (message.sender.toString() !== socket.user.id) {
    //       throw new Error('You can only delete your own messages');
    //     }
    //     if (message.deletedAt) throw new Error('Message already deleted');

    //     // Soft delete the message
    //     message.deletedAt = new Date();
    //     await message.save();

    //     // If this message is a reply, remove it from the parent's replies array
    //     if (message.replies && message.replies.length > 0) {
    //       const parentMessageId = message.replies[0]; // Assuming one parent per reply
    //       await Message.findByIdAndUpdate(parentMessageId, {
    //         $pull: { replies: messageId },
    //       });
    //     }

    //     const updatedMessage = await Message.findById(messageId)
    //       .populate('sender', 'username avatar')
    //       .populate('recipient', 'username avatar');

    //     // Notify both sender and recipient
    //     // io.to(message.recipient.toString()).emit('messageDeleted', { messageId });
    //     io.to(message.recipient.toString()).emit('messageDeleted', updatedMessage);
    //     socket.emit('messageDeleted', { messageId });
    //   } catch (error) {
    //     console.error('Error deleting private message:', error);
    //     socket.emit('error', { message: 'Error deleting private message', error: error.message });
    //   }
    // });
    socket.on('deletePrivateMessage', async ({ messageId }) => {
      try {
        if (!socket.user?.id) throw new Error('No sender ID');
        if (!messageId) throw new Error('No message ID provided');
    
        const message = await Message.findById(messageId);
        if (!message) throw new Error('Message not found');
        if (message.sender.toString() !== socket.user.id) {
          throw new Error('You can only delete your own messages');
        }
        if (message.deletedAt) throw new Error('Message already deleted');
    
        message.deletedAt = new Date();
        await message.save();
    
        const updatedMessage = await Message.findById(messageId)
          .populate('sender', 'username avatar')
          .populate('recipient', 'username avatar');
    
        io.to(message.recipient.toString()).emit('messageDeleted', updatedMessage);
        socket.emit('messageDeleted', updatedMessage); // Send full updated message
      } catch (error) {
        console.error('Error deleting private message:', error);
        socket.emit('error', { message: 'Error deleting private message', error: error.message });
      }
    });

    // Edit private message
    socket.on('editPrivateMessage', async ({ messageId, content }) => {
      try {
        if (!socket.user?.id) throw new Error('No sender ID');
        if (!messageId) throw new Error('No message ID provided');
        if (!content || content.trim() === "") throw new Error('New content cannot be empty');

        const message = await Message.findById(messageId);
        if (!message) throw new Error('Message not found');
        if (message.sender.toString() !== socket.user.id) {
          throw new Error('You can only edit your own messages');
        }
        if (message.deletedAt) throw new Error('Cannot edit a deleted message');
        if (message.type !== 'text') throw new Error('Only text messages can be edited');

        message.content = content;
        message.updatedAt = new Date(); // Add an updatedAt field if you want to track edits
        message.isEdited = true; // Ensure this is set
        await message.save();

        const populatedMessage = await Message.findById(messageId)
          .populate('sender', 'username avatar')
          .populate('recipient', 'username avatar');

        // Notify both sender and recipient
        io.to(message.recipient.toString()).emit('messageEdited', populatedMessage);
        socket.emit('messageEdited', populatedMessage);
      } catch (error) {
        console.error('Error editing message:', error);
        socket.emit('error', { message: 'Error editing message', error: error.message });
      }
    });

    // Project message handler (unchanged, still using Message model)
    socket.on('sendProjectMessage', async ({ projectId, content }) => {
      try {
        const project = await Project.findById(projectId);
        if (!project || !project.members.includes(socket.user.id)) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        const message = new Message({
          sender: socket.user.id,
          project: projectId,
          content,
        });

        await message.save();
        io.to(`project_${projectId}`).emit('newMessage', message);
        socket.emit('newMessage', message);
      } catch (error) {
        socket.emit('error', { message: 'Error sending project message', error });
      }
    });

    socket.on('joinProjectRoom', async (projectId) => {
      try {
        const project = await Project.findById(projectId);
        if (!project || !project.members.includes(socket.user.id)) {
          socket.emit('error', { message: 'You are not a member of this project' });
          return;
        }
        socket.join(`project_${projectId}`);
        socket.emit('joinedRoom', { projectId });
      } catch (error) {
        socket.emit('error', { message: 'Error joining project room', error });
      }
    });

    // Group message handler using GrpMsg model
    socket.on('sendGroupMessage', async ({ groupId, content, photo, file }) => {
      try {
        const group = await Group.findById(groupId);
        if (!group || !group.members.includes(socket.user.id)) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        const messageData = {
          sender: socket.user.id,
          group: groupId,
          content: content || "",
          type: "text",
        };

        const MAX_SIZE = 10 * 1024 * 1024;

        if (photo) {
          const photoBuffer = Buffer.from(photo.data, 'base64');
          messageData.photo = {
            data: photoBuffer,
            contentType: photo.contentType || 'image/jpeg',
          };
          messageData.type = "photo";
        }
        else if (file) {
          const fileBuffer = Buffer.from(file.data, 'base64');
          messageData.file = {
            data: fileBuffer,
            contentType: file.contentType || 'application/octet-stream',
            fileName: file.fileName || 'uploaded_file',
          };
          messageData.type = "file";
        }
        else if (!content || content.trim() === "") {
          throw new Error('Message content cannot be empty when no file or photo is provided');
        }

        if (messageData.photo?.data?.length > MAX_SIZE || messageData.file?.data?.length > MAX_SIZE) {
          // throw new Error('File or photo exceeds 10MB limit');
          return callback('File or photo exceeds 10MB limit');
        }

        const message = new GrpMsg(messageData);
        await message.save();

        const populatedMessage = await GrpMsg.findById(message._id)
          .populate('sender', 'username avatar');

        io.to(`group_${groupId}`).emit('newMessage', populatedMessage);
        socket.emit('newMessage', populatedMessage);
      } catch (error) {
        console.error('Error sending group message:', error);
        socket.emit('error', { message: 'Error sending group message', error: error.message });
      }
    });

    // Send group message reply
    socket.on('sendGroupMessageReply', async ({ groupId, content, photo, file, parentMessageId }) => {
      try {
        const userId = socket.user.id;
        if (!userId) throw new Error('No sender ID');
        if (!groupId) throw new Error('No group ID provided');
        if (!parentMessageId) throw new Error('No parent message ID provided');

        const group = await Group.findById(groupId);
        if (!group || !group.members.includes(userId)) {
          throw new Error('Unauthorized');
        }

        const parentMessage = await GrpMsg.findById(parentMessageId);
        if (!parentMessage || parentMessage.group.toString() !== groupId) {
          throw new Error('Invalid parent message');
        }

        const messageData = {
          sender: userId,
          group: groupId,
          content: content || "",
          type: "text",
          parentMessageId: parentMessageId, // Save parentMessageId in the reply message
        };

        const MAX_SIZE = 10 * 1024 * 1024;
        if (photo) {
          const photoBuffer = Buffer.from(photo.data, 'base64');
          messageData.photo = { data: photoBuffer, contentType: photo.contentType || 'image/jpeg' };
          messageData.type = "photo";
        } else if (file) {
          const fileBuffer = Buffer.from(file.data, 'base64');
          messageData.file = { data: fileBuffer, contentType: file.contentType || 'application/octet-stream', fileName: file.fileName || 'uploaded_file' };
          messageData.type = "file";
        } else if (!content || content.trim() === "") {
          throw new Error('Message content cannot be empty when no file or photo is provided');
        }

        if (messageData.photo?.data?.length > MAX_SIZE || messageData.file?.data?.length > MAX_SIZE) {
          throw new Error('File or photo exceeds 10MB limit');
        }

        const message = new GrpMsg(messageData);
        await message.save();

        await GrpMsg.findByIdAndUpdate(parentMessageId, { $push: { replies: message._id } });

        const populatedMessage = await GrpMsg.findById(message._id)
          .populate('sender', 'username avatar')
          .populate({ path: 'replies', populate: { path: 'sender', select: 'username' } });

        io.to(`group_${groupId}`).emit('newGroupMessageReply', populatedMessage);
        socket.emit('newGroupMessageReply', populatedMessage);
      } catch (error) {
        console.error('Error sending group message reply:', error);
        socket.emit('error', { message: 'Error sending group message reply', error: error.message });
      }
    });

    // Delete group message (updated to handle replies)
    // socket.on('deleteGroupMessage', async ({ messageId }) => {
    //   try {
    //     if (!socket.user?.id) throw new Error('No sender ID');
    //     if (!messageId) throw new Error('No message ID provided');

    //     const message = await GrpMsg.findById(messageId);
    //     if (!message) throw new Error('Message not found');
    //     if (message.sender.toString() !== socket.user.id) {
    //       throw new Error('You can only delete your own messages');
    //     }
    //     if (message.deletedAt) throw new Error('Message already deleted');

    //     // Soft delete the message
    //     message.deletedAt = new Date();
    //     await message.save();

    //     // If this message is a reply, remove it from the parent's replies array
    //     if (message.replies && message.replies.length > 0) {
    //       const parentMessageId = message.replies[0]; // Assuming one parent per reply
    //       await GrpMsg.findByIdAndUpdate(parentMessageId, {
    //         $pull: { replies: messageId },
    //       });
    //     }

    //     const updatedMessage = await GrpMsg.findById(messageId)
    //       .populate('sender', 'username avatar')
    //       .populate('recipient', 'username avatar');

    //     // Notify all group members
    //     // io.to(`group_${message.group.toString()}`).emit('groupMessageDeleted', { messageId });
    //     io.to(`group_${message.group.toString()}`).emit('groupMessageDeleted', updatedMessage);
    //     socket.emit('groupMessageDeleted', { messageId });
    //   } catch (error) {
    //     console.error('Error deleting group message:', error);
    //     socket.emit('error', { message: 'Error deleting group message', error: error.message });
    //   }
    // });

    socket.on('deleteGroupMessage', async ({ messageId }) => {
      try {
        if (!socket.user?.id) throw new Error('No sender ID');
        if (!messageId) throw new Error('No message ID provided');
    
        const message = await GrpMsg.findById(messageId);
        if (!message) throw new Error('Message not found');
        if (message.sender.toString() !== socket.user.id) {
          throw new Error('You can only delete your own messages');
        }
        if (message.deletedAt) throw new Error('Message already deleted');
    
        message.deletedAt = new Date();
        await message.save();
    
        const updatedMessage = await GrpMsg.findById(messageId)
          .populate('sender', 'username avatar');
    
        io.to(`group_${message.group.toString()}`).emit('groupMessageDeleted', updatedMessage);
        socket.emit('groupMessageDeleted', updatedMessage); // Send full updated message
      } catch (error) {
        console.error('Error deleting group message:', error);
        socket.emit('error', { message: 'Error deleting group message', error: error.message });
      }
    });

    // Edit group message
    socket.on('editGroupMessage', async ({ messageId, content }) => {
      try {
        if (!socket.user?.id) throw new Error('No sender ID');
        if (!messageId) throw new Error('No message ID provided');
        if (!content || content.trim() === "") throw new Error('New content cannot be empty');

        const message = await GrpMsg.findById(messageId);
        if (!message) throw new Error('Message not found');
        if (message.sender.toString() !== socket.user.id) {
          throw new Error('You can only edit your own messages');
        }
        if (message.deletedAt) throw new Error('Cannot edit a deleted message');
        if (message.type !== 'text') throw new Error('Only text messages can be edited');

        message.content = content;
        message.isEdited = true;
        message.updatedAt = new Date();
        message.isEdited = true; // Ensure this is set
        await message.save();

        const populatedMessage = await GrpMsg.findById(messageId)
          .populate('sender', 'username avatar');

        io.to(`group_${message.group.toString()}`).emit('groupMessageEdited', populatedMessage);
        socket.emit('groupMessageEdited', populatedMessage);
      } catch (error) {
        console.error('Error editing group message:', error);
        socket.emit('error', { message: 'Error editing group message', error: error.message });
      }
    });

    socket.on('joinGroupRoom', async (groupId) => {
      try {
        const group = await Group.findById(groupId);
        if (!group || !group.members.includes(socket.user.id)) {
          socket.emit('error', { message: 'You are not a member of this group' });
          return;
        }
        socket.join(`group_${groupId}`);
        socket.emit('joinedRoom', { groupId });
      } catch (error) {
        socket.emit('error', { message: 'Error joining group room', error });
      }
    });

    // Add these new event handlers for group management
    socket.on('requestGroupMembers', async (groupId) => {
      try {
        const group = await Group.findById(groupId)
          .populate('members', 'username email')
          .populate('creator', 'username email');

        if (!group || !group.members.includes(socket.user.id)) {
          socket.emit('error', { message: 'Unauthorized or group not found' });
          return;
        }

        socket.emit('groupMembers', {
          groupId,
          members: group.members,
          creator: group.creator
        });
      } catch (error) {
        socket.emit('error', { message: 'Error fetching group members', error });
      }
    });

    // Add new handlers
    socket.on('addMemberToGroup', async ({ groupId, emails }) => {
      try {
        if (!socket.user?.id) throw new Error('No sender ID');
        if (!groupId || !emails || !Array.isArray(emails)) {
          throw new Error('Group ID and emails array are required');
        }

        const group = await Group.findById(groupId);
        if (!group) throw new Error('Group not found');
        if (group.creator.toString() !== socket.user.id) {
          throw new Error('Only group creator can add members');
        }

        const usersToAdd = await User.find({ email: { $in: emails } });
        const newMembers = usersToAdd
          .filter(user => !group.members.includes(user._id) && user._id.toString() !== socket.user.id)
          .map(user => user._id);

        if (newMembers.length === 0) {
          throw new Error('No valid new members to add');
        }

        group.members.push(...newMembers);
        await group.save();

        const updatedGroup = await Group.findById(groupId)
          .populate('members', 'username email')
          .populate('creator', 'username email');

        io.to(`group_${groupId}`).emit('memberAdded', {
          groupId,
          newMembers: updatedGroup.members.filter(member => newMembers.includes(member._id)),
          addedBy: socket.user.id
        });

        newMembers.forEach(memberId => {
          io.to(memberId.toString()).emit('addedToGroup', {
            groupId,
            groupName: group.name
          });
        });

        socket.emit('memberAddSuccess', { groupId, addedMembers: newMembers.length });
      } catch (error) {
        console.error('Error adding group members:', error);
        socket.emit('error', { message: 'Error adding group members', error: error.message });
      }
    });

    socket.on('removeMemberFromGroup', async ({ groupId, memberId }) => {
      try {
        if (!socket.user?.id) throw new Error('No sender ID');
        if (!groupId || !memberId) throw new Error('Group ID and member ID are required');

        const group = await Group.findById(groupId);
        if (!group) throw new Error('Group not found');
        if (group.creator.toString() !== socket.user.id) {
          throw new Error('Only group creator can remove members');
        }
        if (memberId === group.creator.toString()) {
          throw new Error('Cannot remove the group creator');
        }
        if (!group.members.includes(memberId)) {
          throw new Error('User is not a member of this group');
        }

        group.members = group.members.filter(member => member.toString() !== memberId);
        await group.save();

        const updatedGroup = await Group.findById(groupId)
          .populate('members', 'username email')
          .populate('creator', 'username email');

        io.to(`group_${groupId}`).emit('memberRemoved', {
          groupId,
          memberId,
          removedBy: socket.user.id
        });
        io.to(memberId.toString()).emit('removedFromGroup', {
          groupId,
          groupName: group.name
        });

        socket.emit('memberRemoveSuccess', { groupId, memberId });
      } catch (error) {
        console.error('Error removing group member:', error);
        socket.emit('error', { message: 'Error removing group member', error: error.message });
      }
    });

    // socket.on('quitGroup', async (groupId) => {
    //   try {
    //     if (!socket.user?.id) throw new Error('No sender ID');
    //     if (!groupId) throw new Error('Group ID is required');

    //     const group = await Group.findById(groupId);
    //     if (!group || !group.members.includes(socket.user?.id)) {
    //       throw new Error('You are not a member of this group');
    //     }
    //     if (group.creator.toString() === socket.user.id) {
    //       throw new Error('Creator cannot quit group. Delete it instead.');
    //     }

    //     group.members = group.members.filter(member => member.toString() !== socket.user.id);
    //     await group.save();

    //     socket.leave(`group_${groupId}`);
    //     io.to(`group_${groupId}`).emit('memberQuit', {
    //       groupId,
    //       memberId: socket.user.id
    //     });
    //     socket.emit('quitGroupSuccess', { groupId });
    //   } catch (error) {
    //     console.error('Error quitting group:', error);
    //     socket.emit('error', { message: 'Error quitting group', error: error.message });
    //   }
    // });

    // socket.on('deleteGroup', async (groupId) => {
    //   try {
    //     if (!socket.user?.id) throw new Error('No sender ID');
    //     if (!groupId) throw new Error('Group ID is required');

    //     const group = await Group.findById(groupId);
    //     if (!group) throw new Error('Group not found');
    //     if (group.creator.toString() !== socket.user.id) {
    //       throw new Error('Only group creator can delete the group');
    //     }

    //     io.to(`group_${groupId}`).emit('groupDeleted', {
    //       groupId,
    //       groupName: group.name
    //     });

    //     await GrpMsg.deleteMany({ group: groupId });
    //     await Group.findByIdAndDelete(groupId);

    //     socket.emit('deleteGroupSuccess', { groupId });
    //   } catch (error) {
    //     console.error('Error deleting group:', error);
    //     socket.emit('error', { message: 'Error deleting group', error: error.message });
    //   }
    // });

    socket.on('disconnect', () => {
      // console.log(`User ${socket.user.id} disconnected`);
    });
  });
};