const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true, index: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true, trim: true },
  durationYears: { type: Number, required: true, min: 1, max: 10 },
  semesterCount: { type: Number, required: true, min: 1, max: 20 },
  intakeCapacity: { type: Number, default: 60, min: 1 },
  academicYear: { type: String, trim: true, default: '2026-2027' },
  description: { type: String, trim: true },
  status: { type: String, enum: ['active', 'inactive', 'archived'], default: 'active' },
  specializations: [{ type: String, trim: true }],
  isDemo: { type: Boolean, default: false }
}, { timestamps: true });

CourseSchema.index({ college: 1, code: 1 }, { unique: true });
CourseSchema.index({ name: 'text', code: 'text' });

module.exports = mongoose.model('Course', CourseSchema);
