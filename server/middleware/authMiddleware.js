const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to check if the user is authenticated
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id || decoded._id, // Handle both `id` and `_id` from JWT
    };
    if (!req.user.id) {
      return res.status(400).json({ message: 'Invalid token: User ID missing' });
    }
    next();
  } catch (error) {
    return res.status(400).json({ message: 'Invalid token' });
  }
};

// Middleware to check if the user is an admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized Access: User not found",
      });
    }
    if (user.role !== 'Admin') {
      return res.status(401).send({
        success: false,
        message: "Unauthorized Access: Admin privileges required",
      });
    }
    next();
  } catch (error) {
    console.error("Error in isAdmin middleware:", error);
    res.status(401).send({
      success: false,
      error,
      message: "Error in admin middleware",
    });
  }
};

module.exports = { authenticate, isAdmin };
