#!/bin/bash

echo "🚀 Starting Leo Club Management System..."
echo "📍 Access URLs:"
echo "   Landing Page: http://localhost:3000"
echo "   Admin Panel:  http://localhost:3001"
echo "   Backend API:  http://localhost:5001/api-docs"
echo ""

# Kill existing processes
echo "🔄 Stopping existing servers..."
pkill -f "node.*server.js"
pkill -f "react-scripts start"

# Start backend
echo "🔧 Starting Backend Server..."
cd backend && npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start landing page
echo "🌐 Starting Landing Page..."
cd ../frontend/landing && npm start &
LANDING_PID=$!

# Start admin panel
echo "⚙️ Starting Admin Panel..."
cd ../admin && npm start &
ADMIN_PID=$!

echo ""
echo "✅ All servers started!"
echo "🛑 Press Ctrl+C to stop all servers"

# Wait for user interrupt
trap 'echo "🛑 Stopping servers..."; kill $BACKEND_PID $LANDING_PID $ADMIN_PID; exit' INT
wait