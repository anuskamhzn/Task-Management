// routes/groupChatRoute.js
const express = require('express');
const router = express.Router();
const groupChatController = require("../controllers/groupController");
const { authenticate } = require('../middleware/authMiddleware');
const formidable = require("express-formidable");

router.post('/create', authenticate, groupChatController.createGroup);
router.post('/add-member', authenticate, groupChatController.addMemberToGroup);
router.post('/message', authenticate, formidable(),groupChatController.sendGroupMessage);
router.get('/messages/:groupId', authenticate, groupChatController.getGroupMessages);
router.get('/my-groups', authenticate, groupChatController.getUserGroups);

module.exports = router;