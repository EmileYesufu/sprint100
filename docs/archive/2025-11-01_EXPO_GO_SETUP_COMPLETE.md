# ✅ Expo Go Testing - Setup Complete!

Your Sprint100 project is now configured for **instant iPhone testing via Expo Go**!

## 🎯 What's Been Configured

### 1. ✅ Expo Configuration (`client/app.json`)
- Added `scheme: "sprint100"` for deep linking
- Added `platforms: ["ios", "android"]`
- Added EAS project configuration
- Ready for Expo Go scanning

### 2. ✅ Networking Setup
- **Auto-detected your Mac's IP:** `192.168.1.250`
- Updated `client/src/config.ts` to use `EXPO_PUBLIC_API_URL`
- Created `client/.env` with your local IP pre-configured:
  ```
  EXPO_PUBLIC_API_URL=http://192.168.1.250:4000
  ```
- Created `client/.env.example` as a template

### 3. ✅ Testing Scripts
- Added `npm run start:ios:expo` command
- Uses `--tunnel` mode for universal access
- Works even if iPhone is on cellular data

### 4. ✅ Documentation
- Created `EXPO_GO_TESTING.md` with comprehensive guide
- Includes troubleshooting steps
- QR code scanning instructions

## 🚀 Quick Start (3 Steps)

### Step 1: Start Backend
```bash
cd server
npm run dev
```

### Step 2: Start Expo
```bash
cd client
npm run start:ios:expo
```

### Step 3: Scan QR Code
1. Open **Expo Go** app on your iPhone (download from App Store)
2. Tap "Scan QR code"
3. Point camera at the QR code in your terminal
4. **Sprint100 loads instantly!** 🎉

## 📱 Expected Terminal Output

When you run `npm run start:ios:expo`, you should see:

```
Starting project at /Users/emile/sprint100-1/client
Starting Metro Bundler
...
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (iOS) to open your project
```

**Scan that QR code with Expo Go!**

## 🔧 Configuration Summary

| Item | Value | File |
|------|-------|------|
| Local IP | `192.168.1.250` | Auto-detected |
| API URL | `http://192.168.1.250:4000` | `client/.env` |
| Expo Scheme | `sprint100` | `client/app.json` |
| Bundle ID | `com.sprint100.app` | `client/app.json` |
| Testing Command | `npm run start:ios:expo` | `client/package.json` |

## 🌐 How It Works

1. **Tunnel Mode:** The `--tunnel` flag creates a public ngrok URL
2. **QR Code:** Contains the tunnel URL for Expo Go to connect
3. **Hot Reload:** Changes to your code reload instantly on iPhone
4. **No Build Required:** Expo Go interprets JavaScript in real-time

## 🎯 Testing Checklist

- [ ] Backend server running on port 4000
- [ ] Expo started with `npm run start:ios:expo`
- [ ] QR code visible in terminal
- [ ] Expo Go installed on iPhone
- [ ] Scan QR code with Expo Go
- [ ] App loads on iPhone
- [ ] Test login/registration
- [ ] Test online multiplayer
- [ ] Test training mode
- [ ] Verify socket connection works

## 🐛 Troubleshooting

### Issue: "Network request failed"
**Solution:** Verify `EXPO_PUBLIC_API_URL` in `.env` matches your current IP

### Issue: QR code won't scan
**Solution:** Use Expo Go app, not Camera app

### Issue: Can't connect to backend
**Solution:** Ensure backend is running and accessible at `http://192.168.1.250:4000`

### Issue: IP address changed
**Solution:** Run this to get new IP, then update `.env`:
```bash
ipconfig getifaddr en0
```

## 📚 Documentation

- **Full Testing Guide:** `EXPO_GO_TESTING.md`
- **External Testers:** `TESTER_README.md`
- **Environment Setup:** `client/.env.example`

## ✨ Next Steps

1. Run `cd client && npm run start:ios:expo`
2. Wait for QR code
3. Open Expo Go on iPhone
4. Scan QR code
5. Test Sprint100 features!

---

**Your project is ready for instant iPhone testing! 🏃‍♂️📱**

No Xcode builds, no TestFlight, no waiting — just scan and test!
