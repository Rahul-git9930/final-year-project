const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const Book = require('../models/Book');
const QRCode = require('qrcode');

// @route   GET /api/books
// @desc    Get all books
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, category, available } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (available === 'true') {
      query.available = { $gt: 0 };
    }

    const books = await Book.find(query).populate('addedBy', 'name email');
    res.json(books);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/books/:id
// @desc    Get book by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('addedBy', 'name email');
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST /api/books
// @desc    Add a new book
// @access  Private (Admin/Librarian only)
router.post('/', [auth, roleAuth('admin', 'librarian')], async (req, res) => {
  try {
    const { title, isbn, author, publisher, category, quantity, description, publishedYear, coverImage } = req.body;

    const book = new Book({
      title,
      isbn,
      author,
      publisher,
      category,
      quantity: quantity || 1,
      available: quantity || 1,
      description,
      publishedYear,
      coverImage,
      addedBy: req.user.id
    });

    // Generate QR Code with book details
    const qrData = JSON.stringify({
      bookId: book._id,
      title: book.title,
      author: book.author,
      isbn: book.isbn || 'N/A'
    });
    book.qrCode = await QRCode.toDataURL(qrData);

    await book.save();
    res.json(book);
  } catch (err) {
    console.error(err.message);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Book with this ISBN already exists' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/books/:id
// @desc    Update book
// @access  Private (Admin/Librarian only)
router.put('/:id', [auth, roleAuth('admin', 'librarian')], async (req, res) => {
  try {
    const { title, isbn, author, publisher, category, quantity, description, publishedYear, coverImage } = req.body;

    let book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Calculate available based on new quantity
    const diff = quantity - book.quantity;
    const newAvailable = book.available + diff;

    book.title = title || book.title;
    book.isbn = isbn || book.isbn;
    book.author = author || book.author;
    book.publisher = publisher || book.publisher;
    book.category = category || book.category;
    book.quantity = quantity || book.quantity;
    book.available = newAvailable >= 0 ? newAvailable : book.available;
    book.description = description || book.description;
    book.publishedYear = publishedYear || book.publishedYear;
    book.coverImage = coverImage || book.coverImage;

    await book.save();
    res.json(book);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/books/:id
// @desc    Delete book
// @access  Private (Admin only)
router.delete('/:id', [auth, roleAuth('admin')], async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if book has been issued (available less than quantity)
    if (book.available < book.quantity) {
      return res.status(400).json({ 
        message: 'Cannot delete book that has been issued. Please return all copies first.' 
      });
    }

    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
