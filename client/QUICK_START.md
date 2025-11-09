# Sprint100 Quick Start Guide

## 🚀 Development Setup

### 1. Install Dependencies
```bash
cd client
npm install
```

### 2. Start Development Server
```bash
# Start Expo development server
npm start

# Or start with specific platform
npm run ios
npm run android
npm run web
```

### 3. Configure API URL
```bash
# Copy environment template
cp .env.example .env

# Default to production API
EXPO_PUBLIC_API_URL=https://sprint100-production.up.railway.app
EXPO_PUBLIC_WS_URL=wss://sprint100-production.up.railway.app
```

## 📱 Building for Production

### 1. Install EAS CLI
```bash
npm install -g @expo/eas-cli
```

### 2. Login to Expo
```bash
eas login
```

### 3. Configure EAS
```bash
eas build:configure
```

### 4. Build for iOS
```bash
# Development build
npm run build:development

# Preview build
npm run build:preview

# Production build
npm run build:production
```

### 5. Submit to App Store
```bash
# Submit to TestFlight
npm run submit:ios

# Submit to Play Store
npm run submit:android
```

## 🔧 Environment Configuration

### Production
```bash
# .env.production file
EXPO_PUBLIC_API_URL=https://sprint100-production.up.railway.app
EXPO_PUBLIC_WS_URL=wss://sprint100-production.up.railway.app
NODE_ENV=production
```

### Development
```bash
# .env.development file (optional for local work)
EXPO_PUBLIC_API_URL=http://localhost:4000
EXPO_PUBLIC_WS_URL=ws://localhost:4000
NODE_ENV=development
```

## 📋 Build Commands

### Development
```bash
npm start                    # Start development server
npm run ios                  # Start iOS simulator
npm run android              # Start Android emulator
npm run web                  # Start web version
```

### Building
```bash
npm run build:development    # Development build
npm run build:preview        # Preview build
npm run build:production     # Production build
npm run build:all            # Build for all platforms
```

### Submitting
```bash
npm run submit:ios           # Submit to iOS App Store
npm run submit:android       # Submit to Google Play Store
npm run submit:all           # Submit to both stores
```

### Credentials
```bash
npm run credentials:ios       # Configure iOS credentials
npm run credentials:android   # Configure Android credentials
npm run credentials:all       # Configure both platforms
```

## 🚨 Troubleshooting

### Common Issues
1. **Metro bundler not starting**: Run `npx expo start --clear`
2. **Build failing**: Check `eas build:list` for error details
3. **Credentials issues**: Run `eas credentials:configure`
4. **API connection**: Verify EXPO_PUBLIC_API_URL in .env

### Debug Commands
```bash
# Check build status
eas build:list

# View build logs
eas build:view [BUILD_ID]

# Check credentials
eas credentials:list

# Clear Metro cache
npx expo start --clear
```

## 📱 Testing

### Local Testing
```bash
# Start server
cd ../server && npm run dev

# Start client
cd ../client && npm start
```

### Device Testing
```bash
# Install Expo Go on your device
# Scan QR code from terminal
# Or use development build
npm run build:development
```

### TestFlight Testing
```bash
# Build and submit to TestFlight
npm run build:production
npm run submit:ios
```

## 🎯 Next Steps

1. **Configure API URL** for your environment
2. **Test locally** with development server
3. **Build preview** for internal testing
4. **Submit to stores** for public release

---

**💡 Pro Tip**: Always test preview builds before creating production builds!
