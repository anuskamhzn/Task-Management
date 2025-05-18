const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  confirmPassword: { type: String, required: true },
  phone: { type: String, required: true },
  location: { type: String },
  photo: {
    data: Buffer,
    contentType: String,
  },
  initials: { type: String }, // New field for initials
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // List of added users
  notificationPreferences: {
    CREATE_TASK: { type: Boolean, default: true },
    CREATE_PROJECT: { type: Boolean, default: true },
    PROJECT_INVITE: { type: Boolean, default: true },
    DUE_DATE_PROJECT: { type: Boolean, default: true },
    DUE_DATE_TASK: { type: Boolean, default: true },
    GROUP_CHAT_CREATED: { type: Boolean, default: true },
    SUBPROJECT_ASSIGNMENT: { type: Boolean, default: true }, // Added preference for new type
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationOTP: { type: String },
  verificationOTPExpires: { type: Date },
  role: {
    type: String,
    default: 'User',
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
},
  {
    timestamps: true, // Add this option to enable createdAt and updatedAt fields
  }
);

userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id, email: this.email }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

module.exports = mongoose.model('User', userSchema);
