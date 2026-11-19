const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth');
const tenantScope = require('../middleware/tenantScope');
const permissionAuth = require('../middleware/permissionAuth');
const AcademicYear = require('../models/AcademicYear');

router.get('/', [auth, tenantScope], async (req, res) => {
  try {
    const query = req.collegeId ? { college: req.collegeId } : {};
    const years = await AcademicYear.find(query).sort({ startDate: -1 }).lean();
    res.json({ success: true, data: years });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch academic years' });
  }
});

router.post('/', [auth, tenantScope, permissionAuth('department.manage')], async (req, res) => {
  try {
    const collegeId = req.collegeId || req.body.college;
    const { name, startDate, endDate, isActive } = req.body;
    if (!collegeId || !mongoose.isValidObjectId(collegeId) || !name || !startDate || !endDate) {
      return res.status(400).json({ message: 'College, name, start date, and end date are required' });
    }
    if (isActive) await AcademicYear.updateMany({ college: collegeId }, { isActive: false });
    const year = await AcademicYear.findOneAndUpdate(
      { college: collegeId, name },
      { college: collegeId, name, startDate, endDate, isActive: Boolean(isActive) },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(201).json({ success: true, data: year });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save academic year' });
  }
});

module.exports = router;
