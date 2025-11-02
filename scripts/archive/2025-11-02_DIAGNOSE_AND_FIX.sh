#!/bin/bash

echo "🔍 Sprint100 Diagnostic & Fix"
echo "=============================="
echo ""

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"

# Check 1: Node installed?
echo "✓ Checking Node..."
node --version 2>/dev/null || echo "❌ Node not found"

# Check 2: Server running?
echo "✓ Checking Server..."
curl -s http://192.168.1.250:4000/api/login -d '{"email":"test","password":"test"}' -H "Content-Type: application/json" | grep -q "error" && echo "✅ Server responding" || echo "❌ Server not responding"

# Check 3: Port 8081 free?
echo "✓ Checking Port 8081..."
lsof -ti:8081 >/dev/null 2>&1 && echo "⚠️  Port 8081 in use - will clear" || echo "✅ Port 8081 free"

# Check 4: WiFi IP
echo "✓ Checking Network..."
IP=$(ipconfig getifaddr en0 2>/dev/null || echo "No IP")
echo "   Your IP: $IP"

echo ""
echo "🔧 Fixing Issues..."
echo "===================="

# Kill old Expo processes
pkill -9 -f "expo start" 2>/dev/null
lsof -ti:8081 | xargs kill -9 2>/dev/null
sleep 2

echo "✅ Cleaned up old processes"
echo ""
echo "🚀 Starting Expo..."
echo "===================="

cd client

# Start Expo with clear output
npx expo start --lan --clear

