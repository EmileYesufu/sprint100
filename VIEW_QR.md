# 📱 How to Connect to Sprint100 via Expo Go

## Step 1: Look in Your Terminal

The QR code is displayed in your terminal where you ran `npm run start:ios:expo`

**What to look for:**
- A large square made of █ and ░ characters
- Text saying "Scan the QR code above with Expo Go"
- An `exp://` URL below the QR code

## Step 2: If QR Code is Not Visible

### Option A: Make Terminal Larger
1. Maximize your terminal window
2. Increase font size if needed
3. Scroll up to see the QR code

### Option B: Use Manual Connection
1. Open Expo Go on your iPhone
2. Look for the `exp://` URL in your terminal (example: `exp://192.168.1.250:8081`)
3. Manually enter this URL in Expo Go

### Option C: Check Expo Dev Tools
Run this command to open web UI:
```bash
cd client
npx expo start --tunnel
```

Then press `w` to open the web interface with a larger QR code.

## Step 3: Connect Your iPhone

1. **Install Expo Go** from App Store (if not already installed)

2. **Open Expo Go** on your iPhone

3. **Scan QR Code:**
   - Tap "Scan QR code" in Expo Go
   - Point camera at the QR code in your terminal
   - Sprint100 will load!

4. **Or Manual Entry:**
   - Tap "Enter URL manually"
   - Type the `exp://` URL from your terminal
   - Tap "Connect"

## Current Server Info

- **Your Mac IP:** 192.168.1.250
- **Metro Port:** 8081
- **API URL:** http://192.168.1.250:4000
- **Connection URL:** exp://192.168.1.250:8081

## Troubleshooting

**Can't see QR code?**
```bash
# Kill old processes
lsof -ti:8081 | xargs kill -9

# Restart with larger display
cd client
npx expo start --tunnel
```

**Still not working?**
- Check if Metro bundler is running (port 8081)
- Ensure your terminal supports Unicode characters
- Try pressing `Shift + r` to reload
- Look for the connection URL and enter it manually in Expo Go

---

**The QR code is in your terminal! Scroll up or maximize the window to see it.** 📱
