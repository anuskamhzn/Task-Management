const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const {authenticate} = require('../middleware/authMiddleware');

// Private Message Send
router.post('/private', authenticate, messageController.sendPrivateMessage);
// Group Message Send
router.post('/group', authenticate, messageController.sendProjectMessage);
// Private Message History
router.get('/private/:recipientId', authenticate, messageController.getPrivateMessages);

// Project Message History
router.get('/project/:projectId', authenticate, messageController.getProjectMessages);

module.exports = router;
