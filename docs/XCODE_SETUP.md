# Sprint100 Xcode Setup Guide

**Last Updated**: 2025-11-02  
**Platform**: iOS Development  
**Project Type**: Expo / React Native

---

## 📱 Xcode Project Files

### Exact File to Open in Xcode

**Recommended (after setup)**:
```
client/ios/Sprint100Dev.xcworkspace
```

**Absolute Path**:
```
/Volumes/EmileDrive/sprint100/client/ios/Sprint100Dev.xcworkspace
```

**⚠️ Important**: Always open the `.xcworkspace` file, NOT the `.xcodeproj` file when using CocoaPods.

---

## 🚀 Setup Steps

### 1. Install CocoaPods Dependencies

Before opening in Xcode, you must install CocoaPods dependencies:

```bash
cd client/ios
pod install
```

This will:
- Install all native iOS dependencies
- Create the `Sprint100Dev.xcworkspace` file
- Link CocoaPods libraries

### 2. Open in Xcode

After running `pod install`, open the workspace:

```bash
# From project root
open client/ios/Sprint100Dev.xcworkspace

# Or navigate and open manually
cd client/ios
open Sprint100Dev.xcworkspace
```

**Alternative (if workspace doesn't exist)**:
```bash
# Temporary - but must run pod install first
open client/ios/Sprint100Dev.xcodeproj
```

---

## 📋 File Structure

```
client/ios/
├── Sprint100Dev.xcodeproj/     ← Project file (do NOT open directly)
├── Sprint100Dev.xcworkspace    ← Workspace file (OPEN THIS after pod install)
├── Podfile                      ← CocoaPods configuration
├── Podfile.properties.json     ← Expo Podfile properties
├── Sprint100Dev/                ← Native iOS code
└── Pods/                        ← Installed CocoaPods (created by pod install)
```

---

## ✅ Verification

### Check if Workspace Exists

```bash
cd client/ios
ls -la Sprint100Dev.xcworkspace
```

### Check if Pods are Installed

```bash
cd client/ios
ls -d Pods
```

If either doesn't exist, run:
```bash
pod install
```

---

## 🔧 Troubleshooting

### "No such file or directory: Sprint100Dev.xcworkspace"

**Solution**: Run `pod install` first
```bash
cd client/ios
pod install
```

### "The workspace file is missing dependencies"

**Solution**: Reinstall pods
```bash
cd client/ios
pod deintegrate
pod install
```

### "Cannot find module 'ExpoModules'"

**Solution**: Ensure pods are installed
```bash
cd client/ios
pod install
```

---

## 📝 Quick Reference

**To open project in Xcode**:
1. `cd client/ios`
2. `pod install` (first time only, or after dependency changes)
3. `open Sprint100Dev.xcworkspace`

**Project Configuration**:
- **Bundle Identifier**: `com.sprint100.app`
- **Target Name**: `Sprint100Dev`
- **Minimum iOS**: 13.4 (from Podfile)
- **Architecture**: New Architecture enabled (`newArchEnabled: true`)

---

**Last Verified**: 2025-11-02  
**Status**: ✅ Workspace file structure confirmed

