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
    const [
      totalBooks,
      totalMembers,
      booksIssued,
      pendingFines,
      overdueBooks,
      activeMembers,
      availableBooks,
      recentTransactions
    ] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments({ role: { $in: ['member', 'student'] } }),
      Transaction.countDocuments({ status: { $in: ['issued', 'overdue'] } }),
      Fine.aggregate([
        { $match: { isPaid: false } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.countDocuments({ status: 'overdue' }),
      User.countDocuments({
        role: { $in: ['member', 'student'] },
        isActive: true
      }),
      Book.aggregate([
        { $group: { _id: null, total: { $sum: '$available' } } }
      ]),
      Transaction.find()
        .populate('book', 'title')
        .populate('user', 'name')
        .sort({ issueDate: -1 })
        .limit(5)
        .lean()
    ]);

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
