const mongoose = require('mongoose');

const SemesterSchema = new mongoose.Schema({
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true, index: true },
  academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  number: { type: Number, required: true, min: 1, max: 20 },
  name: { type: String, required: true, trim: true },
  startDate: { type: Date },
  endDate: { type: Date },
  isDemo: { type: Boolean, default: false }
}, { timestamps: true });

SemesterSchema.index({ course: 1, academicYear: 1, number: 1 }, { unique: true });

module.exports = mongoose.model('Semester', SemesterSchema);
