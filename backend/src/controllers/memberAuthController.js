const Member = require('../models/memberModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Member login
const memberLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find member by email
    const member = await Member.findOne({ email });
    if (!member) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Check if member has password (for existing members without password)
    if (!member.password) {
      // Set default password as email prefix
      const defaultPassword = email.split('@')[0];
      const hashedPassword = await bcrypt.hash(defaultPassword, 12);
      member.password = hashedPassword;
      await member.save();
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, member.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: member._id, email: member.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );
    
    // Update last login
    member.lastLogin = new Date();
    await member.save();
    
    // Return user data without password
    const { password: _, ...memberData } = member.toObject();
    
    res.status(200).json({
      token,
      ...memberData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Set member password (for first-time login)
const setMemberPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    const member = await Member.findOne({ email });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    member.password = hashedPassword;
    await member.save();
    
    res.status(200).json({ message: 'Password set successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  memberLogin,
  setMemberPassword
};