const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const projectRoute = require('./routes/projectRoute');
const taskRoute = require('./routes/taskRoute');
const messageRoute = require('./routes/messageRoute');
const chatRoute = require('./routes/chatRoute');
const groupChatRoute = require('./routes/groupChatRoute');
const socketController = require('./controllers/socketController'); // Import socket controller
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken'); // For token verification

const app = express();

// Create HTTP server and integrate with Socket.IO
const server = http.createServer(app);
// Configure CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/project', projectRoute);
app.use('/api/task', taskRoute);
app.use('/api/message', messageRoute);
app.use('/api/chat', chatRoute);
app.use('/api/group-chat',groupChatRoute);

// Catch-all route for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Setup Socket.IO event handling using socketController
socketController.setupSocket(io);

// Middleware to authenticate Socket.IO connections using JWT
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: No token'));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
    socket.user = decoded;
    next();
  });
});

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    //console.log('Socket disconnected:', socket.id);
  });
});

// Error handling middleware (catch-all)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
