const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const {authenticate} = require('../middleware/authMiddleware');
const formidable = require("express-formidable");

// Private Message Send
router.post('/private', authenticate, formidable(), messageController.sendPrivateMessage);
// Group Message Send
router.post('/group', authenticate, messageController.sendProjectMessage);
// Private Message History
router.get('/private/:recipientId', authenticate, messageController.getPrivateMessages);

// Project Message History
router.get('/project/:projectId', authenticate, messageController.getProjectMessages);

module.exports = router;
