const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  recipientName: { type: String, required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
  certificateType: { type: String, enum: ['participation', 'appreciation', 'achievement', 'completion'], default: 'participation' },
  pdfUrl: { type: String, required: true },
  issuedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);
