const Attendance = require('../models/attendanceModel');
const Event = require('../models/eventModel');
const Member = require('../models/memberModel');
const crypto = require('crypto');

// Get all attendance records
const getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate('member', 'firstName lastName email')
      .populate('event', 'title date category')
      .sort({ createdAt: -1 });
    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance by event
const getAttendanceByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const attendance = await Attendance.find({ event: eventId })
      .populate('member', 'firstName lastName email image position')
      .populate('event', 'title date category totalHours')
      .sort({ checkInTime: -1 });
    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance by member
const getAttendanceByMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const attendance = await Attendance.find({ member: memberId })
      .populate('event', 'title date category totalHours')
      .sort({ checkInTime: -1 });
    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Manual attendance marking
const markAttendance = async (req, res) => {
  try {
    const { memberId, eventId, notes } = req.body;
    
    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if member exists
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    // Check if attendance already exists
    const existingAttendance = await Attendance.findOne({ member: memberId, event: eventId });
    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already marked for this event' });
    }
    
    const attendance = new Attendance({
      member: memberId,
      event: eventId,
      attendanceMethod: 'manual',
      hours: event.totalHours,
      points: event.totalHours * 10, // 10 points per hour
      notes
    });
    
    await attendance.save();
    
    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('member', 'firstName lastName email')
      .populate('event', 'title date category');
    
    res.status(201).json(populatedAttendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// QR attendance marking
const markQRAttendance = async (req, res) => {
  try {
    const { qrToken, memberId } = req.body;
    
    if (!qrToken || !memberId) {
      return res.status(400).json({ message: 'QR token and member ID are required' });
    }
    
    // Find event by QR token (stored in event's qrCode field)
    const event = await Event.findOne({ qrCode: qrToken });
    if (!event) {
      return res.status(404).json({ message: 'Invalid QR code or event not found' });
    }
    
    // Check if member exists
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    // Check if attendance already exists
    const existingAttendance = await Attendance.findOne({ member: memberId, event: event._id });
    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already marked for this event' });
    }
    
    const attendance = new Attendance({
      member: memberId,
      event: event._id,
      attendanceMethod: 'qr',
      qrToken,
      hours: event.totalHours,
      points: event.totalHours * 10
    });
    
    await attendance.save();
    
    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('member', 'firstName lastName email')
      .populate('event', 'title date category');
    
    res.status(201).json(populatedAttendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate QR code for event
const generateEventQR = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Generate unique QR token
    const qrToken = crypto.randomBytes(16).toString('hex');
    
    // Update event with QR code
    event.qrCode = qrToken;
    await event.save();
    
    res.status(200).json({ 
      qrToken,
      qrUrl: `http://192.168.100.6:3000/attendance/qr?token=${qrToken}&event=${eventId}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete attendance
const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAttendance = await Attendance.findByIdAndDelete(id);
    if (!deletedAttendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.status(200).json({ message: 'Attendance deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance statistics
const getAttendanceStats = async (req, res) => {
  try {
    const totalAttendance = await Attendance.countDocuments();
    const totalMembers = await Member.countDocuments();
    const totalEvents = await Event.countDocuments();
    
    const memberStats = await Attendance.aggregate([
      {
        $group: {
          _id: '$member',
          totalEvents: { $sum: 1 },
          totalHours: { $sum: '$hours' },
          totalPoints: { $sum: '$points' }
        }
      },
      {
        $lookup: {
          from: 'members',
          localField: '_id',
          foreignField: '_id',
          as: 'member'
        }
      },
      {
        $unwind: '$member'
      },
      {
        $project: {
          memberName: { $concat: ['$member.firstName', ' ', '$member.lastName'] },
          totalEvents: 1,
          totalHours: 1,
          totalPoints: 1
        }
      },
      { $sort: { totalPoints: -1 } },
      { $limit: 10 }
    ]);
    
    res.status(200).json({
      totalAttendance,
      totalMembers,
      totalEvents,
      topMembers: memberStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllAttendance,
  getAttendanceByEvent,
  getAttendanceByMember,
  markAttendance,
  markQRAttendance,
  generateEventQR,
  deleteAttendance,
  getAttendanceStats
};