# 🔧 Timeout Issue - Fixed!

## Problem: Opening Project Request Timing Out

**Root Cause:** Tunnel mode (ngrok) can be slow or timeout. LAN mode is faster and more reliable.

---

## ✅ Solution: Use LAN Mode

### Quick Start (Recommended):

```bash
cd /Users/emile/sprint100-1
./START_LAN.sh
```

**This will:**
- Kill old processes
- Start Expo in LAN mode
- Show QR code faster
- More reliable connection

---

## 📱 Important: Same WiFi Network!

**Your iPhone MUST be on the same WiFi network as your Mac!**

✅ **Check WiFi on both devices:**
- Mac: Click WiFi icon → Note the network name
- iPhone: Settings → WiFi → Connect to SAME network

---

## 🚀 Three Ways to Connect

### Option 1: LAN Mode (Fastest - Recommended)
```bash
./START_LAN.sh
```
- **Pros:** Fast, reliable, no internet required
- **Cons:** iPhone must be on same WiFi

### Option 2: Tunnel Mode (Works Anywhere)
```bash
./START_EXPO_QR.sh
```
- **Pros:** Works with cellular data
- **Cons:** Can be slow, may timeout

### Option 3: Dev Client (Advanced)
```bash
cd client
npx expo start --dev-client
```
- **Pros:** Fastest performance
- **Cons:** Requires custom build

---

## 🎯 Current Setup (LAN Mode Running)

**Connection URL:** `exp://192.168.1.250:8081`

**On iPhone:**
1. Open Expo Go
2. Scan QR code (should appear in terminal)
3. OR manually enter: `exp://192.168.1.250:8081`

---

## 🐛 Still Timing Out?

### Check 1: WiFi Network
```bash
# On Mac, verify your IP:
ipconfig getifaddr en0

# Should show: 192.168.1.250
```

**On iPhone:** Settings → WiFi → Make sure you're connected to the same network

### Check 2: Firewall
```bash
# Temporarily disable firewall to test:
# System Settings → Network → Firewall → Turn Off (just for testing)
```

### Check 3: Restart Everything
```bash
# Kill all processes
pkill -f "expo start"
pkill -f "node"

# Restart
./START_LAN.sh
```

### Check 4: Try Different Port
```bash
cd client
npx expo start --lan --port 8082
```

---

## 📊 Speed Comparison

| Mode | Speed | Reliability | Network Required |
|------|-------|-------------|------------------|
| **LAN** | ⚡⚡⚡ Fast | ✅ High | Same WiFi |
| **Tunnel** | 🐌 Slow | ⚠️ Medium | Any (Internet) |
| **Localhost** | ⚡⚡⚡ Fast | ✅ High | Simulator only |

---

## ✅ What Should Work Now

**LAN mode is running!**

- ✅ Faster connection
- ✅ No timeout issues
- ✅ More reliable QR scanning
- ✅ Better performance

**Just make sure iPhone is on same WiFi and scan the QR code!** 📱

---

## 🆘 Last Resort

If LAN mode still doesn't work:

**Option A: Use iOS Simulator**
```bash
cd client
npx expo start
# Press 'i' to open iOS simulator
```

**Option B: Use Expo Dev Client**
```bash
cd client
npx expo run:ios
```

**Option C: Check Network Settings**
- Ensure no VPN is active
- Disable any proxy settings
- Check router allows device-to-device communication

---

**LAN mode is running now - try scanning the QR code again!** ⚡
