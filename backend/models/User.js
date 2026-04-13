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
    enum: ['admin', 'librarian', 'member', 'student'],
    default: 'member'
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
