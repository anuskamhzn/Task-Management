const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {type: String, required: true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  confirmPassword : {type: String, required:true},
  phone: { type: String, required: true},
  avatar: { type: String, default: 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg' },
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // List of added users
  role: {
    type: String,
    default: 'User',
  },
  resetPasswordToken: String,
    resetPasswordExpires: Date,
});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id, email: this.email }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

module.exports = mongoose.model('User', userSchema);
