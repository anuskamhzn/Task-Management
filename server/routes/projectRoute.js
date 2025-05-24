const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const {authenticate} = require('../middleware/authMiddleware');

// Apply the middleware to all routes that need authentication
//main project
router.post('/create', authenticate, projectController.createProject);
router.get('/approve-invite', projectController.approveInvitation);
router.get('/', authenticate, projectController.getAllProjects);
router.patch('/status', authenticate, projectController.updateProjectStatus);
router.delete('/pdeleteProject/:projectId', authenticate, projectController.deleteProjectPermanent); //permanent delete
router.delete('/delete/:projectId', authenticate, projectController.deleteProject); //soft delete
router.get('/fetchDeleted', authenticate, projectController.getAllDeletedProjects);
router.put('/restore/:projectId', authenticate, projectController.restoreProject); //restore delete
router.put('/update-project/:projectId', authenticate, projectController.updateProject);
router.get('/:projectId', authenticate, projectController.getProjectById);

router.get('/pro/total-counts', authenticate, projectController.getProjectStatusCountsWithAggregation);
router.get('/pro/analytics', authenticate, projectController.getProjectAnalytics);
router.get('/pro/sub-analytics/:mainProjectId', authenticate, projectController.getSubProjectStatusCounts);

//sub project
router.post('/create-project/:mainProjectId', authenticate, projectController.createSubProject);
router.get('/subproject/:mainProjectId', authenticate, projectController.getSubProjectsByMainProject);
router.get('/subproject/:mainProjectId/:subProjectId', authenticate, projectController.getSubProjectById);
router.patch('/subproject/status', authenticate, projectController.updateSubProjectStatus);
router.delete('/pdeleteSubproject/:mainProjectId/:subProjectId', authenticate, projectController.deleteSubProjectPermanent); //permanent delete
router.delete('/delete-subproject/:mainProjectId/:subProjectId', authenticate, projectController.deleteSubProject); //soft delete
router.get('/subproject-trash/:mainProjectId', authenticate, projectController.getDeletedSubProjects); //get delete
router.put('/restore-subproject/:mainProjectId/:subProjectId', authenticate, projectController.restoreSubProject); //restore delete
router.put('/update-subproject/:mainProjectId/:subProjectId', authenticate, projectController.updateSubProject);
// router.get('/:projectId/subprojects', authenticate, projectController.getSubProjectById);


module.exports = router;
