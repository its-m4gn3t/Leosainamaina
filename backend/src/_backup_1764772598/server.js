require('dotenv').config({ path: '../.env' }); // point to backend/.env
const app = require('./app');
const { seedEventCategories } = require('./seeders/eventCategorySeeder');
const { Server } = require('socket.io');
const http = require('http');
const { socketAuth, handleConnection } = require('./socket/socketHandler');
const connectDB = require('./config/db');

connectDB();

const PORT = process.env.PORT || 5001;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://leosainamaina1.onrender.com",
      "https://lcsadmin.onrender.com"
    ],
    methods: ["GET", "POST"]
  }
});

io.use(socketAuth);
io.on('connection', (socket) => handleConnection(io, socket));

server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Socket.io server initialized');
  await seedEventCategories();
});
