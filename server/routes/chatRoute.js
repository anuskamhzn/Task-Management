const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const {authenticate} = require('../middleware/authMiddleware');

// Private Message Send
router.get('/all-users', authenticate, chatController.users);
router.get('/added-users', authenticate, chatController.getAddedUsers);
router.post('/add', authenticate, chatController.addUserToChat);

module.exports = router;
