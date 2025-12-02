const mongoose = require('mongoose');

const eventCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  color: { type: String, default: '#3B82F6' }, // hex color for UI
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('EventCategory', eventCategorySchema);