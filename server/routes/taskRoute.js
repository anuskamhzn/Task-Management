const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authenticate = require('../middleware/authMiddleware');

// Apply the middleware to all routes that need authentication
router.post('/create', authenticate, taskController.createTask);
router.get('/:projectId', authenticate, taskController.getTasksByProject);
router.patch('/status', authenticate, taskController.updateTaskStatus);

module.exports = router;
