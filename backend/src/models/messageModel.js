const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'voice'],
    default: 'text'
  },
  fileUrl: { type: String },
  fileName: { type: String },
  fileSize: { type: Number },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  reactions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
    emoji: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  readBy: [{
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  edited: { type: Boolean, default: false },
  editedAt: { type: Date },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, {
  timestamps: true
});

messageSchema.pre('find', function() {
  this.where({ deleted: { $ne: true } });
});

messageSchema.pre('findOne', function() {
  this.where({ deleted: { $ne: true } });
});

module.exports = mongoose.model('Message', messageSchema);