const express = require('express');
const { register,login, userInfo, refreshToken, forgotPassword, resetPassword } = require('../controllers/authController');

const router = express.Router();

// POST route for user 
router.post('/register', register);
router.post('/login', login);
router.get('/user-info', userInfo);

// POST route for forget/reset
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
module.exports = router;
