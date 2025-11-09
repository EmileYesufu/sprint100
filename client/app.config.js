// Sprint100 App Configuration
// This file allows dynamic configuration based on environment

const IS_DEV = process.env.APP_ENV === 'development';
const IS_PREVIEW = process.env.APP_ENV === 'preview';

export default {
  expo: {
    name: IS_DEV ? "Sprint100 (Dev)" : "Sprint100",
    slug: "sprint100",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    scheme: "sprint100",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    platforms: ["ios", "android"],
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#000000"
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.sprint100.app",
      buildNumber: "1",
      infoPlist: {
        NSUserTrackingUsageDescription: "This app uses tracking to improve your racing experience and matchmaking.",
        NSCameraUsageDescription: "Camera access is not required for Sprint100.",
        NSMicrophoneUsageDescription: "Microphone access is not required for Sprint100."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#000000"
      },
      package: "com.sprint100.app",
      versionCode: 1,
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      screenOrientation: "portrait",
      permissions: [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "auto-generate"
      },
      API_URL: process.env.EXPO_PUBLIC_API_URL,
      APP_ENV: process.env.APP_ENV || "development"
    },
    plugins: [
      "expo-secure-store"
    ]
  }
};
