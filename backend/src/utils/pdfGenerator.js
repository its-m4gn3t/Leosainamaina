const puppeteer = require('puppeteer');

const pdfGenerator = async (userId, eventId) => {
  // Dummy HTML template
  const html = `<h1>Certificate</h1><p>User: ${userId}</p><p>Event: ${eventId}</p>`;
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html);
  const pdfBuffer = await page.pdf({ format: 'A4' });
  await browser.close();

  // Save file locally (or upload to S3 in production)
  const fs = require('fs');
  const path = `./backend/certificates/certificate-${userId}-${eventId}.pdf`;
  fs.writeFileSync(path, pdfBuffer);
  return path;
};

module.exports = pdfGenerator;
