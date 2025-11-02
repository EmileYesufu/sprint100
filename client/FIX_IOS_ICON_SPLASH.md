# Fix iOS App Icon and Splash Screen

## Problem
App icon and splash screen are missing on iPhone after build.

## Solution
The native iOS asset catalogs have been updated manually. For proper synchronization:

### Option 1: Rebuild with Expo (Recommended)
```bash
cd client
npx expo run:ios
```

This will:
- Automatically sync assets from `app.json` to iOS native project
- Regenerate asset catalogs
- Build and run on simulator

### Option 2: Manual Asset Update (Already Done)
Assets have been copied:
- ✅ `assets/icon.png` → `ios/Sprint100/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png`
- ✅ `assets/splash-icon.png` → `ios/Sprint100/Images.xcassets/SplashScreen.imageset/image.png`

### Option 3: Clean Prebuild (If needed)
```bash
cd client
npx expo prebuild --platform ios --clean
```

**Note**: This regenerates the entire iOS native project. Only use if assets still don't appear after rebuild.

## Current Configuration

### app.json
- Icon: `./assets/icon.png`
- Splash: `./assets/splash-icon.png` with `backgroundColor: "#000000"`

### iOS Native Assets
- App Icon: `ios/Sprint100/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png`
- Splash Screen: `ios/Sprint100/Images.xcassets/SplashScreen.imageset/image.png`

## Verification

After rebuilding:
1. Check app icon appears on iOS home screen
2. Check splash screen appears on app launch
3. Verify icon is visible in Xcode project navigator

## Troubleshooting

If assets still don't appear:
1. Clean Xcode build folder (Cmd+Shift+K)
2. Delete DerivedData
3. Run `npx expo run:ios` again
4. Check Xcode asset catalogs are properly referenced in project

