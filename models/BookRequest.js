const mongoose = require('mongoose');

const bookRequestSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'issued'],
    default: 'pending'
  },
  requestType: {
    type: String,
    enum: ['issue', 'renew', 'return'],
    default: 'issue'
  },
  relatedTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  notes: {
    type: String
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedDate: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BookRequest', bookRequestSchema);
