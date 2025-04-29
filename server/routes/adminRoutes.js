const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middleware/authMiddleware');
const formidable = require('express-formidable'); // for handling file uploads

router.get('/users', isAdmin, adminController.users);
router.get('/recent-users', isAdmin, adminController.getRecentUsers);
router.get('/all-users', isAdmin, adminController.getAllUsers);
router.get('/analytics', isAdmin, adminController.getWebsiteAnalytics);
router.get('/chartTask', isAdmin, adminController.getTasksPerMonth);
router.get('/chartProject', isAdmin, adminController.getProjectsPerMonth);
router.delete('/users/:userId', isAdmin, adminController.deleteUser);

module.exports = router;
