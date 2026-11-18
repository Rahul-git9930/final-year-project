const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const Fine = require('../models/Fine');

// @route   GET /api/fines
// @desc    Get all fines
// @access  Private (Admin/Librarian only)
router.get('/', [auth, roleAuth('admin', 'librarian')], async (req, res) => {
  try {
    const { isPaid } = req.query;
    let query = {};

    if (isPaid !== undefined) {
      query.isPaid = isPaid === 'true';
    }

    const fines = await Fine.find(query)
      .populate('user', 'name email phone')
      .populate('transaction')
      .sort({ createdAt: -1 });

    res.json(fines);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/fines/my
// @desc    Get current user's fines
// @access  Private
router.get('/my', auth, async (req, res) => {
  try {
    const fines = await Fine.find({ user: req.user.id })
      .populate({
        path: 'transaction',
        populate: { path: 'book', select: 'title author' }
      })
      .sort({ createdAt: -1 });

    res.json(fines);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/fines/user/:userId
// @desc    Get fines for specific user
// @access  Private (Admin/Librarian only)
router.get('/user/:userId', [auth, roleAuth('admin', 'librarian')], async (req, res) => {
  try {
    const fines = await Fine.find({ user: req.params.userId })
      .populate({
        path: 'transaction',
        populate: { path: 'book', select: 'title author' }
      })
      .sort({ createdAt: -1 });

    res.json(fines);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/fines/:id/pay
// @desc    Mark fine as paid
// @access  Private (Admin/Librarian or fine owner)
router.put('/:id/pay', auth, async (req, res) => {
  try {
    let fine = await Fine.findById(req.params.id);

    if (!fine) {
      return res.status(404).json({ message: 'Fine not found' });
    }

    // Check if user is admin/librarian or the fine owner
    const user = await require('../models/User').findById(req.user.id);
    const isAdminOrLibrarian = user.role === 'admin' || user.role === 'librarian';
    const isOwner = fine.user.toString() === req.user.id;

    if (!isAdminOrLibrarian && !isOwner) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (fine.isPaid) {
      return res.status(400).json({ message: 'Fine already paid' });
    }

    fine.isPaid = true;
    fine.paidDate = new Date();

    await fine.save();

    const updatedFine = await Fine.findById(fine._id)
      .populate('user', 'name email')
      .populate({
        path: 'transaction',
        populate: { path: 'book', select: 'title author' }
      });

    res.json(updatedFine);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/fines/stats
// @desc    Get fine statistics
// @access  Private (Admin/Librarian only)
router.get('/stats', [auth, roleAuth('admin', 'librarian')], async (req, res) => {
  try {
    const totalFines = await Fine.countDocuments();
    const paidFines = await Fine.countDocuments({ isPaid: true });
    const unpaidFines = await Fine.countDocuments({ isPaid: false });

    const totalAmount = await Fine.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const paidAmount = await Fine.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const unpaidAmount = await Fine.aggregate([
      { $match: { isPaid: false } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      totalFines,
      paidFines,
      unpaidFines,
      totalAmount: totalAmount[0]?.total || 0,
      paidAmount: paidAmount[0]?.total || 0,
      unpaidAmount: unpaidAmount[0]?.total || 0
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
