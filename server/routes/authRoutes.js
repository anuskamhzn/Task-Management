const express = require('express');
const { register, login, userInfo, forgotPassword, resetPassword, userInfoById } = require('../controllers/authController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public Routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected Routes
router.get('/user-info',authenticate,userInfo); // Protect user info route
router.get('/user-info/:userId',userInfoById); // Protect user info route

// Authentication Check Routes
router.get('/user-auth', authenticate, (req, res) => {
    res.status(200).send({ ok: true });
});

router.get('/admin-auth', authenticate, isAdmin, (req, res) => {
    res.status(200).send({ ok: true });
});

module.exports = router;
