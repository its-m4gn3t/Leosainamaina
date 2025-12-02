const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  attendanceMethod: { type: String, enum: ['manual', 'qr'], default: 'manual' },
  qrToken: { type: String }, // unique token for QR attendance
  checkInTime: { type: Date, default: Date.now },
  points: { type: Number, default: 0 },
  hours: { type: Number, default: 0 },
  notes: { type: String }
}, { timestamps: true });

// Ensure one attendance record per member per event
attendanceSchema.index({ member: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
