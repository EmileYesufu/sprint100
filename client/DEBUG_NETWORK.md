# Quick Network Debug Steps

## 1. Check What URL App Is Using
In Xcode console, look for:
```
📡 Using API URL from app.json: [URL]
🌐 Attempting registration to: [URL]
```

If it shows the OLD IP (192.168.1.218), the app.json change hasn't been applied!

## 2. Force Metro Bundler Reset
```bash
cd client
# Clear Metro cache
npx expo start --clear

# Or if using npm start:
npm start -- --reset-cache
```

## 3. Hard Reset the App
In Xcode:
1. Stop the app completely
2. Delete app from device/simulator
3. Clean Build Folder (Cmd+Shift+K)
4. Rebuild (Cmd+R)

## 4. Verify Constants.expoConfig
Add this temporary debug in RegisterScreen.tsx (line 60):
```typescript
console.log('🔍 DEBUG Config:', {
  expoConfigUrl: Constants.expoConfig?.extra?.API_URL,
  envUrl: process.env.EXPO_PUBLIC_API_URL,
  defaultUrl: DEFAULT_SERVER_URL,
});
```

## 5. Test Direct Connectivity
From your iPhone Safari, try:
```
http://192.168.1.140:4000/health
```

If this doesn't work, it's a network/firewall issue, not an app issue.

