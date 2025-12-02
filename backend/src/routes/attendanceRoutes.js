const express = require('express');
const router = express.Router();
const {
  getAllAttendance,
  getAttendanceByEvent,
  getAttendanceByMember,
  markAttendance,
  markQRAttendance,
  generateEventQR,
  deleteAttendance,
  getAttendanceStats
} = require('../controllers/attendanceController');

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Attendance management
 */

// Get all attendance records
router.get('/', getAllAttendance);

// Get attendance statistics
router.get('/stats', getAttendanceStats);

// Get attendance by event
router.get('/event/:eventId', getAttendanceByEvent);

// Get attendance by member
router.get('/member/:memberId', getAttendanceByMember);

// Mark manual attendance
router.post('/mark', markAttendance);

// Mark QR attendance
router.post('/qr', markQRAttendance);

// Generate QR code for event
router.post('/generate-qr/:eventId', generateEventQR);

// Delete attendance
router.delete('/:id', deleteAttendance);

module.exports = router;