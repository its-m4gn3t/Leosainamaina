#!/bin/bash

ROOT="/home/magnet/lcSainamaina/leo-club-management-system/backend/src"
BACKUP="$ROOT/_backup_$(date +%s)"

echo ""
echo "=== Leo Club Backend Auto-Fix ==="
echo "Root: $ROOT"
echo "Backup: $BACKUP"
echo ""

mkdir -p "$BACKUP"

backup_file() {
  if [[ -f "$1" ]]; then
    cp "$1" "$BACKUP/"
    echo "✔ Backed up: $1"
  else
    echo "⚠ File not found: $1"
  fi
}

echo ""
echo "Backing up files..."
backup_file "$ROOT/config/db.js"
backup_file "$ROOT/app.js"
backup_file "$ROOT/server.js"
backup_file "$ROOT/seeders/eventCategorySeeder.js"

echo ""
echo "Fixing db.js..."
cat > "$ROOT/config/db.js" << 'EOF'
const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri || uri.trim() === "") {
    console.error("❌ ERROR: MONGO_URI is missing or empty.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.name} @ ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
EOF
echo "✔ db.js fixed"

echo ""
echo "Creating save-test script..."
cat > "$ROOT/test-save.js" << 'EOF'
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
EOF
echo "✔ test-save.js created"

echo ""
echo "Now run:"
echo "--------------------------------------"
echo "node $ROOT/test-save.js"
echo "--------------------------------------"
echo ""
echo "This will test if MongoDB is saving correctly."
