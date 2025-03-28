// routes/groupChatRoute.js
const express = require('express');
const router = express.Router();
const groupChatController = require("../controllers/groupController");
const { authenticate } = require('../middleware/authMiddleware');
const formidable = require("express-formidable");

router.post('/create', authenticate, groupChatController.createGroup);
router.post('/add-member', authenticate, groupChatController.addMemberToGroup);
router.post('/message', authenticate, formidable(),groupChatController.sendGroupMessage);
router.post('/grp-reply', authenticate, formidable(),groupChatController.sendGroupMessageReply);
router.post('/grp/delete', authenticate, groupChatController.deleteGroupMessage);
router.post('/grp/edit', authenticate, formidable() ,groupChatController.editGroupMessage);
router.get('/messages/:groupId', authenticate, groupChatController.getGroupMessages);
router.get('/my-groups', authenticate, groupChatController.getUserGroups);

router.get('/recent-group-senders', authenticate, groupChatController.getRecentGroupSenders);

// New routes
router.get('/members/:groupId', authenticate, groupChatController.getGroupMembers);
router.post('/remove-member', authenticate, groupChatController.removeMemberFromGroup);
router.post('/quit', authenticate, groupChatController.quitGroup);
router.post('/delete', authenticate, groupChatController.deleteGroup);

module.exports = router;