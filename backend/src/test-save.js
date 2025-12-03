require('dotenv').config();
const mongoose = require('mongoose');
const EventCategory = require('./models/eventCategoryModel');
const connectDB = require('./config/db');

(async () => {
  await connectDB();

  try {
    const doc = await EventCategory.create({
      name: "Test Category",
      description: "Save test",
      color: "#000000"
    });

    console.log("✅ SAVE SUCCESS:", doc);
  } catch (e) {
    console.error("❌ SAVE FAILED:", e.message);
  }

  await mongoose.disconnect();
})();
