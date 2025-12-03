const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Better logging for replica sets
    const hosts = conn.connection.hosts?.map(h => `${h.host}:${h.port}`).join(', ') || conn.connection.host;
    console.log(`MongoDB Connected: ${conn.connection.name} @ ${hosts}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
