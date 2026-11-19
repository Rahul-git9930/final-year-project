const mongoose = require('mongoose');

const FacultyProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true, index: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
  employeeId: { type: String, required: true, trim: true, uppercase: true },
  designation: { type: String, required: true, trim: true },
  qualification: { type: String, trim: true },
  assignedSubjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  joiningDate: { type: Date, default: Date.now },
  employmentStatus: { type: String, enum: ['active', 'leave', 'inactive'], default: 'active' },
  profileImage: { type: String, trim: true },
  isDemo: { type: Boolean, default: false }
}, { timestamps: true });

FacultyProfileSchema.index({ college: 1, employeeId: 1 }, { unique: true });

module.exports = mongoose.model('FacultyProfile', FacultyProfileSchema);
