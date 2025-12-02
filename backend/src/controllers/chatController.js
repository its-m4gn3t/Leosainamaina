const Chat = require('../models/chatModel');
const Message = require('../models/messageModel');
const Member = require('../models/memberModel');

// Get all chats for a user
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    let query = { isActive: true };
    
    // For demo admin, show all chats; for members, show only chats they participate in
    if (userId !== 'demo-admin') {
      query.participants = userId;
    }
    
    const chats = await Chat.find(query)
    .populate('participants', 'firstName lastName email')
    .populate('lastMessage')
    .populate('createdBy', 'firstName lastName')
    .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create direct chat
exports.createDirectChat = async (req, res) => {
  try {
    const { participantId } = req.body;
    const userId = req.user._id || req.user.id;
    
    // Check if direct chat already exists
    const existingChat = await Chat.findOne({
      type: 'direct',
      participants: { $all: [userId, participantId] }
    }).populate('participants', 'firstName lastName email');

    if (existingChat) {
      return res.json(existingChat);
    }

    // Check if users are friends (for members) or if user is admin
    if (req.user.role === 'member') {
      const FriendRequest = require('../models/friendRequestModel');
      const friendship = await FriendRequest.findOne({
        $or: [
          { sender: userId, receiver: participantId, status: 'accepted' },
          { sender: participantId, receiver: userId, status: 'accepted' }
        ]
      });
      
      if (!friendship) {
        return res.status(403).json({ message: 'Can only chat with friends' });
      }
    }

    const participant = await Member.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const chat = new Chat({
      name: `${participant.firstName} ${participant.lastName}`,
      type: 'direct',
      participants: [userId, participantId],
      createdBy: userId
    });

    await chat.save();
    await chat.populate('participants', 'firstName lastName email');
    
    res.status(201).json(chat);
  } catch (error) {
    console.error('Direct chat creation error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create group chat (admin only)
exports.createGroupChat = async (req, res) => {
  try {
    const { name, participantIds } = req.body;
    const mongoose = require('mongoose');

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    if (!participantIds || participantIds.length === 0) {
      return res.status(400).json({ message: 'At least one participant is required' });
    }

    // Validate ObjectIds
    const invalidIds = participantIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({ message: 'Invalid participant IDs' });
    }

    const userId = req.user._id || req.user.id;
    
    // Handle demo admin case - create a valid ObjectId
    let createdBy = userId;
    if (userId === 'demo-admin') {
      createdBy = new mongoose.Types.ObjectId();
    }
    
    // Convert string IDs to ObjectIds
    const validParticipants = participantIds.map(id => {
      try {
        return new mongoose.Types.ObjectId(id);
      } catch (error) {
        throw new Error(`Invalid participant ID: ${id}`);
      }
    });
    
    // Add creator to participants if it's a valid ObjectId
    const participants = userId === 'demo-admin' 
      ? validParticipants 
      : [...new Set([...validParticipants, userId])];

    const chat = new Chat({
      name: name.trim(),
      type: 'group',
      participants,
      createdBy
    });

    await chat.save();
    await chat.populate('participants', 'firstName lastName email');
    
    res.status(201).json(chat);
  } catch (error) {
    console.error('Group chat creation error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get chat messages
exports.getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user._id || req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    // Allow access if user is participant OR if user is demo admin
    const hasAccess = userId === 'demo-admin' || chat.participants.some(p => p.toString() === userId.toString());
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, messageType = 'text' } = req.body;
    const userId = req.user._id || req.user.id;
    const mongoose = require('mongoose');

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    // Allow sending if user is participant OR if user is demo admin
    const canSend = userId === 'demo-admin' || chat.participants.some(p => p.toString() === userId.toString());
    if (!canSend) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Handle sender ID for demo admin
    let senderId = userId;
    if (userId === 'demo-admin') {
      // Create a temporary admin user reference or use the first participant
      senderId = chat.participants[0] || new mongoose.Types.ObjectId();
    }

    const message = new Message({
      chat: chatId,
      sender: senderId,
      content,
      messageType
    });

    await message.save();
    await message.populate('sender', 'firstName lastName');

    // Update chat's last message
    chat.lastMessage = message._id;
    chat.updatedAt = new Date();
    await chat.save();

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Edit message
exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user._id || req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Can only edit your own messages' });
    }

    message.content = content;
    message.edited = true;
    await message.save();
    await message.populate('sender', 'firstName lastName');

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id || req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Can only delete your own messages' });
    }

    message.deleted = true;
    message.content = 'This message was deleted';
    await message.save();

    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add reaction
exports.addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id || req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Remove existing reaction from this user
    message.reactions = message.reactions.filter(r => r.user.toString() !== userId.toString());
    
    // Add new reaction
    message.reactions.push({ user: userId, emoji });
    await message.save();
    await message.populate('sender', 'firstName lastName');

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Start typing
exports.startTyping = async (req, res) => {
  try {
    // In a real app, this would use WebSocket
    res.json({ message: 'Typing started' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Stop typing
exports.stopTyping = async (req, res) => {
  try {
    // In a real app, this would use WebSocket
    res.json({ message: 'Typing stopped' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if already read
    const alreadyRead = message.readBy.some(read => read.member.toString() === req.user.id);
    if (!alreadyRead) {
      message.readBy.push({ member: req.user.id });
      await message.save();
    }

    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};