# 📱 Remote iPhone Tester - Complete Setup Guide

## Problem: "Network request failed" on Expo Go

**Root Cause:** The server is only accessible on your local network, but the remote tester is on a different network.

**Solution:** Expose your server publicly using ngrok and configure the client to use the public URL.

---

## ✅ What's Been Fixed

1. ✅ **Server binds to 0.0.0.0** - accessible from all network interfaces
2. ✅ **Configurable CORS** - allows remote connections
3. ✅ **Health endpoints** - /health and /ready for testing connectivity
4. ✅ **Client dynamic URL** - automatically uses ngrok URL when configured
5. ✅ **Logging enabled** - helps debug connection issues

---

## 🚀 Step-by-Step Setup

### **Prerequisites:**

1. ngrok account (free): https://dashboard.ngrok.com/signup
2. Install ngrok authtoken:
   ```bash
   ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
   ```

---

### **Step 1: Start Your Server**

```bash
cd /Users/emile/sprint100-1/server
npm run dev
```

**You should see:**
```
🚀 Sprint100 Server Started
   Environment: development
   Listening on: http://0.0.0.0:4000
   Local access: http://localhost:4000
   Health check: http://localhost:4000/health
   Network access: http://192.168.1.250:4000
```

**Keep this terminal open!**

---

### **Step 2: Expose Server with ngrok**

**Open a NEW terminal and run:**

```bash
ngrok http 4000
```

**You'll see:**
```
Session Status    online
Forwarding        https://abc-1234-xyz.ngrok-free.app -> http://localhost:4000
```

**📋 COPY THE HTTPS URL!** (Example: `https://abc-1234-xyz.ngrok-free.app`)

**Keep this terminal open!**

---

### **Step 3: Test ngrok URL from Your iPhone Safari**

**Before continuing, verify the tunnel works:**

On your iPhone, open Safari and go to:
```
https://your-ngrok-url.ngrok-free.app/health
```

**You should see:**
```json
{"status":"ok","timestamp":"2025-10-08T..."}
```

✅ If you see this, ngrok is working!  
❌ If you see ngrok interstitial page, click "Visit Site" button first

---

### **Step 4: Update Client Configuration**

**Option A: Use .env file (Quick)**

```bash
cd /Users/emile/sprint100-1/client

# Edit .env file
nano .env
```

Change `EXPO_PUBLIC_API_URL` to your ngrok URL:
```
EXPO_PUBLIC_API_URL=https://abc-1234-xyz.ngrok-free.app
```

Save: `Ctrl+X`, then `Y`, then `Enter`

**Option B: Use app.json (Shareable)**

Edit `client/app.json` and add to the `expo` section:
```json
{
  "expo": {
    "name": "Sprint100",
    ...
    "extra": {
      "API_URL": "https://abc-1234-xyz.ngrok-free.app",
      "eas": {
        "projectId": "auto-generate"
      }
    }
  }
}
```

---

### **Step 5: Start Expo with Tunnel Mode**

```bash
cd /Users/emile/sprint100-1/client
npx expo start --tunnel
```

**Wait for:**
```
Tunnel ready.
› Metro waiting on exp://...
› Scan the QR code above with Expo Go

[QR CODE APPEARS HERE]
```

**Keep this terminal open!**

---

### **Step 6: Share QR Code with Remote Tester**

1. **Take a screenshot** of the QR code in your terminal
2. **Send to your tester** via email/Slack/etc.

---

### **Step 7: Tester Scans QR Code**

**Remote tester on their iPhone:**

1. **Install Expo Go** from App Store
2. **Open Camera app** (not Expo Go directly)
3. **Point at QR code** you sent them
4. **Tap "Open in Expo Go"** notification
5. **Wait 30 seconds** (first load bundles code)
6. **App loads!** ✅

---

## 📋 Complete 3-Terminal Setup Summary

### **Terminal 1: Server**
```bash
cd /Users/emile/sprint100-1/server
npm run dev
```

### **Terminal 2: ngrok**
```bash
ngrok http 4000
# Copy the https URL!
```

### **Terminal 3: Expo Client**
```bash
cd /Users/emile/sprint100-1/client
# Update .env with ngrok URL first!
npx expo start --tunnel
# Share QR code screenshot with tester
```

---

## 🐛 Troubleshooting "Network request failed"

### ✅ Checklist:

- [ ] ngrok is running and shows "online"
- [ ] Tested ngrok URL in iPhone Safari (`/health` endpoint works)
- [ ] Updated client `.env` with ngrok HTTPS URL
- [ ] Restarted Expo client after updating .env
- [ ] Tester using HTTPS ngrok URL (not HTTP)
- [ ] Socket.IO also uses same ngrok URL

### Common Issues:

**1. "Network request failed" - Server unreachable**
```bash
# Test from iPhone Safari:
https://your-ngrok-url.ngrok-free.app/health

# Should show: {"status":"ok",...}
```

**2. CORS errors**
```bash
# Check server logs for CORS errors
# ALLOWED_ORIGINS should be "*" for testing
```

**3. HTTP vs HTTPS (iOS App Transport Security)**
```bash
# iOS requires HTTPS for network requests
# ngrok provides HTTPS automatically ✅
# Make sure you're using the https:// URL, not http://
```

**4. Socket.IO connection fails**
```bash
# Ensure Socket.IO uses same ngrok URL
# The client config handles this automatically
# Server CORS is already configured for Socket.IO
```

**5. ngrok interstitial page**
```bash
# First time visiting ngrok URL shows warning page
# Click "Visit Site" button
# URL works normally after that
```

---

## 🔍 Verification Steps

### **1. Test Server Accessibility:**

**From your iPhone Safari:**
```
https://your-ngrok-url.ngrok-free.app/health
```
Should return: `{"status":"ok"}`

### **2. Test API Endpoint:**

**From your iPhone Safari:**
```
https://your-ngrok-url.ngrok-free.app/api/register
```
Should return: `{"error":"email, password, and username required"}`

### **3. Check Client Config:**

In the app, watch console logs for:
```
🔗 Sprint100 will connect to: https://your-ngrok-url.ngrok-free.app
```

---

## 🎯 Quick Commands Reference

```bash
# Get your local IP (for DEFAULT_SERVER_URL)
ipconfig getifaddr en0

# Start server
cd server && npm run dev

# Expose with ngrok
ngrok http 4000

# Start Expo with tunnel
cd client && npx expo start --tunnel

# Test ngrok endpoint
curl https://your-ngrok-url.ngrok-free.app/health
```

---

## 📱 For the Remote Tester

**Send them:**

```
Hi! To test Sprint100:

1. Install "Expo Go" from App Store
2. Open Camera app (regular iPhone Camera)
3. Point at the QR code I'm sending
4. Tap "Open in Expo Go" when it appears
5. Wait 30 seconds for the app to load (first time only)
6. Try signing up and testing features!

Note: The first load takes 30 seconds because it's downloading
and bundling all the JavaScript code. After that, it's instant!

If you see any errors, send me a screenshot.
```

---

## 🔒 Security Notes

**For Temporary Testing:**
- ✅ ngrok URL is fine for short-term testing
- ✅ CORS set to `*` (all origins) - OK for testing
- ⚠️ Don't share ngrok URL publicly (anyone can access)
- ⚠️ ngrok free tier URLs change each time

**For Production:**
- Deploy to Render/Fly/Heroku (see `server/README_SERVER_TESTING.md`)
- Set specific CORS origins
- Use proper JWT secret
- Enable HTTPS only

---

## ✨ Summary

**The Fix:**
1. Server already binds to 0.0.0.0 ✅
2. ngrok exposes it with HTTPS ✅
3. Client configured to use ngrok URL ✅
4. Expo tunnel mode for QR code ✅

**Remote tester can now:**
- Scan QR code from anywhere ✅
- Connect to your server via ngrok ✅
- Test all features ✅

**Your local dev workflow unchanged:**
- `npm run dev` still works as before ✅
- All defaults remain the same ✅
- Just add ngrok when you need remote access ✅

---

**Follow the 3-terminal setup above and share the QR code!** 🚀📱

