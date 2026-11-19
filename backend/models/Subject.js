const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true, index: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true, index: true },
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true, trim: true },
  credits: { type: Number, required: true, min: 0, max: 20 },
  type: { type: String, enum: ['theory', 'practical', 'theory-practical'], default: 'theory' },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  syllabus: { type: String, trim: true },
  isDemo: { type: Boolean, default: false }
}, { timestamps: true });

SubjectSchema.index({ college: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Subject', SubjectSchema);
