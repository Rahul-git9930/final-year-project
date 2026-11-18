const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: [
      'super_admin', 'college_admin', 'hod', 'faculty', 'librarian',
      'student', 'member', 'accountant', 'placement_officer',
      'hostel_manager', 'admin'
    ],
    default: 'member'
  },
  permissions: [{ type: String, trim: true }],
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', default: null },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  accountStatus: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'graduated'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  membershipValidity: {
    type: Date
  },
  phone: {
    type: String
  },
  address: {
    type: String
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationScore: {
    type: Number,
    default: 0
  },
  emailVerificationDetails: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
