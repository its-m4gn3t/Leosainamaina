// backend/src/app.js
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// -----------------------
// Initialize Express app
// -----------------------
const app = express(); // <-- THIS MUST BE BEFORE ANY app.use()

// -----------------------
// CORS Middleware
// -----------------------
const allowedOrigins = [
  'http://localhost:5001',
  'https://apis.leosainamailna.org',
  'https://lcs-admin.leosainamailna.org',
  'https://leosainamailna.org',
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow mobile/curl requests
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `CORS policy: Origin ${origin} not allowed`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight globally
app.options('*', cors());

// -----------------------
// Middleware
// -----------------------
app.use(express.json());

// Static files for certificates
app.use('/certificates', express.static('certificates'));

// -----------------------
// Routes
// -----------------------
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/members', require('./routes/memberRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/event-categories', require('./routes/eventCategoryRoutes'));
app.use('/api/qr', require('./routes/qrRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/friend-requests', require('./routes/friendRequestRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handling middleware
app.use(errorHandler);

module.exports = app;
