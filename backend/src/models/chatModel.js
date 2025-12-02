const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['direct', 'group', 'team', 'support', 'community'],
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  typingUsers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
    lastTyped: { type: Date, default: Date.now }
  }],
  pinnedMessages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  description: { type: String },
  avatar: { type: String },
  isArchived: { type: Boolean, default: false },
  lastActivity: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Chat', chatSchema);