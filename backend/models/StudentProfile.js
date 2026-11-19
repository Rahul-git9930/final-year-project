const mongoose = require('mongoose');

const StudentProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true, index: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  prn: { type: String, required: true, uppercase: true, trim: true },
  rollNumber: { type: String, required: true, trim: true },
  academicYear: { type: String, trim: true, default: '2026-2027' },
  semester: { type: Number, min: 1, max: 20, default: 1 },
  division: { type: String, trim: true, default: 'A' },
  admissionDate: { type: Date, default: Date.now },
  enrollmentStatus: { type: String, enum: ['active', 'inactive', 'suspended', 'graduated'], default: 'active' },
  phone: { type: String, trim: true },
  profileImage: { type: String, trim: true },
  isDemo: { type: Boolean, default: false }
}, { timestamps: true });

StudentProfileSchema.index({ college: 1, prn: 1 }, { unique: true });

module.exports = mongoose.model('StudentProfile', StudentProfileSchema);
