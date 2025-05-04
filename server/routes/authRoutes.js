const express = require('express');
const { register, login, 
    userInfo, forgotPassword, 
    resetPassword, userInfoById, 
    verifyOTP, resendOTP, updateProfileController, updatePasswordController } = require('../controllers/authController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');
const formidable = require('express-formidable'); // for handling file uploads

const router = express.Router();

// Public Routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected Routes
router.get('/user-info',authenticate,userInfo); // Protect user info route
router.get('/user-info/:userId',userInfoById); // Protect user info route

// Middleware order: First parse the form data (file uploads, fields), then authenticate the user
router.put('/updateProfile', formidable(), authenticate, updateProfileController );
router.put('/updatePass',  authenticate, updatePasswordController );

router.post('/verify-otp', verifyOTP); // New OTP verification route
router.post('/resend-otp', resendOTP); // New route to resend OTP

module.exports = router;
