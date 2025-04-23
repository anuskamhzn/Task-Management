const nodemailer = require('nodemailer');
const userModel = require('../models/User');

//all users
exports.users = async (req, res) => {
  try {
    const users = await userModel.find({
      role: { $ne: 'Admin' }     // Exclude users with role 'admin'
    }).select('username email avatar');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
// Controller to fetch recent doctors and patients
exports.getRecentUsers = async (req, res) => {
  try {
    const admin = req.user;
    if (admin.role !== 'admin') {
      return res.status(403).json({ message: "You are not authorized to view this data." });
    }

    const totalUsers = await userModel.countDocuments({ role: { $ne: 'admin' } });
    const totalDoctors = await userModel.countDocuments({ role: 'doctor' });
    const totalPatients = await userModel.countDocuments({ role: 'patient' });
    const pendingDoctors = await userModel.countDocuments({ role: 'doctor', isApproved: false });

    const recentDoctors = await userModel
      .find({ role: 'doctor' })
      .select('name email phone licenseNo location practice isApproved createdAt photo')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentPatients = await userModel
      .find({ role: 'patient' })
      .select('name email phone location createdAt photo')
      .sort({ createdAt: -1 })
      .limit(5);

    const formattedDoctors = recentDoctors.map(doctor => {
      const photoData = doctor.photo && doctor.photo.data ? {
        contentType: doctor.photo.contentType || 'image/png', // Fallback MIME type
        data: Buffer.isBuffer(doctor.photo.data) ? doctor.photo.data.toString('base64') : doctor.photo.data
      } : null;

      return {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        licenseNo: doctor.licenseNo,
        location: doctor.location,
        practice: doctor.practice,
        isApproved: doctor.isApproved,
        createdAt: doctor.createdAt,
        photo: photoData
      };
    });

    const formattedPatients = recentPatients.map(patient => {
      const photoData = patient.photo && patient.photo.data ? {
        contentType: patient.photo.contentType || 'image/png',
        data: Buffer.isBuffer(patient.photo.data) ? patient.photo.data.toString('base64') : patient.photo.data
      } : null;

      return {
        _id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        location: patient.location,
        createdAt: patient.createdAt,
        photo: photoData
      };
    });

    res.status(200).json({
      totalUsers,
      totalDoctors,
      totalPatients,
      pendingDoctors,
      recentDoctors: formattedDoctors,
      recentPatients: formattedPatients,
    });
  } catch (error) {
    console.error("Error fetching recent users and counts:", error);
    res.status(500).json({ message: "Error fetching data", error: error.message });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const admin = req.user;
    if (admin.role !== 'admin') {
      return res.status(403).json({ message: "You are not authorized to view this data." });
    }

    const totalUsers = await userModel.countDocuments({ role: { $ne: 'admin' } });
    const totalDoctors = await userModel.countDocuments({ role: 'doctor' });
    const totalPatients = await userModel.countDocuments({ role: 'patient' });
    const pendingDoctors = await userModel.countDocuments({ role: 'doctor', isApproved: false });

    const recentDoctors = await userModel
      .find({ role: 'doctor' })
      .select('name email phone licenseNo location practice isApproved createdAt photo')
      .sort({ createdAt: -1 });

    const recentPatients = await userModel
      .find({ role: 'patient' })
      .select('name email phone location createdAt photo')
      .sort({ createdAt: -1 });

    const formattedDoctors = recentDoctors.map(doctor => {
      const photoData = doctor.photo && doctor.photo.data ? {
        contentType: doctor.photo.contentType || 'image/png', // Fallback MIME type
        data: Buffer.isBuffer(doctor.photo.data) ? doctor.photo.data.toString('base64') : doctor.photo.data
      } : null;

      return {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        licenseNo: doctor.licenseNo,
        location: doctor.location,
        practice: doctor.practice,
        isApproved: doctor.isApproved,
        createdAt: doctor.createdAt,
        photo: photoData
      };
    });

    const formattedPatients = recentPatients.map(patient => {
      const photoData = patient.photo && patient.photo.data ? {
        contentType: patient.photo.contentType || 'image/png',
        data: Buffer.isBuffer(patient.photo.data) ? patient.photo.data.toString('base64') : patient.photo.data
      } : null;

      return {
        _id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        location: patient.location,
        createdAt: patient.createdAt,
        photo: photoData
      };
    });

    res.status(200).json({
      totalUsers,
      totalDoctors,
      totalPatients,
      pendingDoctors,
      recentDoctors: formattedDoctors,
      recentPatients: formattedPatients,
    });
  } catch (error) {
    console.error("Error fetching recent users and counts:", error);
    res.status(500).json({ message: "Error fetching data", error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params; // Get userId from URL parameters

    // Validate admin access
    const admin = req.user;
    if (admin.role !== 'admin') {
      return res.status(403).json({ message: "Only admins can delete users." });
    }

    // Find the user
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Prevent deletion of admin accounts
    if (user.role === 'admin') {
      return res.status(400).json({ message: "Cannot delete admin accounts." });
    }

    // Delete the user
    await user.deleteOne();

    // If the user was a doctor, update related notifications
    if (user.role === 'doctor') {
      const notification = await Notification.findOne({ doctorId: user._id, read: false });
      if (notification) {
        notification.message = `Doctor ${user.name} has been deleted by admin.`;
        notification.read = true;
        await notification.save();
      }
    }

    res.status(200).json({
      success: true,
      message: `User ${user.name} has been deleted successfully.`,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Error deleting user", error: error.message });
  }
};