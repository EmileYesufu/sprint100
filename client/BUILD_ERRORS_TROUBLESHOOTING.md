# Xcode Build Errors - Troubleshooting Guide

## 🚨 Issue: Build Failing in Xcode

### Root Cause
During pod install, there were warnings about `xcode-select`:
```
xcode-select: error: tool 'xcodebuild' requires Xcode, 
but active developer directory '/Library/Developer/CommandLineTools' 
is a command line tools instance
```

This means your system is pointing to Command Line Tools instead of Xcode.app, which causes build failures.

---

## ✅ Quick Fix (Run This First)

Open your **Terminal** and run:

```bash
cd /Users/emile/sprint100-1/client
bash FIX_XCODE_BUILD.sh
```

This automated script will:
1. ✅ Point xcode-select to Xcode.app
2. ✅ Accept Xcode license
3. ✅ Verify Xcode installation
4. ✅ Clean and reinstall CocoaPods
5. ✅ Set up everything correctly

**You'll be prompted for your password** - this is normal.

---

## 🔧 Manual Fix (If Script Fails)

### Step 1: Fix xcode-select Path

```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

Verify it worked:
```bash
xcode-select -p
# Should output: /Applications/Xcode.app/Contents/Developer
```

### Step 2: Accept Xcode License

```bash
sudo xcodebuild -license accept
```

### Step 3: Clean and Reinstall Pods

```bash
cd /Users/emile/sprint100-1/client/ios

# Deintegrate existing pods
/opt/homebrew/bin/pod deintegrate

# Remove lock file
rm -f Podfile.lock

# Clean cache
/opt/homebrew/bin/pod cache clean --all

# Reinstall
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
/opt/homebrew/bin/pod install
```

### Step 4: Clean Xcode Project

In Xcode:
1. Close Xcode completely (`Cmd + Q`)
2. Reopen workspace:
   ```bash
   open /Users/emile/sprint100-1/client/ios/Sprint100.xcworkspace
   ```
3. Clean build folder: `Cmd + Shift + K`
4. Clear derived data: `Cmd + Shift + Option + K`
5. Build: `Cmd + B`

---

## 🔍 Common Build Errors & Solutions

### Error: "Library not found"

**Solution:** Reinstall pods
```bash
cd ios
/opt/homebrew/bin/pod install
```

### Error: "Module 'XYZ' not found"

**Solution:** Clean and rebuild
1. `Cmd + Shift + K` (Clean)
2. `Cmd + Shift + Option + K` (Clear Derived Data)
3. `Cmd + B` (Build)

### Error: "Command PhaseScriptExecution failed"

**Solution:** Check node is in PATH
```bash
# Verify node is accessible
which node

# If not found, add to Xcode's build settings:
# Build Settings → Search "PATH" → Add:
# $HOME/.nvm/versions/node/v{YOUR_VERSION}/bin
```

### Error: "Signing certificate issues"

**Solution:** 
1. Xcode → Signing & Capabilities
2. Select your Team
3. Let Xcode manage signing automatically

### Error: "Unable to boot simulator"

**Solution:**
```bash
# Quit Xcode
# Open Simulator manually
open -a Simulator

# Select device: Hardware → Device → iOS 17.x → iPhone 15 Pro
# Reopen Xcode and build
```

---

## 🏗️ Complete Clean Rebuild

If all else fails, do a complete clean rebuild:

```bash
cd /Users/emile/sprint100-1/client

# 1. Remove iOS folder
rm -rf ios

# 2. Remove node_modules
rm -rf node_modules

# 3. Reinstall dependencies
npm install

# 4. Regenerate iOS project
npx expo prebuild --platform ios

# 5. Install pods with proper environment
cd ios
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
/opt/homebrew/bin/pod install

# 6. Open workspace
open Sprint100.xcworkspace
```

---

## 📋 Pre-Build Checklist

Before building in Xcode, verify:

- [ ] xcode-select points to Xcode.app:
  ```bash
  xcode-select -p
  # Should be: /Applications/Xcode.app/Contents/Developer
  ```

- [ ] Xcode is installed and up to date
  ```bash
  xcodebuild -version
  # Should show Xcode version
  ```

- [ ] CocoaPods installed:
  ```bash
  /opt/homebrew/bin/pod --version
  ```

- [ ] Workspace exists:
  ```bash
  ls /Users/emile/sprint100-1/client/ios/Sprint100.xcworkspace
  ```

- [ ] Using workspace, NOT project file
  - ✅ Open: `Sprint100.xcworkspace`
  - ❌ Don't use: `Sprint100.xcodeproj`

- [ ] Server is running:
  ```bash
  cd /Users/emile/sprint100-1/server
  npm run dev
  ```

---

## 🎯 After Fixes

Once fixes are applied:

1. **Quit Xcode completely** (`Cmd + Q`)
2. **Reopen the workspace:**
   ```bash
   open /Users/emile/sprint100-1/client/ios/Sprint100.xcworkspace
   ```
3. **Select iPhone 15 Pro** simulator
4. **Clean build folder:** `Cmd + Shift + K`
5. **Build:** `Cmd + B` (or press ▶️)
6. **Wait for build** (2-5 minutes first time)

---

## 📝 What to Share if Build Still Fails

If the build still fails after all fixes, please share:

1. **Full error message** from Xcode
2. **xcode-select output:**
   ```bash
   xcode-select -p
   ```
3. **Xcode version:**
   ```bash
   xcodebuild -version
   ```
4. **Pod version:**
   ```bash
   /opt/homebrew/bin/pod --version
   ```
5. **Build log** from Xcode (Product → Build → Show Build Log)

---

## 🔄 Alternative: Use Expo CLI Instead

If Xcode continues to have issues, you can use Expo's CLI to build and run:

```bash
cd /Users/emile/sprint100-1/client

# This handles everything automatically
npx expo run:ios
```

Expo CLI will:
- Install CocoaPods if needed
- Build the app
- Launch simulator
- Start Metro bundler

---

## ✅ Success Indicators

Build is successful when you see:
- ✅ "Build Succeeded" message in Xcode
- ✅ Simulator launches automatically
- ✅ App appears on simulator home screen
- ✅ Login/Register screen displays
- ✅ No crash on launch

---

## 📚 Additional Resources

- [Xcode Build Settings](https://developer.apple.com/documentation/xcode/build-settings-reference)
- [CocoaPods Troubleshooting](https://guides.cocoapods.org/using/troubleshooting.html)
- [Expo iOS Setup](https://docs.expo.dev/workflow/ios-simulator/)
- [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)

