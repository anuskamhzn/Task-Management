const express = require('express');
const googleController = require('../controllers/googleController');

const router = express.Router();

router.get('/auth', googleController.googleAuth);
router.get('/callback', googleController.googleCallback);
router.post('/event', googleController.createEvent);
// Route to list events from Google Calendar
router.get('/events', googleController.listEvents);


module.exports = router;
