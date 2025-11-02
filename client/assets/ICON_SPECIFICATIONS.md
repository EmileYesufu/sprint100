# Sprint100 App Icon Specifications

This document describes the requirements for the branded Sprint100 app icon.

## File Location
- **Path**: `/assets/icon.png`
- **Format**: PNG (no transparency)
- **Size**: 1024×1024 px (square)

## Design Specifications

### Visual Design
- **Background**: Black to dark gray gradient (`#000000` → `#121212`)
- **Accent Color**: Aqua neon green (`#00FFC6`)
- **Foreground**: Bold "S100" text or stylized "100" digits
- **Optional**: Diagonal speed streaks and circular motion blur glow
- **Style**: Minimal racing app icon, centered typography, glowing aqua accent, matte black gradient background

### Content Guidelines
- **Text**: "S100" or stylized "100" digits only
- **Safe Zone**: Keep all important content within 80% of the icon area (820×820 px)
- **No Text Outside**: Avoid text outside the center safe area
- **High Contrast**: Ensure icon is visible in both light and dark modes

### Technical Requirements
- **File Size**: Keep under 1 MB for optimal performance
- **No Transparency**: Use solid background (black/dark gray)
- **Resolution**: 1024×1024 px minimum
- **Format**: PNG with no alpha channel

## Platform-Specific Notes

### iOS
- Icon is automatically resized by Expo for all required iOS sizes
- Displayed on home screen, App Store, Settings, etc.

### Android
- Used as foreground image for adaptive icon
- Background color: `#000000` (black) for consistency with Stitch design
- Automatically resized for various Android icon sizes

## Current Configuration

The icon is configured in:
- `app.json`: `"icon": "./assets/icon.png"`
- `app.config.js`: `icon: "./assets/icon.png"`
- Android adaptive icon uses the same `icon.png` with `backgroundColor: "#000000"`

## Validation

After creating/updating the icon:
1. Run `npx expo start` to test locally
2. Check icon appears correctly in iOS Simulator
3. Check icon appears correctly in Android Emulator
4. Verify icon maintains clarity at small sizes
5. Test in both light and dark mode system settings

## Build Integration

When building with EAS:
```bash
npx eas build --platform all
```

Expo automatically resizes the 1024×1024 icon to all required platform sizes:
- iOS: Various sizes from 20×20 to 1024×1024
- Android: Various sizes from 48×48 to 512×512

