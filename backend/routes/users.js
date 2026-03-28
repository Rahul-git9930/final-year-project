const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const User = require('../models/User');

// @route   GET /api/users/email-verification-stats
// @desc    Get email verification statistics
// @access  Private (Admin only)
router.get('/email-verification-stats', [auth, roleAuth('admin')], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ emailVerified: true });
    const unverifiedUsers = totalUsers - verifiedUsers;
    
    // Get score distribution
    const scoreRanges = [
      { label: 'Excellent (90-100)', min: 90, max: 100 },
      { label: 'Good (70-89)', min: 70, max: 89 },
      { label: 'Fair (50-69)', min: 50, max: 69 },
      { label: 'Poor (1-49)', min: 1, max: 49 },
      { label: 'Not Verified (0)', min: 0, max: 0 }
    ];
    
    const distribution = await Promise.all(
      scoreRanges.map(async (range) => ({
        range: range.label,
        count: await User.countDocuments({
          emailVerificationScore: { $gte: range.min, $lte: range.max }
        })
      }))
    );

    // Get recent registrations with verification info
    const recentUsers = await User.find()
      .select('name email emailVerified emailVerificationScore createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      summary: {
        totalUsers,
        verifiedUsers,
        unverifiedUsers,
        verificationRate: totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(2) : 0
      },
      scoreDistribution: distribution,
      recentUsers
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin/Librarian only)
router.get('/', [auth, roleAuth('admin', 'librarian')], async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Admin/Librarian only)
router.get('/:id', [auth, roleAuth('admin', 'librarian')], async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin/Librarian only)
router.put('/:id', [auth, roleAuth('admin', 'librarian')], async (req, res) => {
  try {
    const { name, email, phone, address, membershipValidity, role } = req.body;

    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.membershipValidity = membershipValidity || user.membershipValidity;
    
    // Only admin can change roles
    if (req.user.role === 'admin' && role) {
      user.role = role;
    }

    await user.save();
    
    const updatedUser = await User.findById(req.params.id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/users/:id/toggle-status
// @desc    Activate/Deactivate user
// @access  Private (Admin only)
router.put('/:id/toggle-status', [auth, roleAuth('admin')], async (req, res) => {
  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    const updatedUser = await User.findById(req.params.id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user
// @access  Private (Admin only)
router.delete('/:id', [auth, roleAuth('admin')], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Optional: Add logic to ensure user has no outstanding books or fines before deleting
    // For now, we will proceed with deletion.

    await user.deleteOne();

    res.json({ message: 'User removed successfully' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', auth, async (req, res) => {
  const bcrypt = require('bcryptjs');
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;