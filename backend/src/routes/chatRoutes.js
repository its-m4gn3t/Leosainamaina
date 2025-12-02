const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');

// Get user chats
router.get('/', protect, chatController.getUserChats);

// Create direct chat
router.post('/direct', protect, chatController.createDirectChat);

// Create group chat
router.post('/group', protect, chatController.createGroupChat);

// Get chat messages
router.get('/:chatId/messages', protect, chatController.getChatMessages);

// Send message
router.post('/:chatId/messages', protect, chatController.sendMessage);

// Edit message
router.put('/messages/:messageId', protect, chatController.editMessage);

// Delete message
router.delete('/messages/:messageId', protect, chatController.deleteMessage);

// Add reaction
router.post('/messages/:messageId/react', protect, chatController.addReaction);

// Mark message as read
router.put('/messages/:messageId/read', protect, chatController.markAsRead);

// Typing indicators
router.post('/:chatId/typing', protect, chatController.startTyping);
router.post('/:chatId/stop-typing', protect, chatController.stopTyping);

module.exports = router;