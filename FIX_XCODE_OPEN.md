# Fix Xcode Opening Error

**Error**: `Unable to open base configuration reference file '/Volumes/EmileDrive/sprint100/client/ios/Pods/Target Support Files/Pods-Sprint100Dev/Pods-Sprint100Dev.debug.xcconfig'`

**Root Cause**: 
1. Xcode developer directory not set correctly
2. CocoaPods dependencies not installed

---

## 🔧 Step-by-Step Fix

### 1. Fix Xcode Developer Directory

Run this command in Terminal (requires password):

```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

Verify it worked:
```bash
xcode-select -p
```

Expected output:
```
/Applications/Xcode.app/Contents/Developer
```

---

### 2. Install CocoaPods Dependencies

Navigate to the iOS directory and install dependencies:

```bash
cd /Volumes/EmileDrive/sprint100/client/ios
pod install
```

This will:
- Install all native iOS dependencies
- Create the `Sprint100Dev.xcworkspace` file
- Generate the missing `.xcconfig` files

**Note**: This may take 5-10 minutes the first time.

---

### 3. Open the Workspace File

**⚠️ Important**: Always open the `.xcworkspace` file, NOT the `.xcodeproj` file!

```bash
# From the ios directory
open Sprint100Dev.xcworkspace

# Or from project root
open client/ios/Sprint100Dev.xcworkspace
```

---

## ✅ Verification

After running `pod install`, verify:

```bash
cd /Volumes/EmileDrive/sprint100/client/ios

# Check workspace exists
ls -la Sprint100Dev.xcworkspace

# Check Pods directory exists
ls -d Pods
```

Both should exist.

---

## 🔍 Troubleshooting

### "xcodebuild requires Xcode"

**Solution**: Ensure Xcode is installed and run step 1 above.

### "pod: command not found"

**Solution**: Install CocoaPods:
```bash
sudo gem install cocoapods
```

### Still seeing the same error after pod install

**Solution**: Close Xcode completely, then:
```bash
cd /Volumes/EmileDrive/sprint100/client/ios
rm -rf Pods Podfile.lock
pod install
open Sprint100Dev.xcworkspace
```

---

## 📝 Quick Reference

**Correct file to open**:
```
client/ios/Sprint100Dev.xcworkspace
```

**Absolute path**:
```
/Volumes/EmileDrive/sprint100/client/ios/Sprint100Dev.xcworkspace
```

**Never open**:
```
❌ client/ios/Sprint100Dev.xcodeproj (directly)
```

---

**Status**: After completing these steps, Xcode should open without errors.

