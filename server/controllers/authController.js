const bcrypt = require('bcryptjs');
const userModel = require('../models/User');
const Project = require('../models/Project');
const JWT = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const mongoose = require('mongoose');
const fs = require ('fs');

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

// Generate a 6-digit OTP
const generateOTP = () => {
  // Generate a random 6-digit number
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email with OTP
const sendVerificationOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Verification Code',
    text: `Your verification code is: ${otp}. This code will expire in 10 minutes.`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2>Email Verification</h2>
        <p>Thank you for registering! Please verify your email address using the verification code below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f4f4f4; padding: 15px; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
            ${otp}
          </div>
        </div>
        <p>Enter this code on the verification page to complete your registration.</p>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Modified register function to use OTP verification
exports.register = async (req, res) => {
  try {
    const { email, password, confirmPassword, phone, name } = req.body;
    const role = req.body.role;
    const { redirect, token } = req.query;

    // Input validation checks (unchanged)
    if (!email || !password || !phone || !confirmPassword || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: "Password should be at least 6 characters long" });
    }
    
    if (phone.length !== 10) {
      return res.status(400).json({ message: "Phone number should be 10 digits." });
    }

    // Invitation check logic (unchanged)
    if (redirect === 'approve-invite' && token) {
      try {
        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        const invitedEmail = decoded.email;

        if (email !== invitedEmail) {
          return res.status(400).json({
            message: "Email does not match the invitation. Please use the invited email address.",
          });
        }
      } catch (error) {
        return res.status(400).json({ message: "Invalid or expired invitation token" });
      }
    }

    // Check if this user already exists
    const existingUser = await userModel.findOne({ email });
    
    // NEW: Check if this is an unverified user with expired OTP
    if (existingUser && !existingUser.isVerified && 
        (!existingUser.verificationOTPExpires || existingUser.verificationOTPExpires < Date.now())) {
      
      // Update the existing unverified user with new information
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationOTP = generateOTP();
      const otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      existingUser.name = name;
      existingUser.phone = phone;
      existingUser.password = hashedPassword;
      existingUser.confirmPassword = hashedPassword;
      existingUser.role = role;
      existingUser.initials = getInitials(name);
      existingUser.verificationOTP = verificationOTP;
      existingUser.verificationOTPExpires = otpExpiration;
      
      await existingUser.save();
      
      // Send new verification email
      await sendVerificationOTP(email, verificationOTP);
      
      return res.status(200).json({
        success: true,
        message: "We found your previous registration. A new verification code has been sent to your email.",
        user: {
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
        },
        redirect: `${process.env.FRONTEND_URL}/verify-otp?email=${email}`,
      });
    } 
    // Original check for existing verified users
    else if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ message: "User already exists, please login instead" });
      } else {
        // User exists but is unverified with a valid OTP
        return res.status(400).json({ 
          message: "You've already registered. Please check your email for verification code or use 'Resend OTP' option.",
          redirect: `${process.env.FRONTEND_URL}/verify-otp?email=${email}`,
        });
      }
    }

    // Regular new user registration flow (unchanged)
    const hashedPassword = await bcrypt.hash(password, 10);
    const initials = getInitials(name);
    const verificationOTP = generateOTP();
    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = new userModel({
      name,
      email,
      phone,
      password: hashedPassword,
      confirmPassword: hashedPassword,
      role,
      initials,
      isVerified: false,
      verificationOTP,
      verificationOTPExpires: otpExpiration,
    });
    await user.save();

    // Send verification email with OTP
    await sendVerificationOTP(email, verificationOTP);

    // Rest of function unchanged...
    if (redirect === 'approve-invite') {
      return res.status(201).json({
        success: true,
        message: "User registered successfully. Please verify your email with the OTP sent to your inbox, then log in to approve the invitation.",
        redirect: `${process.env.FRONTEND_URL}/verify-otp?email=${email}`,
      });
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please check your email for the verification code.",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
      redirect: `${process.env.FRONTEND_URL}/verify-otp?email=${email}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error in registration", error });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { otp, email } = req.body;

    if (!otp || !email) {
      return res.status(400).json({ message: "OTP and email are required" });
    }

    const user = await userModel.findOne({
      email,
      verificationOTP: otp,
      verificationOTPExpires: { $gt: Date.now() },
      isVerified: false,
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Mark user as verified and clear OTP
    user.isVerified = true;
    user.verificationOTP = undefined;
    user.verificationOTPExpires = undefined;
    await user.save();

    // Handle pending project invitations with error isolation
    try {
      const invitedProjects = await Project.find({ pendingInvites: email });
      if (invitedProjects.length > 0) {
        for (const project of invitedProjects) {
          try {
            // Ensure user is not already a member to avoid duplicates
            if (!project.members.includes(user._id)) {
              project.members.push(user._id);
            }
            project.pendingInvites = project.pendingInvites.filter((e) => e !== email);
            await project.save();
          } catch (projectError) {
            console.error(`Error updating project ${project._id} for email ${email}:`, projectError);
            // Continue processing other projects instead of failing
          }
        }
      }
    } catch (invitationError) {
      console.error(`Error handling project invitations for email ${email}:`, invitationError);
      // Do not fail the verification process due to invitation errors
    }

    res.status(200).json({
      success: true,
      message: "Email successfully verified. You can now log in.",
      redirect: `${process.env.FRONTEND_URL}/login`,
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ success: false, message: "Error verifying email", error });
  }
};

// Resend OTP verification
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await userModel.findOne({ email, isVerified: false });
    if (!user) {
      return res.status(404).json({ message: "User not found or already verified" });
    }

    // Generate new OTP
    const verificationOTP = generateOTP();
    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.verificationOTP = verificationOTP;
    user.verificationOTPExpires = otpExpiration;
    await user.save();

    // Send verification email with new OTP
    await sendVerificationOTP(email, verificationOTP);

    res.status(200).json({
      success: true,
      message: "Verification code resent. Please check your inbox.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error resending verification code", error });
  }
};

// Login with OTP verification check
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
    
    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({ 
        success: false,
        message: 'Email not verified. Please verify your email before logging in.',
        needsVerification: true,
        redirect: `${process.env.FRONTEND_URL}/verify-otp?email=${email}`
      });
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

//update profile
exports.updateProfileController = async (req, res) => {
  try {
    const { name, email, phone, location } = req.fields;
    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update user information
    const updatedFields = {
      name: name || user.name,
      phone: phone || user.phone,
      location: location || user.location,
    };

    // Update initials if name is provided
    if (name) {
      updatedFields.initials = getInitials(name);
    }

    // If a photo is uploaded, update user's photo
    const photo = req.files?.photo;
    if (photo) {
      updatedFields.photo = {
        data: fs.readFileSync(photo.path),
        contentType: photo.type,
      };
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      req.user.id,
      updatedFields,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      console.log('Failed to update user for ID:', req.user.id);
      return res.status(500).json({ success: false, message: 'Failed to update user' });
    }

    // console.log('Updated user:', updatedUser);
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      updatedUser,
    });
  } catch (error) {
    console.error('Error in updateProfileController:', error);
    res.status(500).json({
      success: false,
      message: 'Error while updating profile',
      error: error.message,
    });
  }
};

//Update Password
exports.updatePasswordController = async (req, res) => {
  try {
    const { newPassword, confirmNewPassword } = req.body; // Access req.body instead of req.fields
    const user = await userModel.findById(req.user._id);

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long" });
    }
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      { password: hashedPassword },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
      updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while updating password",
      error: error.message,
    });
  }
};

// get user photo
exports.userPhotoController = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.userId).select("photo");

    // Check if user or photo doesn't exist
    if (!user || !user.photo) {
      return res.status(404).send({ success: false, message: "User photo not found" });
    }

    // If photo exists, send it in the response
    res.set("Content-type", user.photo.contentType);
    return res.status(200).send(user.photo.data);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting user photo",
      error,
    });
  }
};