# 🔧 Expo Go Not Working - Complete Fix Guide

## What "Not Working" Usually Means:

1. ❌ App won't load (stuck on splash screen)
2. ❌ Connection timeout
3. ❌ Red error screen
4. ❌ "Unable to connect to server"
5. ❌ QR code scans but nothing happens

---

## ✅ Complete Fix Checklist

### Step 1: Make Sure Server is Running

```bash
# Check if server is running
curl http://192.168.1.250:4000/api/login

# You should see: {"error":"invalid credentials"}
# If you see this, server is working!
```

**If not working:**
```bash
cd /Users/emile/sprint100-1/server
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh"
npm run dev
```

---

### Step 2: Use the Diagnostic Script

```bash
cd /Users/emile/sprint100-1
./DIAGNOSE_AND_FIX.sh
```

This will:
- ✅ Check all systems
- ✅ Fix common issues
- ✅ Start Expo properly
- ✅ Show QR code

---

### Step 3: Verify iPhone is on Same WiFi

**CRITICAL:** Both devices must be on the SAME WiFi network!

**On Mac:**
```bash
# Check your WiFi network
ipconfig getifaddr en0
# Should show: 192.168.1.250
```

**On iPhone:**
- Settings → WiFi
- Make sure you're connected to the SAME network as Mac

---

### Step 4: Scan QR Code Properly

1. **Open Expo Go** (not Camera app!)
2. **Tap "Scan QR code"** inside Expo Go
3. **Point at QR code** in terminal
4. **Wait** - first load takes 20-30 seconds

---

## 🐛 Specific Error Solutions

### Error: "Unable to connect to server"

**Solution:**
```bash
# Make sure server is accessible
curl http://192.168.1.250:4000/api/login

# If it fails, restart server:
cd server
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh"  
npm run dev
```

---

### Error: Red Screen / Runtime Error

**Common causes:**
1. Server not running → Start server
2. Wrong IP address → Check WiFi
3. Firewall blocking → Temporarily disable

**Fix:**
```bash
# Restart everything
./DIAGNOSE_AND_FIX.sh
```

---

### Error: QR Code Scans But Nothing Happens

**Solution:**
```bash
# Try manual URL entry
# In Expo Go: "Enter URL manually"
# Type: exp://192.168.1.250:8081
```

---

### Error: Taking Too Long / Timeout

**This is NORMAL for first load!**
- First load: 20-30 seconds ✅
- Just wait, don't cancel

**Or use simulator (much faster):**
```bash
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh"
cd client
npx expo start
# Press 'i' for iOS Simulator
```

---

## 🚀 Nuclear Option: Complete Reset

If nothing works, do a complete reset:

```bash
# 1. Kill everything
pkill -9 -f expo
pkill -9 -f metro
pkill -9 -f node
lsof -ti:4000 | xargs kill -9
lsof -ti:8081 | xargs kill -9

# 2. Start server
cd /Users/emile/sprint100-1/server
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh"
npm run dev

# 3. In NEW terminal, start Expo
cd /Users/emile/sprint100-1/client
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh"
npx expo start --lan --clear

# 4. Scan QR code
```

---

## 📱 Alternative: Use iOS Simulator (Fastest)

**Recommended if Expo Go keeps failing:**

```bash
cd /Users/emile/sprint100-1/client
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh"
npx expo start

# When menu appears, press 'i'
# Opens in iOS Simulator (3-5 seconds)
```

---

## ✅ Quick Checklist

Before asking for help, verify:

- [ ] Server running on port 4000
- [ ] Expo running on port 8081  
- [ ] Both on same WiFi (192.168.1.x)
- [ ] Using Expo Go app (not Camera)
- [ ] Waited 20-30 seconds for first load
- [ ] Tried manual URL: exp://192.168.1.250:8081

---

## 🆘 Still Not Working?

**Tell me EXACTLY what you see:**
1. What error message (exact text)?
2. Red screen or white screen or crash?
3. Does it timeout or just stuck?
4. Are you on same WiFi?

---

**Try the diagnostic script first:**
```bash
./DIAGNOSE_AND_FIX.sh
```

This fixes 90% of issues! 🎯
