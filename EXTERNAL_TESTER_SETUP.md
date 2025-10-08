# 🌐 External Tester Setup (Different WiFi)

## Problem: User on Different WiFi Can't Connect

**Network request failure** = They can't reach http://192.168.1.250:4000

**Solution:** Use ngrok to create a public URL for your server!

---

## 🚀 Quick Fix (2 Steps)

### Step 1: Expose Your Server with ngrok

In a **new terminal**, run:

```bash
npx ngrok http 4000
```

**You'll see:**
```
Forwarding  https://abc-123-xyz.ngrok-free.app -> http://localhost:4000
```

**Copy that https URL!** (Example: `https://abc-123-xyz.ngrok-free.app`)

---

### Step 2: Update Your Client .env

```bash
cd /Users/emile/sprint100-1/client

# Edit .env and change EXPO_PUBLIC_API_URL:
nano .env
```

Change from:
```
EXPO_PUBLIC_API_URL=http://192.168.1.250:4000
```

To (use YOUR ngrok URL):
```
EXPO_PUBLIC_API_URL=https://abc-123-xyz.ngrok-free.app
```

Save and exit (Ctrl+X, Y, Enter)

---

### Step 3: Restart Expo with Tunnel Mode

```bash
cd /Users/emile/sprint100-1/client
npm start
```

Now `npm start` uses tunnel mode - works from ANY network!

---

### Step 4: Share QR Code with External Tester

The QR code in your terminal now works from anywhere:
- Different WiFi ✅
- Cellular data ✅
- Different location ✅

Just send them the QR code (screenshot) or the exp:// URL!

---

## 🔧 Complete 3-Terminal Setup

**Terminal 1: Server**
```bash
cd /Users/emile/sprint100-1/server
npm run dev
```

**Terminal 2: ngrok (expose server)**
```bash
npx ngrok http 4000
```
Copy the https URL!

**Terminal 3: Expo Client**
```bash
# Update .env first with ngrok URL!
cd /Users/emile/sprint100-1/client
npm start
```

---

## 📱 For External Tester

1. Install Expo Go on their iPhone
2. You send them the QR code
3. They scan with Expo Go
4. Wait 30 seconds
5. They can test signup/login!

---

## ✅ What This Enables

- ✅ Anyone can test from anywhere
- ✅ Works on different WiFi networks
- ✅ Works with cellular data
- ✅ No network configuration needed

---

## 🔒 Security Note

ngrok creates a **public URL** - anyone with the link can access your server.
- Only use for testing
- Use development database
- Don't expose production secrets

---

## 🎯 Summary

**For local testing (same WiFi):**
```bash
npm start
# Uses LAN mode (fast)
```

**For external testers (different WiFi):**
```bash
1. npx ngrok http 4000
2. Update .env with ngrok URL
3. npm start
4. Share QR code
```

---

**Now external testers can access your app from anywhere!** 🌐📱
