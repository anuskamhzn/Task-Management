const Message = require('../models/Message');
const Project = require('../models/Project');
const Group = require('../models/GroupChat');

exports.setupSocket = (io) => {
  io.on('connection', (socket) => {
    // Join the socket to its user ID room for private messaging
    socket.join(socket.user?.id || socket.id);
    //console.log(`User ${socket.user.id} connected`);

    // Private message event handler
    socket.on('sendPrivateMessage', async ({ recipientId, content }) => {
      try {
        if (!socket.user?.id) throw new Error('No sender ID');
        if (!recipientId) throw new Error('No recipient ID');
        const message = new Message({ sender: socket.user.id, recipient: recipientId, content });
        await message.save();
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'username avatar')
          .populate('recipient', 'username avatar');
        // console.log('Saved and populated message:', populatedMessage);
        io.to(recipientId).emit('newMessage', populatedMessage);
        socket.emit('newMessage', populatedMessage);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Error sending message', error });
      }
    });

    // Project-specific (group) message handler (unchanged)
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

        // Broadcast the message to the project room
        io.to(`project_${projectId}`).emit('newMessage', message);
        socket.emit('newMessage', message);
      } catch (error) {
        socket.emit('error', { message: 'Error sending project message', error });
      }
    });

    // Joining project rooms (group chats) (unchanged)
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

    // Handling disconnection (optional)
    socket.on('disconnect', () => {
      //console.log(`User ${socket.user.id} disconnected`);
    });
    // New group message handler
// Updated group message handler
socket.on('sendGroupMessage', async ({ groupId, content }) => {
  try {
    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(socket.user.id)) {
      socket.emit('error', { message: 'Unauthorized' });
      return;
    }

    const message = new Message({
      sender: socket.user.id,
      group: groupId,
      content,
    });

    await message.save();

    // Populate the sender field before emitting
    const populatedMessage = await Message.findById(message._id).populate('sender', 'username avatar');
    io.to(`group_${groupId}`).emit('newMessage', populatedMessage);
    socket.emit('newMessage', populatedMessage);
  } catch (error) {
    console.error('Error sending group message:', error);
    socket.emit('error', { message: 'Error sending group message', error });
  }
});

// Join group room (unchanged)
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

// Handling disconnection (optional)
socket.on('disconnect', () => {
  // console.log(`User ${socket.user.id} disconnected`);
});
  });
};