const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authenticate = require('../middleware/authMiddleware');

// Apply the middleware to all routes that need authentication
router.post('/create', authenticate, projectController.createProject);
router.get('/', authenticate, projectController.getAllProjects);
router.patch('/status', authenticate, projectController.updateProjectStatus);

module.exports = router;
