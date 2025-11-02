# Xcode Setup Guide

## Current Status
✅ iOS project generated successfully  
✅ Xcode project is open  
⚠️ CocoaPods dependencies not yet installed

## Complete Setup Steps

### 1. Install CocoaPods (one-time setup)
```bash
sudo gem install cocoapods
```
Enter your password when prompted.

### 2. Install Pod Dependencies
```bash
cd /Users/emile/sprint100-1/client/ios
pod install
```

This will:
- Install all React Native dependencies
- Create `Sprint100.xcworkspace` file
- Set up the proper Xcode workspace

### 3. Close Current Xcode and Reopen Workspace
```bash
# Close the current Xcode window, then:
open /Users/emile/sprint100-1/client/ios/Sprint100.xcworkspace
```

**Important:** Always use `.xcworkspace`, NOT `.xcodeproj` after running `pod install`

### 4. Configure Before Running

#### A. Update Server URL
Edit `src/config.ts`:
```typescript
// For iOS Simulator:
export const SERVER_URL = "http://localhost:4000";

// For physical device:
export const SERVER_URL = "http://YOUR_IP_ADDRESS:4000";
```

Find your IP:
```bash
ipconfig getifaddr en0
```

#### B. Start the Server
```bash
cd /Users/emile/sprint100-1/server
npm run dev
```

### 5. Build and Run in Xcode

1. Select a simulator from the top toolbar (e.g., iPhone 15 Pro)
2. Click the ▶️ Play button or press `Cmd + R`
3. Wait for the build to complete
4. The app will launch in the simulator

## Troubleshooting

### CocoaPods Installation Fails
If `sudo gem install cocoapods` fails, try:
```bash
# Install Homebrew first (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then install CocoaPods via Homebrew
brew install cocoapods
```

### Build Errors in Xcode
1. Clean build folder: `Cmd + Shift + K`
2. Clear derived data: `Cmd + Shift + Alt + K`
3. Rebuild: `Cmd + B`

### Can't Connect to Server
- Verify server is running on port 4000
- Check `SERVER_URL` in `src/config.ts`
- For simulator: use `localhost`
- For device: use your machine's IP address

### Module Not Found Errors
```bash
cd /Users/emile/sprint100-1/client
npm install
cd ios
pod install
```

## Alternative: Use Expo CLI (Recommended for Development)

Instead of Xcode, you can use Expo CLI which handles everything automatically:

```bash
cd /Users/emile/sprint100-1/client
npx expo run:ios
```

This will:
- Install CocoaPods automatically
- Build the app
- Launch in simulator
- Enable fast refresh for development

## Project Configuration

- **Portrait Mode:** Enforced in `app.json`
- **Bundle ID:** `com.sprint100.app`
- **Display Name:** Sprint100
- **Minimum iOS:** Set by Expo SDK 54

## Next Steps After Setup

1. Test authentication (Login/Register)
2. Test matchmaking queue
3. Test race functionality with tap zones
4. Check real-time updates via Socket.io
5. Test on physical device (change SERVER_URL)

