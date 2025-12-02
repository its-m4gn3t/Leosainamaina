const Attendance = require('../models/attendanceModel');
const Event = require('../models/eventModel');
const Member = require('../models/memberModel');

// Mark attendance
const markAttendance = async (req, res) => {
  try {
    const { userId, eventId } = req.body;

    const existing = await Attendance.findOne({ user: userId, event: eventId });
    if (existing) return res.status(400).json({ message: 'Attendance already marked' });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const newAttendance = new Attendance({ user: userId, event: eventId, points: event.totalHours * 2, hours: event.totalHours });
    await newAttendance.save();

    // Update member
    const member = await Member.findById(userId);
    member.totalPoints += newAttendance.points;
    member.totalHours += newAttendance.hours;
    await member.save();

    res.status(200).json({
      message: 'Attendance marked',
      points: newAttendance.points,
      hours: newAttendance.hours
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all attendance for an event
const getEventAttendance = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const records = await Attendance.find({ event: eventId }).populate('user', 'firstName lastName email');
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  markAttendance,
  getEventAttendance
};
