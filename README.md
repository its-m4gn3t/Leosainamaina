# Leo Club of Sainamaina Management System

A comprehensive full-stack web application for managing Leo Club activities, members, events, attendance, and communications with dual authentication systems and real-time synchronization.

## 🌟 Features

### 🏠 Public Website (Landing Page)
- **Professional Homepage** with hero section, stats, and focus areas
- **Events Showcase** with categorized event listings and status tracking
- **Announcements** with real-time updates
- **Founding Members** gallery with photos and bios
- **Member Authentication** with auto-generated credentials
- **Member Messaging** - Direct chat between members
- **QR Code Attendance** for event check-ins
- **Contact Form** with submission tracking
- **Mobile Responsive** with hamburger navigation

### 🔐 Admin Dashboard
- **Dual Authentication** - Admin JWT and member login systems
- **Event Management** - CRUD with categories, start/end dates, and QR codes
- **Event Categories** - Dynamic category management with colors
- **Attendance Tracking** - Manual and QR code-based attendance
- **Member Management** - Founding/regular members with login credentials
- **Messaging System** - Create group chats and direct messaging
- **Announcements** - Full CRUD operations with status tracking
- **Contact Management** - View and manage form submissions
- **Certificate Generation** - Create and download certificates
- **Mobile Responsive** - Hamburger menu and touch-friendly interface

### 🚀 Technical Features
- **Dual Authentication** - Admin JWT tokens and member credentials
- **Real-time Messaging** - Member-to-member and group chat functionality
- **Real-time Status Updates** - Automatic event status calculation
- **QR Code Integration** - Event attendance and member authentication
- **State Management** using Zustand with persistent storage
- **Responsive Design** with Tailwind CSS and mobile-first approach
- **Error Handling** with null safety and loading states
- **API Integration** with comprehensive REST endpoints

## 🛠 Technology Stack

**Backend:**
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- Swagger API Documentation
- CORS enabled

**Frontend:**
- React 18 with Hooks
- React Router v6
- Tailwind CSS
- Zustand (State Management)
- Axios (HTTP Client)

**Development:**
- Hot Reload
- Environment Variables
- Modular Architecture

## 📁 Project Structure

```
leo-club-management-system/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Business logic (events, members, attendance, messaging)
│   │   ├── models/         # MongoDB schemas (10 models)
│   │   ├── routes/         # API endpoints (10 route files)
│   │   ├── middlewares/    # Auth & error handling
│   │   ├── config/         # Database, Swagger, environment
│   │   ├── utils/          # PDF, QR code, token generators
│   │   └── seeders/        # Event category seeder
│   ├── certificates/       # Generated PDF certificates
│   └── package.json
├── frontend/
│   ├── landing/           # Public website
│   │   ├── src/
│   │   │   ├── components/ # Navbar, Footer
│   │   │   ├── pages/     # 11 pages including messaging
│   │   │   ├── store/     # Zustand store with persistence
│   │   │   └── api/       # Axios configuration
│   │   └── package.json
│   └── admin/             # Admin dashboard
│       ├── src/
│       │   ├── components/ # Modal, QR Generator
│       │   ├── pages/     # 10 admin pages including messaging
│       │   ├── layout/    # Responsive Sidebar & Topbar
│       │   ├── store/     # Admin state management
│       │   └── api/       # API client
│       └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (running locally or cloud)
- Git

### Installation

1. **Clone Repository**
```bash
git clone <repository-url>
cd leo-club-management-system
```

2. **Setup Backend**
```bash
cd backend
npm install
# Configure .env file
echo "MONGO_URI=mongodb://localhost:27017/leo-club" > .env
echo "JWT_SECRET=your_jwt_secret_here" >> .env
echo "PORT=5001" >> .env
npm start
```

3. **Setup Landing Page**
```bash
cd frontend/landing
npm install
echo "REACT_APP_API_URL=http://localhost:5001/api" > .env
npm start
```

4. **Setup Admin Dashboard**
```bash
cd frontend/admin
npm install
echo "REACT_APP_API_URL=http://localhost:5001/api" > .env
npm start
```

### Access URLs
- **Backend API:** http://localhost:5001/api-docs
- **Landing Page:** http://localhost:3000
- **Admin Dashboard:** http://localhost:3001

### Default Credentials
**Admin Login:**
- **Email:** `admin@leoclub.local`
- **Password:** `admin123`

**Member Login:**
- Members get auto-generated credentials when added
- Format: `firstname.lastname@leoclub.local` / `leo123`

## 📖 Usage Guide

### For Administrators
1. **Login** to admin dashboard at http://localhost:3001
2. **Add Events** with dates, locations, and descriptions
3. **Create Announcements** for public display
4. **Manage Founding Members** with photos and bios
5. **Generate Certificates** for events and achievements
6. **Generate QR Codes** for event attendance

### For Public Users
1. **Visit** the public website at http://localhost:3000
2. **Browse Events** and announcements
3. **View Founding Members** gallery
4. **Submit Contact Form** for inquiries
5. **Learn About** the club's mission and history

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Admin registration
- `POST /api/members/login` - Member login

### Events & Categories
- `GET /api/events` - List events with status
- `POST /api/events` - Create event with category
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `GET /api/event-categories` - List categories
- `POST /api/event-categories` - Create category

### Attendance
- `GET /api/attendance` - List attendance records
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/event/:id` - Event attendance
- `POST /api/attendance/qr` - QR code attendance

### Members
- `GET /api/members` - List members
- `POST /api/members` - Add member with credentials
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

### Announcements
- `GET /api/announcements` - List announcements
- `POST /api/announcements` - Create announcement
- `PUT /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Delete announcement

### Messaging
- `GET /api/chats` - List user chats
- `POST /api/chats/direct` - Create direct chat
- `POST /api/chats/group` - Create group chat (admin)
- `GET /api/chats/:id/messages` - Get chat messages
- `POST /api/chats/:id/messages` - Send message
- `PUT /api/chats/messages/:id/read` - Mark as read

### Contact & Certificates
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - List submissions (admin)
- `POST /api/certificates/generate` - Generate certificate
- `GET /api/qr/generate` - Generate QR codes

## 🎨 Key Features Showcase

### Enhanced Landing Page
- Member authentication with dashboard access
- QR code attendance scanning
- Event categorization with status indicators
- Real-time announcements and updates
- Mobile-first responsive design

### Advanced Admin Dashboard
- Comprehensive attendance management
- Event category system with color coding
- Contact form submission tracking
- Mobile-responsive hamburger navigation
- Real-time status calculations

### Dual Authentication System
- Admin JWT-based authentication
- Member credential auto-generation
- Protected routes and middleware
- Session persistence with Zustand

### Messaging System
- Member-to-member direct messaging
- Admin group chat creation
- Real-time message delivery
- Chat history and read receipts
- Mobile-responsive chat interface

### Attendance & QR Integration
- Manual attendance marking
- QR code generation for events
- Mobile QR scanning capability
- Attendance history tracking

## 🔒 Security Features

- JWT-based authentication
- Protected admin routes
- Input validation
- Error handling
- CORS configuration

## 📱 Mobile Responsiveness

- Hamburger navigation menu
- Touch-friendly interfaces
- Responsive grid layouts
- Optimized for all screen sizes

## 🚀 Deployment

### Local Development
- All services run on localhost
- Hot reload enabled
- Development-friendly error messages

### Production Ready
- Environment variable configuration
- Optimized builds
- Error logging
- Performance optimizations

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

MIT License - See LICENSE file for details

## 📞 Support

For support and questions:
- Email: info@leosainamaina.org
- Create an issue in the repository

---

**Leo Club of Sainamaina** - Empowering youth through community service and leadership development.
