# Sprint100 - External Tester Guide

> **Developers:** Your normal workflow is unchanged. The testers flow is opt-in and uses separate env settings.

This guide helps external testers run the Sprint100 app quickly without affecting the current developer workflow.

## 🎯 Purpose

External testers can test both online multiplayer and offline training functionality without disrupting the main development environment.

## 📋 Prerequisites

- **Node.js** (18 or higher)
- **npm** (comes with Node.js)
- **Expo Go** app on your mobile device
- **Git** (to clone the repository)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd sprint100

# Copy environment template
cp .env.example .env

# Install all dependencies
npm run testers:install
```

### 2. Configure Environment

Edit your `.env` file:

```bash
# For testing with a hosted server (recommended)
SERVER_URL=https://sprint100-test.example.com
TEST_SERVER_URL=https://sprint100-test.example.com
APP_ENV=test

# For testing with local server (if you can run it)
# SERVER_URL=http://localhost:4000
# APP_ENV=development
```

### 3. Start the App

**Option A: Use Hosted Test Server (Recommended)**
```bash
# Start client with tunnel mode for external access
cd client
npx expo start --tunnel
```

**Option B: Run Local Server + Client**
```bash
# Start both server and client (from project root)
npm run testers:start
```

### 4. Connect Your Device

1. Install **Expo Go** from App Store/Google Play
2. Scan the QR code shown in your terminal
3. The app will load on your device

## 🔧 Alternative Setup Methods

### Using .env.test Template

```bash
# Copy the test environment template
cp .env.test .env

# Edit .env to set your test server URL
# Then start the client
cd client
npx expo start --tunnel
```

### Manual Server Setup

If you need to run the server locally:

```bash
# Terminal 1: Start server
cd server
npm run dev

# Terminal 2: Start client with tunnel
cd client
npx expo start --tunnel
```

## 🌐 Network Configuration

### For Remote Testers (Recommended)

Use `--tunnel` mode to allow external phones to connect:

```bash
cd client
npx expo start --tunnel
```

This creates a public URL that works from anywhere.

### For Local Network Testing

If testers are on the same network:

```bash
# Find your machine's IP address
# macOS: ipconfig getifaddr en0
# Windows: ipconfig
# Linux: hostname -I

# Update .env with your machine's IP
SERVER_URL=http://192.168.1.100:4000
```

## 🧪 Testing Checklist

### Account Setup
- [ ] Register a new account with username
- [ ] Login successfully
- [ ] Profile shows correct username

### Online Multiplayer
- [ ] Join matchmaking queue
- [ ] Find and accept a match
- [ ] Complete a race
- [ ] Check ELO rating changes
- [ ] Test "Challenge by Username" feature

### Training Mode
- [ ] Access Training tab
- [ ] Configure training race (1, 3, or 7 AI opponents)
- [ ] Test different difficulty levels
- [ ] Complete training race
- [ ] Test "Rerace (Same Config)" button
- [ ] Test "Return Home" button

### UI/UX Testing
- [ ] All screens load without errors
- [ ] SafeAreaView works on devices with notches
- [ ] Dark theme displays correctly
- [ ] App icon shows on login screen
- [ ] Navigation works smoothly

## 🐛 Troubleshooting

### Common Issues

**"Unable to resolve module" errors:**
```bash
# Clear Metro cache
cd client
npx expo start --clear
```

**"Socket connection error":**
- Check if server is running
- Verify SERVER_URL in .env is correct
- Try using `--tunnel` mode

**"No script URL provided":**
```bash
# Restart Metro with cache reset
cd client
npx expo start --reset-cache --tunnel
```

**Firewall issues:**
- Use `--tunnel` mode for external access
- Ensure port 4000 is accessible (if running local server)

### Network Troubleshooting

**Same Network Issues:**
- Replace `localhost` with your machine's IP address
- Ensure both devices are on the same WiFi network
- Check firewall settings

**External Access Issues:**
- Always use `--tunnel` mode for remote testing
- Share the QR code link, not localhost URLs

## 📱 Test Accounts (Example)

If test accounts are available, use these for quick testing:

```
Username: tester1
Password: testpass123

Username: tester2  
Password: testpass123

Username: tester3
Password: testpass123
```

*Note: These are example credentials. Use actual test accounts if provided.*

## 🔍 Debugging Features

Enable verbose logging for detailed debugging:

```bash
# Add to your .env file
REACT_NATIVE_APP_VERBOSE=true
REACT_NATIVE_APP_DEBUG=true
```

This will show additional console logs and debug information.

## 📊 Reporting Issues

When reporting bugs, include:

1. **Device Information:**
   - Device model and OS version
   - Expo Go version

2. **Environment:**
   - SERVER_URL being used
   - Whether using tunnel mode
   - Network setup (local vs remote)

3. **Steps to Reproduce:**
   - Exact steps taken
   - Expected vs actual behavior
   - Screenshots if applicable

4. **Console Logs:**
   - Any error messages from Metro bundler
   - Network request failures
   - Socket connection issues

## 🚀 Advanced Testing

### Performance Testing
```bash
# Enable performance monitoring
REACT_NATIVE_APP_PERFORMANCE=true
```

### Stress Testing
- Test with multiple concurrent users
- Test network interruption scenarios
- Test app backgrounding/foregrounding

### Edge Cases
- Very long usernames
- Special characters in usernames
- Rapid tapping in races
- Network connectivity changes during races

## 📞 Support

For technical issues:
1. Check this troubleshooting guide first
2. Review console logs for error messages
3. Try the alternative setup methods
4. Report issues with detailed information

## 🔒 Security Note

This testing environment uses development secrets and should not be used for production data. All test data may be reset periodically.

---

**Happy Testing! 🏃‍♂️💨**
