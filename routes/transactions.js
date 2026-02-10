const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const User = require('../models/User');
const Fine = require('../models/Fine');

// @route   GET /api/transactions
// @desc    Get all transactions
// @access  Private (Admin/Librarian only)
router.get('/', [auth, roleAuth('admin', 'librarian')], async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    const transactions = await Transaction.find(query)
      .populate('book', 'title author isbn')
      .populate('user', 'name email')
      .populate('issuedBy', 'name')
      .sort({ issueDate: -1 });

    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/transactions/my
// @desc    Get current user's transactions
// @access  Private
router.get('/my', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .populate('book', 'title author isbn coverImage')
      .sort({ issueDate: -1 });

    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/transactions/issue
// @desc    Issue a book to a user
// @access  Private (Admin/Librarian only)
router.post('/issue', [auth, roleAuth('admin', 'librarian')], async (req, res) => {
  try {
    const { bookId, userId, dueDate } = req.body;

    // Check if book exists and is available
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.available <= 0) {
      return res.status(400).json({ message: 'Book is not available' });
    }

    // Check if user exists and is active
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(400).json({ message: 'User account is deactivated' });
    }

    // Check if user already has this book
    const existingTransaction = await Transaction.findOne({
      book: bookId,
      user: userId,
      status: 'issued'
    });

    if (existingTransaction) {
      return res.status(400).json({ message: 'User already has this book issued' });
    }

    // Create transaction
    const transaction = new Transaction({
      book: bookId,
      user: userId,
      dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days default
      issuedBy: req.user.id
    });

    // Decrease available count
    book.available -= 1;
    await book.save();

    await transaction.save();

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('book', 'title author isbn')
      .populate('user', 'name email');

    res.json(populatedTransaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/transactions/:id/return
// @desc    Return a book
// @access  Private (Admin/Librarian only)
router.put('/:id/return', [auth, roleAuth('admin', 'librarian')], async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.status === 'returned') {
      return res.status(400).json({ message: 'Book already returned' });
    }

    // Update transaction
    transaction.returnDate = new Date();
    transaction.status = 'returned';

    // Increase available count
    const book = await Book.findById(transaction.book);
    book.available += 1;
    await book.save();

    // Check if overdue and create fine
    const dueDate = new Date(transaction.dueDate);
    const returnDate = new Date(transaction.returnDate);

    if (returnDate > dueDate) {
      const daysLate = Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24));
      const fineAmount = daysLate * 5; // $5 per day

      const fine = new Fine({
        user: transaction.user,
        transaction: transaction._id,
        amount: fineAmount,
        reason: `Late return: ${daysLate} days overdue`
      });

      await fine.save();
    }

    await transaction.save();

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('book', 'title author isbn')
      .populate('user', 'name email');

    res.json(populatedTransaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/transactions/overdue
// @desc    Get overdue transactions
// @access  Private (Admin/Librarian only)
router.get('/overdue', [auth, roleAuth('admin', 'librarian')], async (req, res) => {
  try {
    const transactions = await Transaction.find({
      status: 'issued',
      dueDate: { $lt: new Date() }
    })
      .populate('book', 'title author isbn')
      .populate('user', 'name email phone')
      .sort({ dueDate: 1 });

    // Update status to overdue
    for (let transaction of transactions) {
      transaction.status = 'overdue';
      await transaction.save();
    }

    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/transactions/issue-scan
// @desc    Issue book via QR scan
// @access  Private (Student)
router.post('/issue-scan', auth, async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!bookId) {
      return res.status(400).json({ 
        success: false,
        message: 'Book ID is required' 
      });
    }

    // Find the book
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ 
        success: false,
        message: 'Book not found' 
      });
    }

    // Check if book is available
    if (book.available <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Book is currently not available. All copies are issued.' 
      });
    }

    // Check if user already has this book
    const existingTransaction = await Transaction.findOne({
      user: userId,
      book: bookId,
      status: 'issued'
    });

    if (existingTransaction) {
      return res.status(400).json({ 
        success: false,
        message: 'You have already issued this book. Please return it first.' 
      });
    }

    // Check user's active books limit (e.g., max 3 books)
    const activeBooks = await Transaction.countDocuments({
      user: userId,
      status: 'issued'
    });

    if (activeBooks >= 3) {
      return res.status(400).json({ 
        success: false,
        message: 'You have reached the maximum limit of issued books (3). Please return a book first.' 
      });
    }

    // Create transaction
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14 days from now

    const transaction = new Transaction({
      book: bookId,
      user: userId,
      issuedBy: userId, // Self-issue via scan
      issueDate: new Date(),
      dueDate: dueDate,
      status: 'issued'
    });

    await transaction.save();

    // Update book available copies
    book.available -= 1;
    await book.save();

    // Populate transaction details
    await transaction.populate('book', 'title author isbn');
    await transaction.populate('user', 'name email');

    res.json({
      success: true,
      message: 'Book issued successfully via scan!',
      transaction: transaction,
      dueDate: dueDate
    });

  } catch (err) {
    console.error('Error issuing book via scan:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error while processing book issue' 
    });
  }
});

module.exports = router;