# Sprint100 Release Build Guide

## 🚀 EAS Build Configuration

### Prerequisites
1. **Install EAS CLI:**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Initialize EAS:**
   ```bash
   cd client
   eas build:configure
   ```

### Build Profiles

#### Development Build
```bash
# Create development build for testing
eas build --profile development --platform ios
eas build --profile development --platform android
```

#### Preview Build
```bash
# Create preview build for internal testing
eas build --profile preview --platform ios
eas build --profile preview --platform android
```

#### Production Build
```bash
# Create production build for App Store/Play Store
eas build --profile production --platform ios
eas build --profile production --platform android
```

## 📱 iOS Build & TestFlight

### 1. Configure iOS Credentials
```bash
# Configure iOS credentials
eas credentials:configure --platform ios

# Or use existing credentials
eas credentials:configure --platform ios --profile production
```

### 2. Build iOS App
```bash
# Build for iOS
eas build --profile production --platform ios
```

### 3. Upload to TestFlight
```bash
# Submit to TestFlight
eas submit --platform ios --profile production
```

### 4. Manual TestFlight Upload
1. **Download the .ipa file** from EAS build
2. **Open Xcode** → Window → Organizer
3. **Drag the .ipa file** to the Organizer
4. **Upload to App Store Connect**
5. **Go to App Store Connect** → TestFlight
6. **Add testers** and send invitations

## 🤖 Android Build & Play Store

### 1. Configure Android Credentials
```bash
# Configure Android credentials
eas credentials:configure --platform android

# Or use existing credentials
eas credentials:configure --platform android --profile production
```

### 2. Build Android App
```bash
# Build for Android
eas build --profile production --platform android
```

### 3. Upload to Play Store
```bash
# Submit to Play Store
eas submit --platform android --profile production
```

## 🔧 Environment Configuration

### Development
```bash
# Set development environment
export APP_ENV=development
export EXPO_PUBLIC_API_URL=http://localhost:4000

# Build development version
eas build --profile development
```

### Preview/Staging
```bash
# Set preview environment
export APP_ENV=preview
export EXPO_PUBLIC_API_URL=https://staging-api.sprint100.com

# Build preview version
eas build --profile preview
```

### Production
```bash
# Set production environment
export APP_ENV=production
export EXPO_PUBLIC_API_URL=https://api.sprint100.com

# Build production version
eas build --profile production
```

## 📋 Build Checklist

### Before Building
- [ ] **Version Updated**: Increment version in app.json
- [ ] **API URL Set**: Correct EXPO_PUBLIC_API_URL for environment
- [ ] **Credentials Ready**: iOS/Android credentials configured
- [ ] **Assets Ready**: Icons, splash screens, and app store assets
- [ ] **Testing Complete**: All features tested in development

### iOS Specific
- [ ] **Bundle Identifier**: com.sprint100.app
- [ ] **Build Number**: Incremented for each build
- [ ] **App Store Connect**: App created and configured
- [ ] **TestFlight**: Testers added and invited
- [ ] **Privacy Policy**: Added to App Store Connect

### Android Specific
- [ ] **Package Name**: com.sprint100.app
- [ ] **Version Code**: Incremented for each build
- [ ] **Play Console**: App created and configured
- [ ] **Internal Testing**: Testers added
- [ ] **Privacy Policy**: Added to Play Console

## 🚨 Troubleshooting

### Build Failures
```bash
# Check build status
eas build:list

# View build logs
eas build:view [BUILD_ID]

# Cancel build
eas build:cancel [BUILD_ID]
```

### Credential Issues
```bash
# List credentials
eas credentials:list

# Remove credentials
eas credentials:remove --platform ios
eas credentials:remove --platform android

# Reconfigure credentials
eas credentials:configure --platform ios
eas credentials:configure --platform android
```

### Common Issues
1. **"No credentials found"**: Run `eas credentials:configure`
2. **"Build failed"**: Check build logs for specific errors
3. **"Upload failed"**: Verify app store configuration
4. **"Version conflict"**: Increment version/build number

## 📊 Build Status

### Check Build Status
```bash
# List all builds
eas build:list

# View specific build
eas build:view [BUILD_ID]

# Download build
eas build:download [BUILD_ID]
```

### Build History
```bash
# View build history
eas build:list --limit 10

# Filter by platform
eas build:list --platform ios
eas build:list --platform android
```

## 🔄 Continuous Integration

### GitHub Actions Example
```yaml
name: Build and Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -g @expo/eas-cli
      - run: eas login --non-interactive
      - run: eas build --profile production --platform all --non-interactive
```

## 📱 App Store Optimization

### iOS App Store
- **App Name**: Sprint100
- **Subtitle**: Fast-paced racing game
- **Keywords**: racing, multiplayer, competitive, speed
- **Category**: Games
- **Age Rating**: 4+

### Google Play Store
- **App Name**: Sprint100
- **Short Description**: Fast-paced racing game
- **Full Description**: Detailed description of features
- **Category**: Games
- **Content Rating**: Everyone

## 🎯 Release Timeline

### Week 1: Development
- [ ] Feature development
- [ ] Testing
- [ ] Bug fixes

### Week 2: Preview
- [ ] Preview build
- [ ] Internal testing
- [ ] Feedback collection

### Week 3: Production
- [ ] Production build
- [ ] App store submission
- [ ] TestFlight/Internal testing

### Week 4: Launch
- [ ] App store approval
- [ ] Public release
- [ ] Marketing launch

---

**💡 Pro Tip**: Always test preview builds before creating production builds. Use TestFlight for iOS and Internal Testing for Android.
