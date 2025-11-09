# Sprint100 Client

React Native + Expo TypeScript client for the multiplayer 100m sprint game.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure server URL:**
   - Create `.env.production` with:
     ```bash
     EXPO_PUBLIC_API_URL=https://sprint100-production.up.railway.app
     EXPO_PUBLIC_WS_URL=wss://sprint100-production.up.railway.app
     NODE_ENV=production
     ```
   - (Optional) For local development, create `.env.development` with your localhost settings.

3. **Start the development server:**
   ```bash
   npm start
   # or
   npx expo start
   ```

4. **Run on iOS Simulator:**
   ```bash
   npm run ios
   # or
   npx expo start --ios
   ```

5. **Run on Android:**
   ```bash
   npm run android
   # or
   npx expo start --android
   ```

## Project Structure

```
client/
├── src/
│   ├── config.ts              # Server URL and app configuration
│   ├── types.ts               # TypeScript type definitions
│   ├── hooks/
│   │   ├── useAuth.tsx        # Authentication context/hook
│   │   └── useSocket.ts       # Socket.io connection hook
│   ├── navigation/
│   │   └── AppNavigator.tsx   # Navigation setup (stacks & tabs)
│   ├── screens/
│   │   ├── Auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── Race/
│   │   │   ├── QueueScreen.tsx
│   │   │   └── RaceScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── LeaderboardScreen.tsx
│   │   └── SettingsScreen.tsx
│   └── utils/
│       └── formatting.ts      # Helper utilities
├── App.tsx                    # App entry point
├── app.json                   # Expo configuration (portrait mode set)
└── package.json
```

## Key Features

- **Authentication:** JWT-based login/register with expo-secure-store
- **Real-time Racing:** Socket.io for live multiplayer matches
- **Portrait-Only:** Configured in `app.json` with `"orientation": "portrait"`
- **Tab Navigation:** Race, Profile, Leaderboard, Settings
- **TypeScript:** Fully typed with navigation types

## Important Notes

### Server URL Configuration
Production builds read from `.env.production` (`https://sprint100-production.up.railway.app`).  
For local testing, use a separate `.env.development` and ensure Metro is restarted after changes.

### Portrait Orientation
The app is configured for portrait mode only in `app.json`:
- iOS: `"orientation": "portrait"`
- Android: `"screenOrientation": "portrait"`

No native build required for development - orientation is enforced via Expo config.

### Path Aliases
The project uses `@/` as an alias for `src/`:
```typescript
import { useAuth } from "@/hooks/useAuth";
```
This is configured in:
- `tsconfig.json` (for TypeScript)
- `babel.config.js` (for Metro bundler)

## Development Workflow

1. Start the server (in `../server/`):
   ```bash
   cd ../server
   npm run dev
   ```

2. Start the client:
   ```bash
   npm start
   ```

3. Open in simulator or scan QR code with Expo Go app

## Troubleshooting

- **Cannot connect to server:** Check `SERVER_URL` in `src/config.ts`
- **Module not found errors:** Run `npm install` and restart Metro bundler
- **Path alias not working:** Clear cache with `npx expo start -c`

