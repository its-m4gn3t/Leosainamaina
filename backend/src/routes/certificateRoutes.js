const express = require('express');
const router = express.Router();
const {
  generateCertificate,
  getAllCertificates
} = require('../controllers/certificateController');

/**
 * @swagger
 * tags:
 *   name: Certificates
 *   description: PDF certificate generation
 */

/**
 * @swagger
 * /certificates/generate:
 *   post:
 *     summary: Generate a certificate
 *     tags: [Certificates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientName
 *             properties:
 *               recipientName:
 *                 type: string
 *                 example: John Doe
 *               eventId:
 *                 type: string
 *                 example: 64f23c1e...
 *               certificateType:
 *                 type: string
 *                 enum: [participation, appreciation, achievement, completion]
 *                 example: participation
 *     responses:
 *       200:
 *         description: Certificate generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pdfUrl:
 *                   type: string
 *                   example: http://localhost:5001/certificates/64f23b6c-event.pdf
 */
router.post('/generate', generateCertificate);

/**
 * @swagger
 * /certificates:
 *   get:
 *     summary: Get all certificates
 *     tags: [Certificates]
 *     responses:
 *       200:
 *         description: List of certificates
 */
router.get('/', getAllCertificates);

module.exports = router;
