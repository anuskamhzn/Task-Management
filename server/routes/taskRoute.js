const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const {authenticate} = require('../middleware/authMiddleware');

// Apply the middleware to all routes that need authentication
//main task
router.post('/create', authenticate, taskController.createTask);
router.get('/', authenticate, taskController.getTasksByOwner);
router.patch('/status', authenticate, taskController.updateTaskStatus);
router.delete('/perdelete/:mainTaskId', authenticate, taskController.deleteTaskPermananet); //permananet delete
router.delete('/delete/:mainTaskId', authenticate, taskController.deleteTask); //soft delete
router.get('/getDeletedTask', authenticate, taskController.getSoftDeletedTasks);
router.put('/restore/:mainTaskId', authenticate, taskController.restoreTask); //restore delete
router.put('/update-task/:taskId', authenticate, taskController.updateTask);
router.get('/tasks/:taskId', authenticate, taskController.getTaskById);

router.get('/ts/status-counts', authenticate, taskController.getTaskStatusCountsWithAggregation);
router.get('/ts/analytics', authenticate, taskController.getTaskAnalytics);
router.get('/ts/sub-analytics/:mainTaskId', authenticate, taskController.getSubTaskStatusCounts);

//sub task
router.post('/create-task/:mainTaskId', authenticate, taskController.createSubTask);
router.get('/subtask/:mainTaskId', authenticate, taskController.getSubTasksByMainTask);
router.get('/subtask/:mainTaskId/:subTaskId', authenticate, taskController.getSubtaskById);
router.patch('/subtask/status', authenticate, taskController.updateSubTaskStatus);
router.delete('/pdeleteSubtask/:mainTaskId/:subTaskId', authenticate, taskController.deleteSubTaskPermananet); //permanent delete
router.delete('/delete-subtask/:mainTaskId/:subTaskId', authenticate, taskController.deleteSubTask); //soft delete
router.get('/subtask-trash/:mainTaskId', authenticate, taskController.getDeletedSubTasks); //get delete
router.put('/restore-subtask/:mainTaskId/:subTaskId', authenticate, taskController.restoreSubTask); //restore delete
router.put('/update-subtask/:mainTaskId/:subTaskId', authenticate, taskController.updateSubTask);

module.exports = router;
