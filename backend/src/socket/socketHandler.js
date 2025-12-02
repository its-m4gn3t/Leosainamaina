const jwt = require('jsonwebtoken');
const Member = require('../models/memberModel');
const Chat = require('../models/chatModel');
const Message = require('../models/messageModel');

const connectedUsers = new Map();

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      const member = await Member.findOne({ 
        email: socket.handshake.auth.email,
        password: socket.handshake.auth.password 
      });
      if (!member) {
        return next(new Error('Authentication error'));
      }
      decoded = { id: member._id, role: 'member' };
    }

    socket.userId = decoded.id;
    socket.userRole = decoded.role || 'member';
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};

const handleConnection = (io) => {
  return async (socket) => {
    console.log(`User connected: ${socket.userId}`);
    
    connectedUsers.set(socket.userId, {
      socketId: socket.id,
      userId: socket.userId,
      role: socket.userRole,
      lastSeen: new Date()
    });

    try {
      const userChats = await Chat.find({
        participants: socket.userId,
        isActive: true
      });
      
      userChats.forEach(chat => {
        socket.join(chat._id.toString());
      });
    } catch (error) {
      console.error('Error joining chats:', error);
    }

    socket.on('join-chat', async (chatId) => {
      try {
        const chat = await Chat.findById(chatId);
        if (chat && chat.participants.includes(socket.userId)) {
          socket.join(chatId);
        }
      } catch (error) {
        console.error('Error joining chat:', error);
      }
    });

    socket.on('send-message', async (data) => {
      try {
        const { chatId, content, replyTo, messageType = 'text' } = data;
        
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.participants.includes(socket.userId)) {
          return socket.emit('error', { message: 'Access denied' });
        }

        const message = new Message({
          chat: chatId,
          sender: socket.userId,
          content,
          messageType,
          replyTo
        });

        await message.save();
        await message.populate('sender', 'firstName lastName');

        chat.lastMessage = message._id;
        chat.updatedAt = new Date();
        await chat.save();

        io.to(chatId).emit('new-message', message);
        
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing-start', (chatId) => {
      socket.to(chatId).emit('user-typing', {
        userId: socket.userId,
        chatId
      });
    });

    socket.on('typing-stop', (chatId) => {
      socket.to(chatId).emit('user-stop-typing', {
        userId: socket.userId,
        chatId
      });
    });

    socket.on('add-reaction', async (data) => {
      try {
        const { messageId, emoji } = data;
        
        const message = await Message.findById(messageId);
        if (!message) return;

        message.reactions = message.reactions.filter(
          r => r.user.toString() !== socket.userId.toString()
        );
        
        message.reactions.push({ user: socket.userId, emoji });
        await message.save();
        await message.populate('sender', 'firstName lastName');

        io.to(message.chat.toString()).emit('message-updated', message);
        
      } catch (error) {
        console.error('Error adding reaction:', error);
      }
    });

    socket.on('edit-message', async (data) => {
      try {
        const { messageId, content } = data;
        
        const message = await Message.findById(messageId);
        if (!message || message.sender.toString() !== socket.userId.toString()) {
          return;
        }

        message.content = content;
        message.edited = true;
        await message.save();
        await message.populate('sender', 'firstName lastName');

        io.to(message.chat.toString()).emit('message-updated', message);
        
      } catch (error) {
        console.error('Error editing message:', error);
      }
    });

    socket.on('delete-message', async (messageId) => {
      try {
        const message = await Message.findById(messageId);
        if (!message || message.sender.toString() !== socket.userId.toString()) {
          return;
        }

        message.deleted = true;
        message.content = 'This message was deleted';
        await message.save();

        io.to(message.chat.toString()).emit('message-updated', message);
        
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    });

    socket.on('mark-as-read', async (data) => {
      try {
        const { messageId } = data;
        
        const message = await Message.findById(messageId);
        if (!message) return;

        const alreadyRead = message.readBy.some(
          read => read.member.toString() === socket.userId.toString()
        );
        
        if (!alreadyRead) {
          message.readBy.push({ member: socket.userId });
          await message.save();
          
          io.to(message.chat.toString()).emit('message-read', {
            messageId,
            userId: socket.userId
          });
        }
        
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      
      const user = connectedUsers.get(socket.userId);
      if (user) {
        user.lastSeen = new Date();
        
        socket.broadcast.emit('user-status-update', {
          userId: socket.userId,
          status: 'offline',
          lastSeen: user.lastSeen
        });
        
        connectedUsers.delete(socket.userId);
      }
    });
  };
};

module.exports = {
  socketAuth,
  handleConnection,
  connectedUsers
};