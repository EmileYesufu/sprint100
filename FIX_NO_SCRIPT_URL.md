# ✅ Fix: "No Script URL Provided" Error

## The Problem

When you build and run the iOS app natively (through Xcode), you get:
```
unsanitizedScriptURLString = (null)
No script URL provided
```

## Why This Happens

The native iOS app is built in **DEBUG mode**, which means it expects to load JavaScript from a **running Metro bundler** (development server). If Metro isn't running, the app has no JavaScript to execute.

## The Solution

### Quick Fix (Right Now)

Metro bundler is now running! Just:

1. **Keep this terminal open** (Metro must stay running)
2. **Rebuild and run** your app in Xcode:
   - Click the ▶️ button in Xcode, OR
   - Press `Cmd + R` in the Simulator

The app should now load successfully! ✅

---

## For Future Use

### Method 1: Use the Helper Script (Easiest)

```bash
./START_IOS_APP.sh
```

This automatically:
- Starts Metro bundler
- Waits for it to be ready
- Shows you next steps

Then just run the app from Xcode!

---

### Method 2: Manual Process

**Terminal 1 - Start Metro:**
```bash
cd client
npx expo start
```

**Wait 10-15 seconds**, then:

**Terminal 2 - Run the app:**
```bash
cd client
npx expo run:ios
```

OR just click ▶️ in Xcode

---

### Method 3: Use Expo Go (Simplest for Testing)

Instead of native builds, use Expo Go:

```bash
cd client
npm start
```

Then scan the QR code with Expo Go app on your iPhone.

**Advantages:**
- No Xcode needed
- Faster development
- Works over WiFi/tunnel
- No build errors

---

## Understanding the Setup

### DEBUG Mode (Current)
- Loads JavaScript from Metro bundler
- **Requires Metro to be running**
- Fast refresh/hot reload works
- Better for development

### RELEASE Mode (Production)
- JavaScript is bundled into the app
- No Metro needed
- Slower to build
- Better for distribution

---

## Troubleshooting

### "Still getting the error!"

1. **Make sure Metro is running:**
   ```bash
   # In a separate terminal
   cd client
   npx expo start
   ```

2. **Wait 15 seconds** for Metro to fully start

3. **Rebuild** the app in Xcode (Clean Build Folder if needed):
   - Xcode menu: Product → Clean Build Folder
   - Then: Product → Run

### "Metro won't start!"

```bash
# Kill any stuck Metro processes
pkill -f "react-native.*start"
pkill -f "expo.*start"

# Try again
cd client
npx expo start
```

---

## Quick Reference

| What You Want | What To Do |
|---------------|------------|
| **Run from Xcode** | 1. Start Metro (`npx expo start`)<br>2. Click ▶️ in Xcode |
| **Quick testing** | Use Expo Go (`npm start` + scan QR) |
| **Automated** | Run `./START_IOS_APP.sh` |

---

## Bottom Line

**For native iOS builds: Always start Metro first!** 🚀

Metro = JavaScript server
No Metro = No JavaScript = Error

Keep Metro running in a terminal while you develop!


