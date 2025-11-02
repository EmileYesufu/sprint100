# ✅ Xcode Setup Complete!

## 🎉 Status: READY TO BUILD

Your Sprint100 iOS project is now fully configured and ready to run in Xcode.

---

## 📱 What Was Done

✅ **Homebrew installed** at `/opt/homebrew/bin/brew`  
✅ **CocoaPods installed** at `/opt/homebrew/bin/pod`  
✅ **79 dependencies installed** via pod install  
✅ **Workspace created** at `ios/Sprint100.xcworkspace`  
✅ **Xcode opened** with the workspace  

---

## 🚀 Next Steps to Run the App

### 1. In Xcode (Already Open)

The workspace should now be open. If not, run:
```bash
open /Users/emile/sprint100-1/client/ios/Sprint100.xcworkspace
```

### 2. Select a Simulator

In Xcode's top toolbar:
- Click the device selector (next to Play button)
- Choose **iPhone 15 Pro** (or any iPhone simulator)

### 3. Start the Backend Server

Open a new Terminal window:
```bash
cd /Users/emile/sprint100-1/server
npm run dev
```

Server should start on `http://localhost:4000`

### 4. Build and Run

In Xcode:
- Press the **▶️ Play** button (or `Cmd + R`)
- First build takes 2-5 minutes
- App will launch in simulator automatically

---

## 🔧 Important Configuration

### Server URL (Already Set for Simulator)

The app is configured to use `localhost:4000` which works for iOS Simulator.

**Location:** `src/config.ts`
```typescript
export const SERVER_URL = "http://localhost:4000";
```

### For Physical Device Testing

If you want to test on a real iPhone:

1. Find your Mac's IP address:
   ```bash
   ipconfig getifaddr en0
   ```

2. Update `src/config.ts`:
   ```typescript
   export const SERVER_URL = "http://YOUR_IP:4000";
   ```

3. Connect your iPhone via USB
4. Select it in Xcode's device selector
5. Build and run (you may need to trust developer certificate)

---

## 📋 Features You Can Test

### Authentication Flow
1. Register new account (email + password)
2. Login with credentials
3. JWT token stored securely in device keychain

### Matchmaking Queue
1. Join queue to find opponent
2. See other players waiting
3. Auto-match when opponent found

### Race Game
1. Portrait-only full-screen UI
2. Tap left/right zones alternately
3. Real-time progress bars (0-100m)
4. See opponent's progress live
5. Match result with Elo changes

### Other Features
- Profile with match history
- Leaderboard with rankings
- Settings with logout

---

## 🐛 Troubleshooting

### Build Fails in Xcode

**Clean and rebuild:**
```
1. Cmd + Shift + K (Clean Build Folder)
2. Cmd + Shift + Option + K (Clear Derived Data)
3. Quit and reopen Xcode
4. Cmd + B (Build)
```

### Can't Connect to Server

**Check these:**
- Server is running: `cd ../server && npm run dev`
- Server shows: "Server listening on port 4000"
- `SERVER_URL` in `src/config.ts` is correct
- For simulator: use `localhost` or `127.0.0.1`
- For device: use your Mac's IP address

### "Library not found" or Pod Errors

**Re-install pods:**
```bash
cd /Users/emile/sprint100-1/client/ios
/opt/homebrew/bin/pod install
```

### Simulator Won't Launch

**Open manually:**
```bash
open -a Simulator
```

Then select device:
- Hardware → Device → iOS 17.x → iPhone 15 Pro
- Build again in Xcode

---

## 🔄 If You Need to Start Fresh

### Regenerate iOS Project

```bash
cd /Users/emile/sprint100-1/client

# Remove iOS folder
rm -rf ios

# Regenerate native project
npx expo prebuild --platform ios

# Install pods
cd ios
/opt/homebrew/bin/pod install

# Open workspace
open Sprint100.xcworkspace
```

---

## 📚 Development Workflow

### Daily Development
1. Start server: `cd server && npm run dev`
2. Open Xcode workspace (keep it open)
3. Make code changes in your editor
4. Xcode auto-rebuilds on save
5. Fast Refresh updates the app instantly

### Making Changes
- Edit screens in `src/screens/`
- Modify navigation in `src/navigation/`
- Update socket logic in `src/hooks/useSocket.ts`
- Change server URL in `src/config.ts`

### Debugging
- Use Xcode's debugger for native crashes
- Use console.log() for JavaScript debugging
- Check Xcode console for logs
- Network requests visible in Xcode console

---

## ⚙️ Build Configuration

### Current Settings
- **Bundle ID:** `com.sprint100.app`
- **Display Name:** Sprint100
- **Orientation:** Portrait only
- **Minimum iOS:** Set by Expo SDK 54
- **Architecture:** New Architecture enabled
- **JavaScript Engine:** Hermes
- **Build Type:** Debug (development)

### Portrait Mode
Enforced in multiple places:
- `app.json`: `"orientation": "portrait"`
- iOS specific: `"screenOrientation": "portrait"`
- No code changes needed - handled by Expo config

---

## 🎯 What's Next

### Test the Complete Flow
1. ✅ Launch app in simulator
2. ✅ Register a new account
3. ✅ Login with credentials
4. ✅ Join matchmaking queue
5. ✅ Open a second simulator to test multiplayer
6. ✅ Race against yourself
7. ✅ View match results and Elo changes

### Deploy to TestFlight (Future)
When ready for beta testing:
1. Change scheme to Release
2. Archive in Xcode
3. Upload to App Store Connect
4. Distribute via TestFlight

---

## 📞 Quick Commands Reference

```bash
# Open workspace
open /Users/emile/sprint100-1/client/ios/Sprint100.xcworkspace

# Start server
cd /Users/emile/sprint100-1/server && npm run dev

# Reinstall pods
cd /Users/emile/sprint100-1/client/ios && /opt/homebrew/bin/pod install

# Find your IP
ipconfig getifaddr en0

# Regenerate iOS project
cd /Users/emile/sprint100-1/client && npx expo prebuild --platform ios
```

---

## ✨ You're All Set!

**Xcode is open and ready to build.**  
Press ▶️ in Xcode to start the app!

**Important:** Always use `Sprint100.xcworkspace`, NOT `Sprint100.xcodeproj`

Happy coding! 🚀

