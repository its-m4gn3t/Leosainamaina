const QRCode = require('qrcode');

const generateQR = async (data) => {
  try {
    return await QRCode.toDataURL(JSON.stringify(data));
  } catch (error) {
    throw new Error('QR Generation failed');
  }
};

module.exports = generateQR;
