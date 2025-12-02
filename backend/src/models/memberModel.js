const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: false },
  email: { type: String, unique: true, sparse: true },
  password: { type: String },
  phone: { type: String },
  position: { type: String },
  image: { type: String },
  bio: { type: String },
  isFoundingMember: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  joinedAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  yearJoined: { type: Number, default: () => new Date().getFullYear() },
  role: { type: String, enum: ['Member', 'Officer', 'President', 'Secretary', 'Admin'], default: 'Member' },
  totalPoints: { type: Number, default: 0 },
  totalHours: { type: Number, default: 0 },
  badge: { type: String, enum: ['Bronze', 'Silver', 'Gold'], default: 'Bronze' },
}, { timestamps: true });

module.exports = mongoose.model('Member', memberSchema);
