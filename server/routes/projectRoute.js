const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authenticate = require('../middleware/authMiddleware');

// Apply the middleware to all routes that need authentication
router.post('/create', authenticate, projectController.createProject);
router.post('/create-project/:mainProjectId', authenticate, projectController.createSubProject);
router.get('/approve-invite', projectController.approveInvitation);
router.get('/', authenticate, projectController.getAllProjects);
router.get('/subproject/:mainProjectId', authenticate, projectController.getSubProjectsByMainProject);
router.patch('/status', authenticate, projectController.updateProjectStatus);
router.patch('/subproject/status', authenticate, projectController.updateSubProjectStatus);

module.exports = router;
