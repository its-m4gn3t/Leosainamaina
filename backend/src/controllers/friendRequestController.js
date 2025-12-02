const FriendRequest = require('../models/friendRequestModel');
const Member = require('../models/memberModel');

// Send friend request
exports.sendFriendRequest = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user._id || req.user.id;

    if (senderId === receiverId) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already exists' });
    }

    const friendRequest = new FriendRequest({
      sender: senderId,
      receiver: receiverId,
      message: message || 'Hi! Let\'s connect on Leo Club.'
    });

    await friendRequest.save();
    await friendRequest.populate('sender receiver', 'firstName lastName email');

    res.status(201).json(friendRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get friend requests for user
exports.getFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const requests = await FriendRequest.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    })
    .populate('sender receiver', 'firstName lastName email')
    .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update friend request status
exports.updateFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    const userId = req.user._id || req.user.id;

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    // Only receiver can update the request
    if (friendRequest.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }

    friendRequest.status = status;
    await friendRequest.save();
    await friendRequest.populate('sender receiver', 'firstName lastName email');

    res.json(friendRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get friends list
exports.getFriends = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const acceptedRequests = await FriendRequest.find({
      $or: [
        { sender: userId, status: 'accepted' },
        { receiver: userId, status: 'accepted' }
      ]
    })
    .populate('sender receiver', 'firstName lastName email');

    const friends = acceptedRequests.map(request => {
      return request.sender._id.toString() === userId.toString() 
        ? request.receiver 
        : request.sender;
    });

    res.json(friends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};