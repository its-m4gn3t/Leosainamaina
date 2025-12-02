const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  sendFriendRequest,
  getFriendRequests,
  updateFriendRequest,
  getFriends
} = require('../controllers/friendRequestController');

router.use(protect);

router.post('/', sendFriendRequest);
router.get('/', getFriendRequests);
router.put('/:requestId', updateFriendRequest);
router.get('/friends', getFriends);

module.exports = router;