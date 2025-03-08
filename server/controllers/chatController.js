const userModel = require('../models/User');
const JWT = require('jsonwebtoken');
const nodemailer = require('nodemailer');

//all users
exports.users = async (req, res) => {
    try {
        const users = await userModel.find({
            // _id: { $ne: req.user.id },
            role: { $ne: 'Admin' }     // Exclude users with role 'admin'
        }).select('username email avatar');
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// Get list of users the current user has added (chatted with)
exports.getAddedUsers = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id).populate('contacts', 'username email avatar');

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user.contacts);
    } catch (error) {
        console.error('Error fetching added users:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add a user to the chat list by email
// Add a user to the chat list by email
exports.addUserToChat = async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: 'Email is required' });
  
      // Find current user
      const user = await userModel.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      // Find the user to add using email
      const userToAdd = await userModel.findOne({ email });
      if (!userToAdd) return res.status(404).json({ message: 'User with this email not found' });
  
      // Prevent adding self
      if (userToAdd._id.equals(user._id)) {
        return res.status(400).json({ message: 'You cannot add yourself' });
      }
  
      // Add to current user's contacts if not already added
      let addedToCurrent = false;
      if (!user.contacts.includes(userToAdd._id)) {
        user.contacts.push(userToAdd._id);
        addedToCurrent = true;
      }
  
      // Add current user to the other user's contacts if not already added
      let addedToOther = false;
      if (!userToAdd.contacts.includes(user._id)) {
        userToAdd.contacts.push(user._id);
        addedToOther = true;
      }
  
      // Save both users if changes were made
      if (addedToCurrent) await user.save();
      if (addedToOther) await userToAdd.save();
  
      res.status(200).json({ 
        message: 'User added to chat list' + (addedToOther ? ' mutually' : ''),
        user: { _id: userToAdd._id, username: userToAdd.username, email: userToAdd.email, avatar: userToAdd.avatar },
        contacts: user.contacts 
      });
    } catch (error) {
      console.error('Error adding user to chat:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

