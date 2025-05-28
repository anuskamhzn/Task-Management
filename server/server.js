const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const projectRoute = require('./routes/projectRoute');
const taskRoute = require('./routes/taskRoute');
const messageRoute = require('./routes/messageRoute');
const chatRoute = require('./routes/chatRoute');
const groupChatRoute = require('./routes/groupChatRoute');
const notificationRoutes = require('./routes/notificationRoutes');
const socketController = require('./controllers/socketController');
const { startScheduler } = require('./utils/scheduler');
const { startOverdueJob } = require('./utils/overdueJob');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const formidable = require('express-formidable');

const app = express();

// Define CORS options
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000' || `https://123taskify.netlify.app`,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
};

// Apply CORS to Express
app.use(cors(corsOptions));

// Create HTTP server and integrate with Socket.IO
const server = http.createServer(app);
const io = socketIo(server, {
  cors: corsOptions,
  maxHttpBufferSize: 10 * 1024 * 1024, // 10MB limit
  pingTimeout: 60000, // Increase timeout to 60 seconds
});

// Attach Socket.IO instance to the Express app
app.set('io', io); // This is the key fix!

// Make io globally available
global.io = io;

startScheduler(io); // Pass the Socket.IO instance
// Start the overdue job
startOverdueJob(io);

// Connect to MongoDB
connectDB();


// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Add URL-encoded parser

app.get('/', (req, res) => {
  res.send('API is running');
});


// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/project', projectRoute);
app.use('/api/task', taskRoute);
app.use('/api/message', messageRoute);
app.use('/api/chat', chatRoute);
app.use('/api/group-chat', groupChatRoute);
app.use('/api/notification', notificationRoutes);


// Catch-all route for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Setup Socket.IO with authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error: No token'));

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Authentication error: Invalid token'));
    socket.user = decoded;
    // Rough payload size check (approximate)
    const payloadSize = JSON.stringify(socket.handshake).length;
    const MAX_PAYLOAD_SIZE = 10 * 1024 * 1024; // 10MB
    if (payloadSize > MAX_PAYLOAD_SIZE) {
      return next(new Error('Payload exceeds 10MB limit'));
    }
    next();
  });
});

// Socket.IO event handling
socketController.setupSocket(io);

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    // console.log('Socket disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Formidable middleware for file uploads
app.use(formidable());

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});