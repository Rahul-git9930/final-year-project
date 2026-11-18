const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['due_date', 'overdue', 'fine', 'book_available', 'announcement', 'general'],
    default: 'general'
  },
  relatedBook: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  },
  relatedTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);
