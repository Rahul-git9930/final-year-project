const mongoose = require('mongoose');

const AcademicYearSchema = new mongoose.Schema({
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true, index: true },
  name: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: false },
  isDemo: { type: Boolean, default: false }
}, { timestamps: true });

AcademicYearSchema.index({ college: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('AcademicYear', AcademicYearSchema);
