const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth');
const permissionAuth = require('../middleware/permissionAuth');
const AuditLog = require('../models/AuditLog');

router.get('/', [auth, permissionAuth('audit.view')], async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const query = {};

    if (req.query.resource) query.resource = req.query.resource;
    if (req.query.action) query.action = req.query.action;
    if (req.query.collegeId) {
      if (!mongoose.isValidObjectId(req.query.collegeId)) {
        return res.status(400).json({ message: 'Invalid college ID' });
      }
      query.college = req.query.collegeId;
    }

    if (req.user.role !== 'super_admin' && req.user.college) {
      query.college = req.user.college;
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('actor', 'name email role')
        .populate('college', 'name code')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch audit logs' });
  }
});

module.exports = router;
