const bcrypt = require('bcryptjs');
const userModel = require('../models/User');
const JWT = require('jsonwebtoken');
const authenticate = require('../middleware/authMiddleware');

// registration
exports.register = async (req, res) => {
  try {
    const { name, username, email, password, confirmPassword, phone } = req.body;
    const role = req.body.role; // Extract role from the request body

    // Validations
    if (!name || !username || !email || !password || !phone || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if password and confirmPass are the same
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if password is at least 6 characters long
    if (password.length < 6) {
      return res.status(400).json({ message: "Password should be at least 6 characters long" });
    }

    // Check if the user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists, please login instead" });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Register the user
    const user = new userModel({
      name,
      username,
      email,
      phone,
      password: hashedPassword,
      confirmPassword: hashedPassword,
      role, // include the role as it's automatically filled by middleware
    });
    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error in registration", error });
  }
};

// login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if the user exists in the database
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare the entered password with the hashed password stored in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Create a JWT token
    const token =   JWT.sign(
      { id: user._id, email: user.email, role: user.role }, // Payload (user info)
      process.env.JWT_SECRET, // Secret key for JWT
      { expiresIn: '1h' } // Token expiration time
    );

    // Return success response with the token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,  // Send the JWT token to the frontend
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// User info route
exports.userInfo = [
  authenticate, 
  async (req, res) => {
    try {
      // Assuming req.user.id contains the user ID
      const user = await userModel.findById(req.user.id); 

      if (!user) {
        // Return a 404 if the user is not found
        return res.status(404).json({ message: 'User not found' });
      }

      // Return the user data as JSON if found
      res.json(user);  
    } catch (error) {
      // Handle specific errors (e.g., database connection issues)
      console.error(error);  // Log error details for debugging purposes
      res.status(500).json({ 
        message: 'Server error, unable to fetch user data', 
        error: error.message || 'Internal Server Error'
      });
    }
  }
];

