const Member = require('../models/memberModel');
const bcrypt = require('bcryptjs');

// Get all members
const getAllMembers = async (req, res) => {
  try {
    console.log('Fetching members with query:', req.query);
    const { search } = req.query;
    let query = {};
    
    if (search) {
      query = {
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const members = await Member.find(query);
    console.log(`Found ${members.length} members`);
    res.status(200).json(members);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get a single member by ID
const getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.status(200).json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new member
const createMember = async (req, res) => {
  try {
    console.log('Creating member with data:', req.body);
    const memberData = req.body;
    
    // Auto-generate email if not provided
    if (!memberData.email && memberData.firstName && memberData.lastName) {
      memberData.email = `${memberData.firstName.toLowerCase()}.${memberData.lastName.toLowerCase()}@leoclub.local`;
    }
    
    if (memberData.email) {
      const memberExists = await Member.findOne({ email: memberData.email });
      if (memberExists) {
        console.log('Member already exists:', memberData.email);
        return res.status(400).json({ message: 'Member with this email already exists' });
      }
    }

    // Auto-generate password if not provided
    if (!memberData.password) {
      memberData.password = 'leo123'; // Default password
    }
    
    // Hash password
    memberData.password = await bcrypt.hash(memberData.password, 12);

    const newMember = new Member({
      ...memberData,
      totalPoints: memberData.totalPoints || 0,
      totalHours: memberData.totalHours || 0,
      role: memberData.role || 'Member',
      isActive: memberData.isActive !== undefined ? memberData.isActive : true
    });

    console.log('Saving member:', newMember);
    await newMember.save();
    console.log('Member saved successfully');
    
    // Remove password from response
    const { password, ...memberResponse } = newMember.toObject();
    res.status(201).json(memberResponse);
  } catch (error) {
    console.error('Create member error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update a member
const updateMember = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 12);
    }
    
    const updatedMember = await Member.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedMember) return res.status(404).json({ message: 'Member not found' });
    
    // Remove password from response
    const { password, ...memberResponse } = updatedMember.toObject();
    res.status(200).json(memberResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a member
const deleteMember = async (req, res) => {
  try {
    const deletedMember = await Member.findByIdAndDelete(req.params.id);
    if (!deletedMember) return res.status(404).json({ message: 'Member not found' });
    res.status(200).json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember
};
