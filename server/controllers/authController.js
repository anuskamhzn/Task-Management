const bcrypt = require('bcryptjs');
const userModel = require('../models/User');
const Project = require('../models/Project');
const JWT = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const authenticate = require('../middleware/authMiddleware');

// Function to compute initials from full name
const getInitials = (fullName) => {
  if (!fullName) return '';
  const nameParts = fullName.trim().split(/\s+/);
  const initials = nameParts
    .filter((part) => part.length > 0)
    .map((part) => part[0].toUpperCase())
    .join('');
  return initials.slice(0, 2);
};

// authController.js
exports.register = async (req, res) => {
  try {
    const { email, password, confirmPassword, phone, name } = req.body;
    const role = req.body.role;
    const { redirect, token } = req.query; // Get redirect and token from query parameters

    if (!email || !password || !phone || !confirmPassword || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password should be at least 6 characters long" });
    }
    if (phone.length  !== 10) {
      return res.status(400).json({ message: "Phone number should be 10 digits." });
    }

    // Check if this is an invitation-based registration
    if (redirect === 'approve-invite' && token) {
      try {
        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        const invitedEmail = decoded.email;

        // Ensure the provided email matches the invited email
        if (email !== invitedEmail) {
          return res.status(400).json({
            message: "Email does not match the invitation. Please use the invited email address.",
          });
        }
      } catch (error) {
        return res.status(400).json({ message: "Invalid or expired invitation token" });
      }
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists, please login instead" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const initials = getInitials(name);

    const user = new userModel({
      name,
      email,
      phone,
      password: hashedPassword,
      confirmPassword: hashedPassword,
      role,
      initials,
    });
    await user.save();

    // Handle pending project invitations
    const invitedProjects = await Project.find({ pendingInvites: email });
    if (invitedProjects.length > 0) {
      for (const project of invitedProjects) {
        project.members.push(user._id);
        project.pendingInvites = project.pendingInvites.filter((e) => e !== email);
        await project.save();
      }
    }

    // Redirect to login after successful registration for invitation-based flow
    if (redirect === 'approve-invite') {
      return res.status(201).json({
        success: true,
        message: "User registered successfully. Please log in to approve the invitation.",
        redirect: `${process.env.FRONTEND_URL}/login`,
      });
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
// Registration
// exports.register = async (req, res) => {
//   try {
//     const { username, email, password, confirmPassword, phone, name } = req.body;
//     const role = req.body.role;

//     if (!username || !email || !password || !phone || !confirmPassword || !name) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     if (password !== confirmPassword) {
//       return res.status(400).json({ message: "Passwords do not match" });
//     }

//     if (password.length < 6) {
//       return res.status(400).json({ message: "Password should be at least 6 characters long" });
//     }

//     const existingUser = await userModel.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists, please login instead" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const initials = getInitials(name);

//     const user = new userModel({
//       username,
//       name,
//       email,
//       phone,
//       password: hashedPassword,
//       confirmPassword: hashedPassword,
//       role,
//       initials,
//     });
//     await user.save();

//     const invitedProjects = await Project.find({ pendingInvites: email });

//     if (invitedProjects.length > 0) {
//       for (const project of invitedProjects) {
//         project.members.push(user._id);
//         project.pendingInvites = project.pendingInvites.filter((e) => e !== email);
//         await project.save();
//       }
//     }

//     res.status(201).json({
//       success: true,
//       message: "User registered successfully",
//       user,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Error in registration", error });
//   }
// };

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email not registered' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }
    

    const accessToken = JWT.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        initials: user.initials || getInitials(user.name),
        photo: user.photo && user.photo.data
          ? {
              data: user.photo.data.toString('base64'),
              contentType: user.photo.contentType,
            }
          : null,
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
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      ...user.toObject(),
      initials: user.initials || getInitials(user.name),
      photo: user.photo && user.photo.data
        ? {
            data: user.photo.data.toString('base64'),
            contentType: user.photo.contentType,
          }
        : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error, unable to fetch user data',
      error: error.message || 'Internal Server Error',
    });
  }
};

// User info by ID
exports.userInfoById = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      ...user.toObject(),
      initials: user.initials || getInitials(user.name),
      photo: user.photo && user.photo.data
        ? {
            data: user.photo.data.toString('base64'),
            contentType: user.photo.contentType,
          }
        : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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
