const express = require('express');
const { register,login, userInfo } = require('../controllers/authController');

const router = express.Router();

// POST route for user 
router.post('/register', register);
router.post('/login', login);
router.get('/user-info', userInfo);

module.exports = router;
