const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getEventAttendance
} = require('../controllers/qrController');

/**
 * @swagger
 * tags:
 *   name: QR Attendance
 *   description: QR code attendance management
 */

/**
 * @swagger
 * /qr/mark:
 *   post:
 *     summary: Mark attendance for a user at an event
 *     tags: [QR Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - eventId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 64f23b6c...
 *               eventId:
 *                 type: string
 *                 example: 64f23c1e...
 *     responses:
 *       200:
 *         description: Attendance marked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Attendance marked
 *                 points:
 *                   type: number
 *                   example: 10
 *                 hours:
 *                   type: number
 *                   example: 4
 */
router.post('/mark', markAttendance);

/**
 * @swagger
 * /qr/event/{eventId}:
 *   get:
 *     summary: Get all attendees for an event
 *     tags: [QR Attendance]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: List of attendees
 */
router.get('/event/:eventId', getEventAttendance);

module.exports = router;
