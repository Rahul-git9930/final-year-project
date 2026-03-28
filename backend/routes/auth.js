const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const emailVerificationService = require('../services/emailVerification');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
    const normalizedEmail = (email || '').toLowerCase();
    const isAdminEmail = adminEmail && normalizedEmail === adminEmail;

    // Verify email using external service
    let emailVerificationResult;
    try {
      emailVerificationResult = await emailVerificationService.verifyEmail(email);
      
      // Check if email is valid based on verification result
      if (!emailVerificationResult.valid) {
        return res.status(400).json({ 
          message: 'Invalid or undeliverable email address',
          details: emailVerificationResult.details.reason || 'Email verification failed'
        });
      }

      // Optional: Set minimum score threshold (e.g., 50)
      const minScore = parseInt(process.env.EMAIL_MIN_SCORE) || 50;
      if (emailVerificationResult.score < minScore) {
        return res.status(400).json({ 
          message: 'Email quality score too low',
          details: `Email verification score: ${emailVerificationResult.score}. Minimum required: ${minScore}`
        });
      }
    } catch (verificationError) {
      console.error('Email verification error:', verificationError);
      // If verification fails, continue with registration but log the error
      emailVerificationResult = {
        valid: true,
        score: 0,
        details: { reason: 'Verification service unavailable' }
      };
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      role: isAdminEmail ? 'admin' : (role || 'member'),
      emailVerified: emailVerificationResult.valid,
      emailVerificationScore: emailVerificationResult.score,
      emailVerificationDetails: emailVerificationResult.details
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
    const normalizedEmail = (email || '').toLowerCase();

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Ensure configured admin email has admin role
    if (adminEmail && normalizedEmail === adminEmail && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;