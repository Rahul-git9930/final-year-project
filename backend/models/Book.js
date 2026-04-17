const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  isbn: {
    type: String,
    unique: true,
    sparse: true
  },
  author: {
    type: String,
    required: true
  },
  publisher: {
    type: String
  },
  category: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  },
  available: {
    type: Number,
    default: 1
  },
  coverImage: {
    type: String
  },
  description: {
    type: String
  },
  publishedYear: {
    type: Number
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  qrCode: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Book', BookSchema);
