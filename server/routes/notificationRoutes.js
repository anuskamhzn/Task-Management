const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/authMiddleware');

// Get notifications for the logged-in user
router.get('/', authenticate, notificationController.getNotifications);

// Mark a specific notification as read
router.put('/:notificationId/read', authenticate, notificationController.markNotificationAsRead);

// Mark all notifications as read for the user
router.put('/read-all', authenticate, notificationController.markAllNotificationsAsRead);

// Get notification preferences
router.get('/preferences', authenticate, notificationController.getNotificationPreferences);

// Save notification preferences
router.post('/preferences', authenticate, notificationController.saveNotificationPreferences);

module.exports = router;