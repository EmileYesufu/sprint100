# Sprint100 Testing Guide

## 🧪 Remote Testing Setup

### For External Testers

#### Option 1: Using Environment Variables (Recommended)
1. **Create `.env` file in the client directory:**
   ```bash
   cd client
   cp .env.example .env
   ```

2. **Edit `.env` file and set your API URL:**
   ```bash
   # For ngrok tunnel (recommended for testing)
   EXPO_PUBLIC_API_URL=https://your-ngrok-url.ngrok.io
   
   # For local network (if on same WiFi)
   EXPO_PUBLIC_API_URL=http://192.168.1.250:4000
   
   # For production server
   EXPO_PUBLIC_API_URL=https://api.sprint100.com
   ```

3. **Start the app:**
   ```bash
   npx expo start
   ```

#### Option 2: Using app.json Configuration
1. **Edit `client/app.json`:**
   ```json
   {
     "expo": {
       "extra": {
         "API_URL": "https://your-ngrok-url.ngrok.io"
       }
     }
   }
   ```

2. **Start the app:**
   ```bash
   npx expo start
   ```

### For Developers

#### Local Development Setup
1. **Start the server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Find your machine's IP:**
   ```bash
   # macOS/Linux
   ipconfig getifaddr en0
   
   # Windows
   ipconfig | findstr "IPv4"
   ```

3. **Update client configuration:**
   ```bash
   cd client
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```bash
   EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:4000
   ```

4. **Start the client:**
   ```bash
   npx expo start
   ```

#### Using ngrok for Public Testing
1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   ```

2. **Start your server:**
   ```bash
   cd server
   npm run dev
   ```

3. **Expose server with ngrok:**
   ```bash
   ngrok http 4000
   ```

4. **Copy the ngrok URL and set in client:**
   ```bash
   # In client/.env
   EXPO_PUBLIC_API_URL=https://abc123.ngrok.io
   ```

## 🔧 Configuration Priority

The app resolves API URL in this order:
1. **`EXPO_PUBLIC_API_URL`** (from .env file) - **Recommended for testing**
2. **`Constants.expoConfig?.extra?.API_URL`** (from app.json)
3. **`SERVER_URL`** (from .env file)
4. **Default IP** (fallback for local development)

## 📱 Testing on Different Devices

### iOS Simulator
- Uses localhost by default
- No network configuration needed

### Physical iPhone
- Requires your machine's IP address
- Must be on same WiFi network
- Use: `http://YOUR_IP:4000`

### Android Emulator
- Uses `10.0.2.2` instead of localhost
- Use: `http://10.0.2.2:4000`

### Physical Android Device
- Requires your machine's IP address
- Must be on same WiFi network
- Use: `http://YOUR_IP:4000`

## 🌐 Network Configuration Examples

### Local Network Testing
```bash
# Find your IP
ipconfig getifaddr en0  # macOS
ipconfig | findstr "IPv4"  # Windows

# Set in client/.env
EXPO_PUBLIC_API_URL=http://192.168.1.100:4000
```

### Public Testing with ngrok
```bash
# Start ngrok
ngrok http 4000

# Copy URL (e.g., https://abc123.ngrok.io)
# Set in client/.env
EXPO_PUBLIC_API_URL=https://abc123.ngrok.io
```

### Production Testing
```bash
# Set production URL
EXPO_PUBLIC_API_URL=https://api.sprint100.com
```

## 🚨 Troubleshooting

### "Network Error" or "Connection Refused"
1. **Check server is running:**
   ```bash
   curl http://localhost:4000/health
   ```

2. **Verify IP address:**
   ```bash
   # Check your IP
   ipconfig getifaddr en0
   
   # Test from device
   curl http://YOUR_IP:4000/health
   ```

3. **Check firewall settings:**
   - Allow port 4000 through firewall
   - Ensure server is listening on `0.0.0.0:4000`

### "Metro bundler not found"
1. **Restart Metro:**
   ```bash
   npx expo start --clear
   ```

2. **Check network connection:**
   - Ensure device and computer are on same WiFi
   - Try using ngrok for public access

### App shows "Using default IP" warning
1. **Set environment variable:**
   ```bash
   # In client/.env
   EXPO_PUBLIC_API_URL=http://YOUR_IP:4000
   ```

2. **Restart the app:**
   ```bash
   npx expo start --clear
   ```

## 📋 Testing Checklist

### Before Testing
- [ ] Server is running on port 4000
- [ ] Server is accessible from network
- [ ] Client has correct API URL configured
- [ ] Device and computer are on same network (for local testing)

### During Testing
- [ ] App connects to server successfully
- [ ] Login/Register works
- [ ] Socket connection established
- [ ] Race functionality works
- [ ] Leaderboard loads

### After Testing
- [ ] Report any connection issues
- [ ] Note which device/network was used
- [ ] Share any error messages

## 🔗 Quick Commands

### Start Development Environment
```bash
# Terminal 1: Start server
cd server && npm run dev

# Terminal 2: Start client
cd client && npx expo start
```

### Start with ngrok
```bash
# Terminal 1: Start server
cd server && npm run dev

# Terminal 2: Start ngrok
ngrok http 4000

# Terminal 3: Start client with ngrok URL
cd client
echo "EXPO_PUBLIC_API_URL=https://YOUR_NGROK_URL.ngrok.io" >> .env
npx expo start
```

### Reset Configuration
```bash
# Clear Metro cache
npx expo start --clear

# Reset environment
rm client/.env
cp client/.env.example client/.env
# Edit client/.env with your settings
```

---

**💡 Pro Tip**: For external testers, use ngrok for easy public access. For local testing, use your machine's IP address.
