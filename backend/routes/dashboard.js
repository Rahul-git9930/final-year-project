const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const Book = require('../models/Book');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Fine = require('../models/Fine');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private (Admin/Librarian only)
router.get('/stats', [auth, roleAuth('admin', 'librarian')], async (req, res) => {
  try {
    // Total books
    const totalBooks = await Book.countDocuments();
    
    // Total members (exclude admin and librarian)
    const totalMembers = await User.countDocuments({ 
      role: { $in: ['member', 'student'] } 
    });
    
    // Books issued (currently issued)
    const booksIssued = await Transaction.countDocuments({ 
      status: { $in: ['issued', 'overdue'] } 
    });
    
    // Pending fines
    const pendingFines = await Fine.aggregate([
      { $match: { isPaid: false } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Overdue books
    const overdueBooks = await Transaction.countDocuments({
      status: 'overdue'
    });
    
    // Active members (have membership validity)
    const activeMembers = await User.countDocuments({
      role: { $in: ['member', 'student'] },
      isActive: true
    });
    
    // Total book copies available
    const availableBooks = await Book.aggregate([
      { $group: { _id: null, total: { $sum: '$available' } } }
    ]);

    // Recent transactions
    const recentTransactions = await Transaction.find()
      .populate('book', 'title')
      .populate('user', 'name')
      .sort({ issueDate: -1 })
      .limit(5);

    res.json({
      totalBooks,
      totalMembers,
      booksIssued,
      pendingFines: pendingFines[0]?.total || 0,
      overdueBooks,
      activeMembers,
      availableBooks: availableBooks[0]?.total || 0,
      recentTransactions
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
