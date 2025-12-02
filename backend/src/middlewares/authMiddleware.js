const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');
const Member = require('../models/memberModel');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Handle demo token for development
      if (token === 'demo-token') {
        req.user = {
          _id: 'demo-admin',
          email: 'admin@leoclub.local',
          role: 'admin'
        };
        return next();
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Try to find admin first, then member
      let user = await Admin.findById(decoded.id).select('-password');
      if (!user) {
        user = await Member.findById(decoded.id).select('-password');
        if (user) {
          user.role = 'member'; // Add role for consistency
        }
      } else {
        user.role = 'admin';
      }
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth error:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Role ${req.user.role} not authorized` });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };
