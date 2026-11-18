const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const permissionAuth = require('../middleware/permissionAuth');
const tenantScope = require('../middleware/tenantScope');
const Department = require('../models/Department');
const College = require('../models/College');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

async function recordAudit(req, action, resourceId, changes) {
  await AuditLog.create({
    college: req.collegeId,
    actor: req.user.id,
    action,
    resource: 'department',
    resourceId,
    changes,
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  });
}

async function resolvedCollegeId(req, bodyCollege) {
  if (req.user.role === 'super_admin') {
    return bodyCollege || req.headers['x-college-id'] || req.query.collegeId;
  }
  return req.user.college;
}

router.get('/', [auth, tenantScope, permissionAuth('department.view')], async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const search = (req.query.search || '').trim();
    const collegeId = req.query.collegeId || req.collegeId;

    if (!collegeId) return res.status(400).json({ message: 'College is required' });
    if (!mongoose.isValidObjectId(collegeId)) return res.status(400).json({ message: 'Invalid college ID' });

    const query = { college: collegeId };
    if (req.query.isActive !== undefined) query.isActive = req.query.isActive === 'true';
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { code: { $regex: escaped, $options: 'i' } }
      ];
    }

    const [departments, total] = await Promise.all([
      Department.find(query)
        .populate('college', 'name code')
        .populate('hod', 'name email')
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Department.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: departments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch departments' });
  }
});

router.get('/:id', [auth, tenantScope, permissionAuth('department.view')], async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid department ID' });
    }

    const query = { _id: req.params.id };
    if (req.user.role !== 'super_admin') query.college = req.collegeId;

    const department = await Department.findOne(query)
      .populate('college', 'name code')
      .populate('hod', 'name email')
      .lean();

    if (!department) return res.status(404).json({ message: 'Department not found' });
    res.json({ success: true, data: department });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch department' });
  }
});

router.post('/', [auth, tenantScope, permissionAuth('department.manage')], async (req, res) => {
  try {
    const { name, code, description, hod } = req.body;
    if (!name || !code) return res.status(400).json({ message: 'Name and code are required' });

    const collegeId = await resolvedCollegeId(req, req.body.college);
    if (!collegeId || !mongoose.isValidObjectId(collegeId)) {
      return res.status(400).json({ message: 'Valid college is required' });
    }

    const college = await College.findOne({ _id: collegeId, isActive: true });
    if (!college) return res.status(404).json({ message: 'Active college not found' });

    if (hod) {
      if (!mongoose.isValidObjectId(hod)) return res.status(400).json({ message: 'Invalid HOD ID' });
      const hodUser = await User.findOne({ _id: hod, college: collegeId });
      if (!hodUser) return res.status(404).json({ message: 'HOD user not found in this college' });
      if (hodUser.role !== 'hod') return res.status(400).json({ message: 'Assigned HOD must have the hod role' });
    }

    const department = await Department.create({
      college: collegeId,
      name,
      code,
      description,
      hod: hod || null,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    await recordAudit(req, 'create', department._id, req.body);
    res.status(201).json({ success: true, data: department });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'Department code already exists in this college' });
    res.status(500).json({ message: 'Failed to create department' });
  }
});

router.put('/:id', [auth, tenantScope, permissionAuth('department.manage')], async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid department ID' });
    }

    const query = { _id: req.params.id };
    if (req.user.role !== 'super_admin') query.college = req.collegeId;
    const department = await Department.findOne(query);
    if (!department) return res.status(404).json({ message: 'Department not found' });

    if (req.body.hod) {
      if (!mongoose.isValidObjectId(req.body.hod)) return res.status(400).json({ message: 'Invalid HOD ID' });
      const hodUser = await User.findOne({ _id: req.body.hod, college: department.college });
      if (!hodUser || hodUser.role !== 'hod') {
        return res.status(400).json({ message: 'Assigned HOD must belong to this college and have the hod role' });
      }
    }

    const protectedFields = ['college', 'createdBy'];
    protectedFields.forEach(field => delete req.body[field]);

    Object.assign(department, req.body, { updatedBy: req.user.id });
    await department.save();

    await recordAudit(req, 'update', department._id, req.body);
    res.json({ success: true, data: department });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'Department code already exists in this college' });
    res.status(500).json({ message: 'Failed to update department' });
  }
});

router.delete('/:id', [auth, tenantScope, permissionAuth('department.manage')], async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid department ID' });
    }

    const query = { _id: req.params.id };
    if (req.user.role !== 'super_admin') query.college = req.collegeId;
    const department = await Department.findOneAndDelete(query);
    if (!department) return res.status(404).json({ message: 'Department not found' });

    await recordAudit(req, 'delete', department._id, { deletedName: department.name });
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete department' });
  }
});

module.exports = router;
