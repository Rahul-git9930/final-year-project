const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Fine = require('../models/Fine');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ==================== CREATE ORDER ====================
// Create Razorpay order for payment
router.post('/create-order', auth, async (req, res) => {
  try {
    const { amount, purpose, description, referenceId } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!amount || !purpose) {
      return res.status(400).json({ error: 'Amount and purpose are required' });
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `receipt_${userId}_${Date.now()}`,
      notes: {
        userId: userId,
        purpose: purpose,
        description: description || '',
        referenceId: referenceId || ''
      }
    };

    const order = await razorpay.orders.create(options);

    // Save payment record with pending status
    const payment = new Payment({
      userId: userId,
      amount: amount,
      purpose: purpose,
      description: description,
      razorpay_order_id: order.id,
      status: 'pending',
      paymentMethod: 'online'
    });

    await payment.save();

    res.json({
      success: true,
      order_id: order.id,
      key_id: process.env.RAZORPAY_KEY_ID,
      amount: amount,
      currency: 'INR'
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// ==================== VERIFY PAYMENT ====================
// Verify payment signature and update payment status
router.post('/verify-payment', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user.id;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Update payment record
    const payment = await Payment.findOne({ 
      razorpay_order_id: razorpay_order_id,
      userId: userId 
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    payment.status = 'success';
    payment.razorpay_payment_id = razorpay_payment_id;
    payment.razorpay_signature = razorpay_signature;
    payment.transactionDate = new Date();
    payment.verifiedAt = new Date();

    await payment.save();

    // Handle purpose-specific updates
    if (payment.purpose === 'fine') {
      // Mark associated fines as paid
      await Fine.updateMany(
        { user: userId, isPaid: false },
        { isPaid: true, paidDate: new Date() }
      );
    }

    // Update user membership if applicable
    if (payment.purpose === 'membership') {
      const user = await User.findById(userId);
      user.membershipStatus = 'active';
      user.membershipExpiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
      await user.save();
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      payment: payment
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// ==================== GET PAYMENT DETAILS ====================
// Get payment details for a user
router.get('/user-payments', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, purpose } = req.query;

    // Build filter
    const filter = { userId: userId };
    if (status) filter.status = status;
    if (purpose) filter.purpose = purpose;

    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');

    res.json({
      success: true,
      payments: payments
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// ==================== ADMIN: GET ALL PAYMENTS ====================
// Get all payments (Admin only)
router.get('/admin/all-payments', auth, roleAuth('admin'), async (req, res) => {
  try {
    const { status, purpose, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (purpose) filter.purpose = purpose;

    const skip = (page - 1) * limit;

    const payments = await Payment.find(filter)
      .populate('userId', 'name email studentId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(filter);

    res.json({
      success: true,
      payments: payments,
      pagination: {
        total: total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// ==================== ADMIN: RECORD CASH PAYMENT ====================
// Record manual/cash payment (Admin only)
router.post('/admin/record-cash-payment', auth, roleAuth('admin'), async (req, res) => {
  try {
    const { userId, amount, purpose, description } = req.body;

    // Validate input
    if (!userId || !amount || !purpose) {
      return res.status(400).json({ error: 'UserId, amount, and purpose are required' });
    }

    // Create payment record for cash payment
    const payment = new Payment({
      userId: userId,
      amount: amount,
      purpose: purpose,
      description: description,
      status: 'success',
      paymentMethod: 'cash',
      transactionDate: new Date(),
      verifiedAt: new Date()
    });

    await payment.save();

    // Handle purpose-specific updates
    if (purpose === 'fine') {
      await Fine.updateMany(
        { userId: userId, status: 'active' },
        { status: 'paid', paidDate: new Date() }
      );
    }

    if (purpose === 'membership') {
      const user = await User.findById(userId);
      user.membershipStatus = 'active';
      user.membershipExpiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      await user.save();
    }

    res.json({
      success: true,
      message: 'Cash payment recorded successfully',
      payment: payment
    });

  } catch (error) {
    console.error('Error recording cash payment:', error);
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

// ==================== GET PAYMENT STATISTICS ====================
// Get payment statistics (Admin only)
router.get('/admin/statistics', auth, roleAuth('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Get statistics
    const totalPayments = await Payment.countDocuments(filter);
    const successfulPayments = await Payment.countDocuments({ ...filter, status: 'success' });
    const totalAmount = await Payment.aggregate([
      { $match: { ...filter, status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Breakdown by purpose
    const byPurpose = await Payment.aggregate([
      { $match: filter },
      { $group: { _id: '$purpose', count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      statistics: {
        totalPayments: totalPayments,
        successfulPayments: successfulPayments,
        totalAmount: totalAmount[0]?.total || 0,
        byPurpose: byPurpose
      }
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// ==================== GET RAZORPAY/STRIPE CONFIG ====================
// Get payment configuration
router.get('/config', auth, (req, res) => {
  res.json({
    // You can replace these with actual keys if you integrate a real payment gateway
    gateway: 'mock', 
    key: process.env.PAYMENT_GATEWAY_KEY || 'mock_key_here'
  });
});

// ==================== GET SINGLE PAYMENT ====================
// Get payment details by ID
router.get('/:paymentId', auth, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findById(paymentId)
      .populate('userId', 'name email studentId');

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Check authorization
    if (payment.userId._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      success: true,
      payment: payment
    });

  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

module.exports = router;
