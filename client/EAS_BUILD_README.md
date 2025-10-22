# 🏗️ Building the App with EAS

Sprint100 is configured for production-ready iOS and Android builds using Expo Application Services (EAS) Build.

## 📋 Prerequisites

1. **Expo Account**: Create a free account at [expo.dev](https://expo.dev)
2. **EAS CLI**: Install globally with `npm install -g @expo/eas-cli`
3. **Authentication**: Log in with `npx eas login`

## 🔧 Configuration Files

### eas.json
```json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      },
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.sprint100.com"
      }
    },
    "production": {
      "distribution": "store",
      "ios": {
        "simulator": false,
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "app-bundle"
      },
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.sprint100.com"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD123456"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

### app.json Configuration
- ✅ **iOS Bundle ID**: `com.sprint100.app`
- ✅ **Android Package**: `com.sprint100.app`
- ✅ **API URL**: Points to production URL (no localhost)
- ✅ **Assets**: All required icons and splash screens present
- ✅ **Version**: `1.0.0` with proper build numbers

## 🚀 Build Commands

### Development Builds
```bash
# iOS development build
npx eas build --platform ios --profile development

# Android development build
npx eas build --platform android --profile development
```

### Preview Builds
```bash
# iOS simulator build
npx eas build --platform ios --profile preview

# Android APK build
npx eas build --platform android --profile preview
```

### Production Builds
```bash
# iOS App Store build
npx eas build --platform ios --profile production

# Android Play Store build
npx eas build --platform android --profile production
```

### Build All Platforms
```bash
# Build both iOS and Android for production
npx eas build --platform all --profile production
```

## 📱 Build Profiles Explained

### Development
- **Purpose**: Development and testing
- **iOS**: Development client with debugging
- **Android**: APK for testing
- **Distribution**: Internal only

### Preview
- **Purpose**: Internal testing and QA
- **iOS**: Simulator build for testing
- **Android**: APK for device testing
- **Distribution**: Internal only

### Production
- **Purpose**: App Store and Play Store releases
- **iOS**: App Store build (no simulator)
- **Android**: App Bundle (AAB) for Play Store
- **Distribution**: Store distribution

## 🔐 Authentication Setup

### 1. Login to EAS
```bash
npx eas login
```

### 2. Configure Project (First Time)
```bash
npx eas build:configure
```

### 3. Set Up Credentials
```bash
# iOS credentials (Apple Developer Account required)
npx eas credentials

# Android credentials (Google Play Console required)
npx eas credentials
```

## 📤 Submitting to App Stores

### iOS - TestFlight
```bash
# Build and submit to TestFlight
npx eas build --platform ios --profile production
npx eas submit --platform ios --profile production
```

### Android - Play Console
```bash
# Build and submit to Play Console
npx eas build --platform android --profile production
npx eas submit --platform android --profile production
```

## 🔍 Build Status and Monitoring

### Check Build Status
```bash
# List all builds
npx eas build:list

# View specific build details
npx eas build:view [BUILD_ID]
```

### Download Builds
```bash
# Download latest build
npx eas build:download

# Download specific build
npx eas build:download [BUILD_ID]
```

## 🛠️ Troubleshooting

### Common Issues

1. **Build Fails**: Check logs with `npx eas build:view [BUILD_ID]`
2. **Credentials Issues**: Run `npx eas credentials` to reconfigure
3. **Asset Issues**: Ensure all required assets are in `./assets/` directory
4. **Environment Variables**: Verify `EXPO_PUBLIC_API_URL` is set correctly

### Build Logs
```bash
# View build logs
npx eas build:view [BUILD_ID] --logs
```

## 📊 Build Configuration Summary

| Profile | iOS | Android | Distribution | Purpose |
|---------|-----|---------|--------------|---------|
| development | Dev Client | APK | Internal | Development |
| preview | Simulator | APK | Internal | Testing |
| production | App Store | AAB | Store | Release |

## 🎯 Next Steps

1. **First Build**: Run `npx eas build --platform all --profile preview`
2. **Test Builds**: Install on devices and test functionality
3. **Production Build**: Run `npx eas build --platform all --profile production`
4. **Submit**: Use `npx eas submit` to upload to app stores

## 📞 Support

- **EAS Documentation**: [docs.expo.dev/eas](https://docs.expo.dev/eas/)
- **Build Status**: Check at [expo.dev](https://expo.dev)
- **Community**: [Expo Discord](https://chat.expo.dev)

---

**Ready to build!** 🚀 Run your first build with:
```bash
npx eas build --platform all --profile preview
```
