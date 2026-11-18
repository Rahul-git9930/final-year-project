const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Wishlist = require('../models/Wishlist');
const Book = require('../models/Book');

// @route   POST /api/wishlist
// @desc    Add book to wishlist
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { bookId } = req.body;

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if already in wishlist
    const existing = await Wishlist.findOne({
      user: req.user.id,
      book: bookId
    });

    if (existing) {
      return res.status(400).json({ message: 'Book already in wishlist' });
    }

    // Add to wishlist
    const wishlistItem = new Wishlist({
      user: req.user.id,
      book: bookId
    });

    await wishlistItem.save();

    const populated = await Wishlist.findById(wishlistItem._id)
      .populate('book', 'title author');

    res.json(populated);
  } catch (err) {
    console.error(err.message);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Book already in wishlist' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET /api/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ user: req.user.id })
      .populate('book', 'title author category available quantity')
      .sort({ addedAt: -1 });

    res.json(wishlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/wishlist/:bookId
// @desc    Remove book from wishlist
// @access  Private
router.delete('/:bookId', auth, async (req, res) => {
  try {
    const wishlistItem = await Wishlist.findOne({
      user: req.user.id,
      book: req.params.bookId
    });

    if (!wishlistItem) {
      return res.status(404).json({ message: 'Book not in wishlist' });
    }

    await Wishlist.findByIdAndDelete(wishlistItem._id);
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
