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
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Extract token from header

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Decode the token using JWT_SECRET from environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by decoded ID
    const user = await User.findById(decoded.id);  // Ensure you're matching `decoded.id` with the `_id` field

    // If user doesn't exist
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed. User not found.' });
    }

    // Check if the user is an admin
    if (user.role !== 'Admin') {
      return res.status(403).json({ message: 'You are not authorized to access this route.' });
    }

    // Attach the user to the request object for further processing
    req.user = user;
    next(); // Allow the request to continue

  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Authentication failed. Invalid token.' });
  }
};

module.exports = { authenticate, isAdmin };
