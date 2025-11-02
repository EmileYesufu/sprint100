# 🚀 Simple Commands Cheat Sheet

## For YOUR Testing (Xcode):

```bash
# Just use Xcode! Press ⌘R
# Metro is already running in background
```

---

## For REMOTE TESTER Setup:

### Terminal 1: Server
```bash
cd /Users/emile/sprint100-1/server
npm run dev
```

### Terminal 2: ngrok (requires free signup at ngrok.com)
```bash
ngrok http 4000
# Copy the https://....ngrok-free.app URL
```

### Terminal 3: Update Client & Start
```bash
cd /Users/emile/sprint100-1/client
# Edit .env: EXPO_PUBLIC_API_URL=https://your-ngrok-url
npx expo start --tunnel
# Screenshot the QR code and send to tester
```

### Remote Tester (on their iPhone):
```
1. Camera app → Point at QR code
2. Tap "Open in Expo Go"
3. Wait 30 seconds
4. Test the app!
```

---

## Quick Health Check:

```bash
# Test from iPhone Safari:
https://your-ngrok-url.ngrok-free.app/health
# Should show: {"status":"ok"}
```

---

**That's it!** 📱
