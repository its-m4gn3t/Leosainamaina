const Certificate = require('../models/certificateModel');
const Member = require('../models/memberModel');
const Event = require('../models/eventModel');
const puppeteer = require('puppeteer');
const path = require('path');

// Generate PDF certificate
const generateCertificate = async (req, res) => {
  try {
    const { recipientName, eventId, certificateType } = req.body;
    
    if (!recipientName) {
      return res.status(400).json({ message: 'Recipient name is required' });
    }

    let event = null;
    if (eventId) {
      event = await Event.findById(eventId);
    }

    const timestamp = Date.now();
    const fileName = `${recipientName.replace(/\s+/g, '_')}_${timestamp}.pdf`;
    const pdfPath = path.join(__dirname, `../../certificates/${fileName}`);

    // Create certificates directory if it doesn't exist
    const fs = require('fs');
    const certDir = path.join(__dirname, '../../certificates');
    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir, { recursive: true });
    }

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    const certificateHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Times New Roman', serif; text-align: center; padding: 50px; }
          .certificate { border: 10px solid #f4a261; padding: 40px; margin: 20px; }
          .title { font-size: 48px; color: #e76f51; margin-bottom: 20px; }
          .subtitle { font-size: 24px; color: #264653; margin-bottom: 30px; }
          .recipient { font-size: 36px; color: #2a9d8f; font-weight: bold; margin: 20px 0; }
          .event { font-size: 20px; color: #264653; margin: 15px 0; }
          .date { font-size: 16px; color: #6c757d; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="certificate">
          <h1 class="title">🏆 CERTIFICATE</h1>
          <h2 class="subtitle">OF ${certificateType.toUpperCase()}</h2>
          <p>This is to certify that</p>
          <h3 class="recipient">${recipientName}</h3>
          <p>has successfully ${certificateType === 'participation' ? 'participated in' : 'completed'}</p>
          ${event ? `<p class="event"><strong>${event.title}</strong></p>` : '<p class="event"><strong>Leo Club Activities</strong></p>'}
          <p>Presented by <strong>Leo Club of Sainamaina</strong></p>
          <p class="date">Date: ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `;
    
    await page.setContent(certificateHTML);
    await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
    await browser.close();

    const certificate = new Certificate({ 
      recipientName,
      eventId: eventId || null,
      certificateType,
      pdfUrl: `/certificates/${fileName}`,
      issuedAt: new Date()
    });
    await certificate.save();

    res.status(200).json({
      _id: certificate._id,
      recipientName: certificate.recipientName,
      eventId: certificate.eventId,
      certificateType: certificate.certificateType,
      fileUrl: `http://localhost:5001/certificates/${fileName}`,
      issuedAt: certificate.issuedAt
    });
  } catch (error) {
    console.error('Certificate generation error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all certificates
const getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find().populate('eventId', 'title').sort({ issuedAt: -1 });
    res.status(200).json(certificates);
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateCertificate,
  getAllCertificates
};
