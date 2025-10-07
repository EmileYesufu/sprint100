# Xcode Quick Start Guide

## 🚀 One-Command Setup

Open your **Terminal** and run:

```bash
cd /Users/emile/sprint100-1/client
bash INSTALL_COCOAPODS.sh
```

This script will:
1. Install Homebrew (if not already installed)
2. Install CocoaPods via Homebrew
3. Install all iOS dependencies (`pod install`)
4. Set up the workspace for Xcode

**You will be prompted for your password** during Homebrew/CocoaPods installation.

---

## 📱 After Installation

### 1. Open the Workspace in Xcode

```bash
open /Users/emile/sprint100-1/client/ios/Sprint100.xcworkspace
```

**⚠️ IMPORTANT:** Always open `.xcworkspace`, NOT `.xcodeproj` after running `pod install`

### 2. Configure Server URL

Before running, update `src/config.ts`:

```typescript
// For iOS Simulator (default):
export const SERVER_URL = "http://localhost:4000";

// For physical iPhone (replace with your IP):
export const SERVER_URL = "http://192.168.1.x:4000";
```

Find your IP address:
```bash
ipconfig getifaddr en0
```

### 3. Start the Backend Server

Open a new terminal:
```bash
cd /Users/emile/sprint100-1/server
npm run dev
```

### 4. Build and Run in Xcode

1. Select a simulator from the top menu (e.g., **iPhone 15 Pro**)
2. Click the **▶️ Play** button or press `Cmd + R`
3. Wait for build to complete (first build takes 2-5 minutes)
4. App will launch in the simulator

---

## 🔧 Manual Installation (If Script Fails)

### Step 1: Install Homebrew
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# For Apple Silicon Macs, add to PATH:
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### Step 2: Install CocoaPods
```bash
brew install cocoapods
```

### Step 3: Install iOS Dependencies
```bash
cd /Users/emile/sprint100-1/client/ios
pod install
```

### Step 4: Open Workspace
```bash
open Sprint100.xcworkspace
```

---

## 🐛 Troubleshooting

### "No such file or directory: ios/"
The iOS folder is gitignored. Regenerate it:
```bash
cd /Users/emile/sprint100-1/client
npx expo prebuild --platform ios
```

### Build Fails in Xcode
1. Clean build folder: `Cmd + Shift + K`
2. Clear derived data: `Cmd + Shift + Option + K`  
3. Quit and reopen Xcode
4. Build again: `Cmd + B`

### "Library not found" Errors
Re-install pods:
```bash
cd ios
pod deintegrate
pod install
```

### Can't Connect to Server
- Verify server is running: `cd ../server && npm run dev`
- Check `SERVER_URL` in `src/config.ts`
- For simulator: must use `localhost` or `127.0.0.1`
- For device: must use your machine's IP address

### Simulator Doesn't Launch
- Open Simulator manually: `open -a Simulator`
- Select a device: Hardware → Device → iOS 17.x → iPhone 15 Pro
- Try building again in Xcode

---

## ✅ Verify Setup

After successful build, you should see:
- Login/Register screen
- Portrait orientation enforced
- Ability to create account and login
- Access to Queue, Profile, Leaderboard, Settings tabs

---

## 📝 Development Workflow

1. Keep server running in one terminal
2. Make code changes in your editor
3. Xcode will auto-rebuild on save
4. Use Fast Refresh for instant updates
5. Use Xcode debugger for native issues

---

## 🔄 Regenerating iOS Project

If you need to start fresh:

```bash
cd /Users/emile/sprint100-1/client

# Remove existing iOS folder
rm -rf ios

# Regenerate
npx expo prebuild --platform ios

# Re-install pods
cd ios && pod install

# Reopen workspace
open Sprint100.xcworkspace
```

---

## 📚 Resources

- [CocoaPods Documentation](https://cocoapods.org/)
- [Expo Prebuild Guide](https://docs.expo.dev/workflow/prebuild/)
- [React Native iOS Setup](https://reactnative.dev/docs/environment-setup)

