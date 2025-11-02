# Fix Network Request Failed Error

**Issue**: "Network request failed" error in development testing

## Root Cause
1. **Backend server not running** - The API server on port 4000 wasn't started
2. **IP address mismatch** - Config had wrong IP address (192.168.1.218 vs actual 192.168.1.140)

## ✅ Fixes Applied

### 1. Updated IP Address
- **File**: `client/src/config.ts`
- **Changed**: `192.168.1.218:4000` → `192.168.1.140:4000`
- **Your current IP**: 192.168.1.140

### 2. Started Backend Server
- Started with: `npm run dev` in `/server` directory
- Runs on: `http://localhost:4000` and `http://192.168.1.140:4000`

## 🔍 Verify It's Working

### Check Server Status
```bash
# Check if server is running
curl http://localhost:4000/health

# Or check the port
lsof -i :4000
```

### Test API Connection
```bash
# From your machine
curl http://192.168.1.140:4000/api/health
```

## 🚀 How to Start Servers

### Backend Server
```bash
cd /Volumes/EmileDrive/sprint100/server
npm run dev
```

### Expo Dev Server (already running)
```bash
cd /Volumes/EmileDrive/sprint100/client
npx expo start --dev-client
```

## 📱 For Different Devices

### iOS Simulator
- Use: `http://localhost:4000`
- Or: `http://127.0.0.1:4000`

### Physical Device (Same Network)
- Use: `http://192.168.1.140:4000`
- Make sure device is on same Wi-Fi network

### Remote Testing
- Use ngrok or similar tunnel
- Set `EXPO_PUBLIC_API_URL` in `.env` file

## 🔧 If IP Changes

Your IP might change if you:
- Connect to different network
- Restart network adapter

**To find your current IP**:
```bash
ipconfig getifaddr en0  # macOS Wi-Fi
ipconfig getifaddr en1  # macOS Ethernet
```

Then update `client/src/config.ts` with the new IP.

## ✅ Status

- ✅ IP address updated to 192.168.1.140
- ✅ Backend server should be starting
- ✅ Expo dev server running on port 8081

Try your app again - the network error should be resolved!

