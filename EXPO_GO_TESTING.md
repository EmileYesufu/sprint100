# iPhone Expo Go Testing Guide

## Requirements
- iPhone with Expo Go app (download from App Store)
- Connected to internet (Wi-Fi or cellular data)
- Mac with the Sprint100 project running

## Setup (One-Time)

1. **Install Expo Go on iPhone:**
   - Open App Store on your iPhone
   - Search for "Expo Go"
   - Install the app

2. **Configure Environment (on Mac):**
   ```bash
   cd client
   cp .env.example .env
   ```
   
   Edit `.env` and update `EXPO_PUBLIC_API_URL` with your Mac's IP address:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.1.250:4000
   ```
   
   To find your Mac's IP address:
   ```bash
   ipconfig getifaddr en0
   ```

## Run on Mac

1. **Start your local backend server** (if applicable):
   ```bash
   cd server
   npm run dev
   ```

2. **Start Expo with tunnel mode:**
   ```bash
   cd client
   npm run start:ios:expo
   ```
   
   Or use the shorter command:
   ```bash
   npm run start:ios:expo
   ```

3. **Wait for the QR code** to appear in the terminal

## Test on iPhone

1. Open **Expo Go** app on your iPhone
2. Tap on "Scan QR code"
3. Point your camera at the QR code in the terminal
4. Sprint100 will load directly on your iPhone! 🎉

## Troubleshooting

### "Network request failed" or "Unable to connect"
- Verify your Mac's IP address hasn't changed
- Update `EXPO_PUBLIC_API_URL` in `.env` with the correct IP
- Ensure your backend server is running
- Check that both iPhone and Mac are on the same network (or use tunnel mode)

### QR code doesn't scan
- Make sure you're using the **Expo Go** app (not Camera app)
- Try increasing screen brightness
- Manually enter the URL shown below the QR code in Expo Go

### App crashes or won't load
- Clear Metro cache:
  ```bash
  cd client
  npx expo start --clear --tunnel
  ```
- Restart the Expo Go app on your iPhone
- Check the terminal for error messages

### Can't connect to server from iPhone
- Ensure `EXPO_PUBLIC_API_URL` uses your Mac's local IP (not localhost)
- Verify your backend is listening on `0.0.0.0` or your local IP, not just `127.0.0.1`
- Check firewall settings on your Mac

### Using cellular data (not same Wi-Fi)
The `--tunnel` flag creates a public URL that works from anywhere, so you can test even if your iPhone is on cellular data!

## Testing Multiplayer Features

For multiplayer tests:
1. **Option A:** Use ngrok to expose your local server:
   ```bash
   ngrok http 4000
   ```
   Then update `EXPO_PUBLIC_API_URL` with the ngrok URL

2. **Option B:** Deploy your backend to a cloud service and update the `.env` file accordingly

## Notes

- **No TestFlight or builds required** — changes reload instantly in Expo Go
- **Hot reloading works** — save your code and see changes immediately
- **Tunnel mode** (`--tunnel`) creates a public URL that works from anywhere
- For production builds, you'll eventually need to build with EAS or Xcode

## Quick Commands Reference

```bash
# Find your Mac's IP
ipconfig getifaddr en0

# Start backend
cd server && npm run dev

# Start Expo for iPhone testing
cd client && npm run start:ios:expo

# Clear cache if needed
cd client && npx expo start --clear --tunnel
```

---

**Happy Testing on iPhone! 🏃‍♂️📱**
