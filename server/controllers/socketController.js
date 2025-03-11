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
          throw new Error('File or photo exceeds 10MB limit');
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
          throw new Error('File or photo exceeds 10MB limit');
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

    socket.on('disconnect', () => {
      // console.log(`User ${socket.user.id} disconnected`);
    });
  });
};