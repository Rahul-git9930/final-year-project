const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const permissionAuth = require('../middleware/permissionAuth');
const College = require('../models/College');
const Department = require('../models/Department');
const AuditLog = require('../models/AuditLog');

async function recordAudit(req, action, resource, resourceId, changes) {
  await AuditLog.create({
    college: resourceId,
    actor: req.user.id,
    action,
    resource,
    resourceId,
    changes,
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  });
}

router.get('/', [auth, roleAuth('super_admin', 'college_admin', 'admin')], async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const search = (req.query.search || '').trim();
    const query = {};

    if (req.query.isActive !== undefined) query.isActive = req.query.isActive === 'true';
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { code: { $regex: escaped, $options: 'i' } },
        { city: { $regex: escaped, $options: 'i' } }
      ];
    }

    if (req.user.role !== 'super_admin' && req.user.college) {
      query._id = req.user.college;
    }

    const [colleges, total] = await Promise.all([
      College.find(query).sort({ name: 1 }).skip((page - 1) * limit).limit(limit).lean(),
      College.countDocuments(query)
    ]);

    res.json({ success: true, data: colleges, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch colleges' });
  }
});

router.get('/:id', [auth, roleAuth('super_admin', 'college_admin', 'admin')], async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid college ID' });
    }

    const query = { _id: req.params.id };
    if (req.user.role !== 'super_admin' && req.user.college) query._id = req.user.college;
    const college = await College.findOne(query).lean();
    if (!college) return res.status(404).json({ message: 'College not found' });

    res.json({ success: true, data: college });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch college' });
  }
});

router.post('/', [auth, roleAuth('super_admin', 'college_admin', 'admin'), permissionAuth('college.manage')], async (req, res) => {
  try {
    const required = ['name', 'code'];
    if (required.some(field => !req.body[field])) {
      return res.status(400).json({ message: 'Name and code are required' });
    }

    const college = await College.create({
      ...req.body,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    await recordAudit(req, 'create', 'college', college._id, req.body);
    res.status(201).json({ success: true, data: college });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'College code already exists' });
    res.status(500).json({ message: 'Failed to create college' });
  }
});

router.put('/:id', [auth, roleAuth('super_admin', 'college_admin', 'admin'), permissionAuth('college.manage')], async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid college ID' });
    if (req.user.role !== 'super_admin' && req.user.college !== req.params.id) {
      return res.status(403).json({ message: 'Cannot manage another college' });
    }

    const college = await College.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user.id },
      { new: true, runValidators: true }
    );
    if (!college) return res.status(404).json({ message: 'College not found' });

    await recordAudit(req, 'update', 'college', college._id, req.body);
    res.json({ success: true, data: college });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'College code already exists' });
    res.status(500).json({ message: 'Failed to update college' });
  }
});

router.delete('/:id', [auth, roleAuth('super_admin', 'admin'), permissionAuth('college.manage')], async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid college ID' });
    const departmentCount = await Department.countDocuments({ college: req.params.id });
    if (departmentCount > 0) {
      return res.status(409).json({ message: 'Cannot delete college with existing departments' });
    }
    const college = await College.findByIdAndDelete(req.params.id);
    if (!college) return res.status(404).json({ message: 'College not found' });

    await recordAudit(req, 'delete', 'college', college._id, { deletedName: college.name });
    res.json({ success: true, message: 'College deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete college' });
  }
});

module.exports = router;
