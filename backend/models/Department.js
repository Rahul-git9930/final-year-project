const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true, index: true },
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true, trim: true },
  description: { type: String, trim: true },
  hod: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  hodName: { type: String, trim: true },
  hodEmail: { type: String, trim: true, lowercase: true },
  facultyCount: { type: Number, default: 0, min: 0 },
  studentCount: { type: Number, default: 0, min: 0 },
  establishedYear: { type: Number, min: 1900, max: 2100 },
  icon: { type: String, trim: true, default: 'building' },
  imageUrl: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

DepartmentSchema.index({ college: 1, code: 1 }, { unique: true });
DepartmentSchema.index({ college: 1, name: 'text' });

module.exports = mongoose.model('Department', DepartmentSchema);
