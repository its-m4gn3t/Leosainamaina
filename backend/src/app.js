const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

dotenv.config();
connectDB();

const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const eventRoutes = require('./routes/eventRoutes');
const eventCategoryRoutes = require('./routes/eventCategoryRoutes');
const qrRoutes = require('./routes/qrRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const contactRoutes = require('./routes/contactRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const chatRoutes = require('./routes/chatRoutes');
const friendRequestRoutes = require('./routes/friendRequestRoutes');
const galleryRoutes = require('./routes/galleryRoutes');

const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://192.168.100.6:3000', 'http://192.168.100.6:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());
app.use(express.json());

// Static files for certificates
app.use('/certificates', express.static('certificates'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/event-categories', eventCategoryRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/friend-requests', friendRequestRoutes);
app.use('/api/gallery', galleryRoutes);

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error middleware
app.use(errorHandler);

module.exports = app;
