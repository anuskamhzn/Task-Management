const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authenticate = require('../middleware/authMiddleware');

// Apply the middleware to all routes that need authentication
router.post('/create', authenticate, taskController.createTask);
router.get('/:taskId', authenticate, taskController.getTasksByOwner);
router.patch('/status', authenticate, taskController.updateTaskStatus);
router.post('/create-task/:mainTaskId', authenticate, taskController.createSubTask);
router.get('/subtask/:mainTaskId', authenticate, taskController.getSubTasksByMainTask);
router.patch('/subtask/status', authenticate, taskController.updateSubTaskStatus);

module.exports = router;
