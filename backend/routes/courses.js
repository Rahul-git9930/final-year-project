const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth');
const tenantScope = require('../middleware/tenantScope');
const permissionAuth = require('../middleware/permissionAuth');
const Course = require('../models/Course');
const Department = require('../models/Department');
const Subject = require('../models/Subject');

router.get('/', [auth, tenantScope], async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const query = {};
    if (req.collegeId) query.college = req.collegeId;
    if (req.query.department) {
      if (!mongoose.isValidObjectId(req.query.department)) return res.status(400).json({ message: 'Invalid department ID' });
      query.department = req.query.department;
    }
    if (req.query.status) query.status = req.query.status;
    if (req.query.search) {
      const escaped = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [{ name: { $regex: escaped, $options: 'i' } }, { code: { $regex: escaped, $options: 'i' } }];
    }
    const [courses, total] = await Promise.all([
      Course.find(query).populate('department', 'name code').sort({ name: 1 }).skip((page - 1) * limit).limit(limit).lean(),
      Course.countDocuments(query)
    ]);
    res.json({ success: true, data: courses, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch courses', code: 'COURSES_FETCH_FAILED' });
  }
});

router.get('/:id', [auth, tenantScope], async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid course ID' });
    const query = { _id: req.params.id };
    if (req.collegeId) query.college = req.collegeId;
    const course = await Course.findOne(query).populate('department', 'name code hodName hodEmail').lean();
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const subjects = await Subject.find({ course: course._id }).populate('semester', 'number name').sort({ name: 1 }).lean();
    res.json({ success: true, data: { ...course, subjects } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch course', code: 'COURSE_FETCH_FAILED' });
  }
});

router.post('/', [auth, tenantScope, permissionAuth('department.manage')], async (req, res) => {
  try {
    const { name, code, department, durationYears, semesterCount, intakeCapacity, academicYear, description, status, specializations } = req.body;
    if (!name || !code || !department || !durationYears || !semesterCount) {
      return res.status(400).json({ message: 'Name, code, department, duration, and semester count are required' });
    }
    if (!mongoose.isValidObjectId(department)) return res.status(400).json({ message: 'Invalid department ID' });
    const collegeId = req.collegeId || req.body.college;
    if (!collegeId) return res.status(400).json({ message: 'College is required' });
    const departmentRecord = await Department.findOne({ _id: department, college: collegeId });
    if (!departmentRecord) return res.status(404).json({ message: 'Department not found in this college' });
    const course = await Course.create({
      college: collegeId, department, name, code, durationYears, semesterCount,
      intakeCapacity, academicYear, description, status, specializations
    });
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'Course code already exists in this college' });
    res.status(500).json({ message: 'Failed to create course', code: 'COURSE_CREATE_FAILED' });
  }
});

module.exports = router;
