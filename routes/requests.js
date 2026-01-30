const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const BookRequest = require('../models/BookRequest');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

// @route   GET /api/requests
// @desc    Get all book requests (Admin/Librarian)
// @access  Private (Admin/Librarian only)
router.get('/', [auth, roleAuth('admin', 'librarian')], async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
    }

    const requests = await BookRequest.find(query)
      .populate('book', 'title author isbn coverImage')
      .populate('user', 'name email phone')
      .populate('relatedTransaction')
      .sort({ requestDate: -1 });

    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/requests/my
// @desc    Get current user's requests
// @access  Private
router.get('/my', auth, async (req, res) => {
  try {
    const requests = await BookRequest.find({ user: req.user.id })
      .populate('book', 'title author isbn coverImage')
      .populate('processedBy', 'name')
      .sort({ requestDate: -1 });

    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/requests/issue
// @desc    Create book issue request
// @access  Private
router.post('/issue', auth, async (req, res) => {
  try {
    const { bookId } = req.body;

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user already has a pending request for this book
    const existingRequest = await BookRequest.findOne({
      book: bookId,
      user: req.user.id,
      status: 'pending',
      requestType: 'issue'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending request for this book' });
    }

    // Check if user already has this book issued
    const activeTransaction = await Transaction.findOne({
      book: bookId,
      user: req.user.id,
      status: { $in: ['issued', 'overdue'] }
    });

    if (activeTransaction) {
      return res.status(400).json({ message: 'You already have this book issued' });
    }

    // Create request
    const request = new BookRequest({
      book: bookId,
      user: req.user.id,
      requestType: 'issue'
    });

    await request.save();

    res.json({ message: 'Book request submitted successfully', request });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/requests/renew
// @desc    Create book renewal request
// @access  Private
router.post('/renew', auth, async (req, res) => {
  try {
    const { transactionId } = req.body;

    // Check if transaction exists and belongs to user
    const transaction = await Transaction.findOne({
      _id: transactionId,
      user: req.user.id,
      status: { $in: ['issued', 'overdue'] }
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found or already returned' });
    }

    // Check if already has pending renewal request
    const existingRequest = await BookRequest.findOne({
      relatedTransaction: transactionId,
      status: 'pending',
      requestType: 'renew'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Renewal request already pending' });
    }

    // Create renewal request
    const request = new BookRequest({
      book: transaction.book,
      user: req.user.id,
      requestType: 'renew',
      relatedTransaction: transactionId
    });

    await request.save();

    res.json({ message: 'Renewal request submitted successfully', request });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/requests/return
// @desc    Create book return request
// @access  Private
router.post('/return', auth, async (req, res) => {
  try {
    const { transactionId } = req.body;

    // Check if transaction exists and belongs to user
    const transaction = await Transaction.findOne({
      _id: transactionId,
      user: req.user.id,
      status: { $in: ['issued', 'overdue'] }
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found or already returned' });
    }

    // Check if already has pending return request
    const existingRequest = await BookRequest.findOne({
      relatedTransaction: transactionId,
      status: 'pending',
      requestType: 'return'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Return request already pending' });
    }

    // Create return request
    const request = new BookRequest({
      book: transaction.book,
      user: req.user.id,
      requestType: 'return',
      relatedTransaction: transactionId
    });

    await request.save();

    res.json({ message: 'Return request submitted successfully', request });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/requests/:id/approve
// @desc    Approve request and issue book
// @access  Private (Admin/Librarian only)
router.put('/:id/approve', [auth, roleAuth('admin', 'librarian')], async (req, res) => {
  try {
    const request = await BookRequest.findById(req.params.id)
      .populate('book')
      .populate('user', 'name email');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    if (request.requestType === 'issue') {
      // Check book availability
      if (request.book.available < 1) {
        return res.status(400).json({ message: 'Book not available' });
      }

      // Create transaction
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 14 days loan period

      const transaction = new Transaction({
        book: request.book._id,
        user: request.user._id,
        dueDate,
        issuedBy: req.user.id
      });

      await transaction.save();

      // Update book availability
      request.book.available -= 1;
      await request.book.save();

      // Update request
      request.status = 'issued';
      request.processedBy = req.user.id;
      request.processedDate = Date.now();
      request.relatedTransaction = transaction._id;
      await request.save();

      // Create notification
      const notification = new Notification({
        user: request.user._id,
        title: 'Book Issue Approved',
        message: `Your request for "${request.book.title}" has been approved. Please collect it from the library.`,
        type: 'book_available',
        relatedBook: request.book._id,
        relatedTransaction: transaction._id
      });
      await notification.save();

      res.json({ message: 'Book issued successfully', transaction });

    } else if (request.requestType === 'renew') {
      // Renew book
      const transaction = await Transaction.findById(request.relatedTransaction);
      
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      // Extend due date by 14 days
      const currentDueDate = new Date(transaction.dueDate);
      currentDueDate.setDate(currentDueDate.getDate() + 14);
      transaction.dueDate = currentDueDate;
      await transaction.save();

      // Update request
      request.status = 'approved';
      request.processedBy = req.user.id;
      request.processedDate = Date.now();
      await request.save();

      // Create notification
      const notification = new Notification({
        user: request.user._id,
        title: 'Book Renewal Approved',
        message: `Your renewal for "${request.book.title}" has been approved. New due date: ${currentDueDate.toLocaleDateString()}`,
        type: 'general'
      });
      await notification.save();

      res.json({ message: 'Book renewed successfully', transaction });

    } else if (request.requestType === 'return') {
      // Process return
      const transaction = await Transaction.findById(request.relatedTransaction);
      
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      transaction.returnDate = Date.now();
      transaction.status = 'returned';
      await transaction.save();

      // Update book availability
      const book = await Book.findById(transaction.book);
      book.available += 1;
      await book.save();

      // Update request
      request.status = 'approved';
      request.processedBy = req.user.id;
      request.processedDate = Date.now();
      await request.save();

      // Create notification
      const notification = new Notification({
        user: request.user._id,
        title: 'Book Return Confirmed',
        message: `Your return of "${request.book.title}" has been confirmed. Thank you!`,
        type: 'general'
      });
      await notification.save();

      res.json({ message: 'Book return processed successfully', transaction });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/requests/:id/reject
// @desc    Reject request
// @access  Private (Admin/Librarian only)
router.put('/:id/reject', [auth, roleAuth('admin', 'librarian')], async (req, res) => {
  try {
    const { reason } = req.body;
    
    const request = await BookRequest.findById(req.params.id)
      .populate('book', 'title')
      .populate('user', 'name');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    request.status = 'rejected';
    request.processedBy = req.user.id;
    request.processedDate = Date.now();
    request.notes = reason || 'Request rejected';
    await request.save();

    // Create notification
    const notification = new Notification({
      user: request.user._id,
      title: 'Request Rejected',
      message: `Your ${request.requestType} request for "${request.book.title}" has been rejected. ${reason || ''}`,
      type: 'general'
    });
    await notification.save();

    res.json({ message: 'Request rejected', request });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
