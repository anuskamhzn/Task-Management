const bcrypt = require('bcryptjs');
const userModel = require('../models/User');
const Project = require('../models/Project');
const JWT = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const authenticate = require('../middleware/authMiddleware');

// registration
exports.register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, phone } = req.body;
    const role = req.body.role; // Extract role from the request body

    // Validations
    if (!username || !email || !password || !phone || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password should be at least 6 characters long" });
    }

    // Check if the user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists, please login instead" });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Register the user
    const user = new userModel({
      username,
      email,
      phone,
      password: hashedPassword,
      confirmPassword: hashedPassword,
      role,
    });
    await user.save();

    // 🔍 Check if the user was invited to any project
    const invitedProjects = await Project.find({ pendingInvites: email });

    if (invitedProjects.length > 0) {
      for (const project of invitedProjects) {
        project.members.push(user._id); // Move the user to the members list
        project.pendingInvites = project.pendingInvites.filter(e => e !== email); // Remove from pending
        await project.save();
      }
    }

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

    // Create an Access Token (short-lived)
    const accessToken = JWT.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET, // Secret key for JWT
      { expiresIn: '1d' } // Access token expires in 15 minutes
    );

    // Return success response with the access token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,  // Send the Access Token in the response body
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// User info route
exports.userInfo = async (req, res) => {
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
  };

const transporter = nodemailer.createTransport({
  service: 'Gmail', // e.g., 'Gmail', 'Yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendPasswordResetEmail = async (email, accessToken) => {
  const resetLink = `http://localhost:3000/reset-password?token=${accessToken}&email=${email}`;

  const mailOptions = {
    from: 'anuskamhzn33@gmail.com', // sender address
    to: email, // receiver address
    subject: 'Password Reset Request', // Subject line
    text: `You requested for a password reset. Click the link to reset your password: ${resetLink}`,
    html: `<p>You requested for a password reset.</p><p>Click the link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
  };

  await transporter.sendMail(mailOptions);
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }

    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Generate a reset token
    const accessToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiration = Date.now() + 3600000; // 1 hour from now

    // Update user record with the reset token and expiration
    user.resetPasswordToken = accessToken;
    user.resetPasswordExpires = tokenExpiration;
    await user.save();

    // Send reset email
    await sendPasswordResetEmail(email, accessToken);

    res.status(200).send({ message: "Password reset email sent" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

// Fix for resetPassword
exports.resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      return res.status(400).send({ message: "All fields are required" });
    }

    // Find the user by email and reset token
    const user = await userModel.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Check if the token is still valid
    });

    if (!user) {
      return res.status(400).send({ message: "Invalid or expired token" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password and clear reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.status(200).send({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).send({ message: "Something went wrong", error });
  }
};
