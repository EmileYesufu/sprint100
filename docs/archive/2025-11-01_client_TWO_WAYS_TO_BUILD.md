# Two Ways to Build & Run the iOS App

## 🚨 If Xcode Build Keeps Failing

You have **two options** to build and run the app:

---

## ✅ **Option 1: Use Expo CLI (RECOMMENDED - Easiest)**

This bypasses Xcode's environment issues and handles everything automatically.

### Run This Command:

```bash
cd /Users/emile/sprint100-1/client
bash BUILD_AND_RUN.sh
```

Or manually:

```bash
cd /Users/emile/sprint100-1/client
npx expo run:ios
```

### What This Does:
- ✅ Automatically finds node
- ✅ Handles CocoaPods
- ✅ Builds the app
- ✅ Launches simulator
- ✅ Installs and runs the app
- ✅ Starts Metro bundler

### Advantages:
- No Xcode environment setup needed
- Handles all paths automatically
- Better error messages
- Recommended by Expo team

### Wait Time:
- First build: 3-5 minutes
- Subsequent builds: 1-2 minutes

---

## 🛠️ **Option 2: Use Xcode Directly**

Only use this if you specifically need Xcode's debugger or IDE features.

### Steps:

1. **Verify .xcode.env.local exists:**
   ```bash
   cat /Users/emile/sprint100-1/client/ios/.xcode.env.local
   ```
   
   Should show:
   ```bash
   export NODE_BINARY=/Users/emile/.nvm/versions/node/v24.9.0/bin/node
   export PATH="/Users/emile/.nvm/versions/node/v24.9.0/bin:$PATH"
   ```

2. **Quit Xcode completely:**
   - `Cmd + Q`

3. **Reopen workspace:**
   ```bash
   open /Users/emile/sprint100-1/client/ios/Sprint100.xcworkspace
   ```

4. **Clean everything:**
   - `Cmd + Shift + K` (Clean Build Folder)
   - `Cmd + Shift + Option + K` (Clear Derived Data)

5. **Build:**
   - Select iPhone 15 Pro simulator
   - `Cmd + B`

### If Still Fails:

Check which script is failing:
1. Click on the error in Xcode
2. Look for the script name (e.g., "Bundle React Native code and images")
3. Check the error output

Common fixes:

**"node: command not found"**
```bash
# Verify node path is correct
ls -la /Users/emile/.nvm/versions/node/v24.9.0/bin/node

# If different version, update .xcode.env.local
```

**"Permission denied"**
```bash
chmod +x /Users/emile/sprint100-1/client/ios/.xcode.env.local
```

---

## 🎯 What I'm Doing Now

I've started building with Expo CLI in the background. This should work automatically.

### Check Progress:

The build is running now. You should see in your terminal:
- "Building iOS app..."
- Progress bar
- Eventually: "Build succeeded" 
- Then simulator will launch

### Expected Output:

```
✔ Built iOS project
› Opening exp://192.168.x.x:8081 on iPhone 15 Pro
› Press ? │ show all commands
```

---

## 📊 Comparison

| Feature | Expo CLI | Xcode |
|---------|----------|--------|
| Setup | Automatic | Manual |
| Environment | Handled | Must configure |
| Build Speed | Fast | Fast |
| Debugging | Metro logs | Full Xcode debugger |
| Errors | Clear | Complex |
| Recommended | ✅ Yes | For advanced debugging |

---

## 🔍 After Build Succeeds

Once the app is running:

1. **Verify app launched:**
   - Simulator should be open
   - Sprint100 app icon visible
   - Login/Register screen shows

2. **Start the server:**
   ```bash
   cd /Users/emile/sprint100-1/server
   npm run dev
   ```

3. **Test features:**
   - Register new account
   - Login
   - Join queue
   - Test race (need 2 users)

---

## 🆘 If Expo CLI Also Fails

Share the error output and I'll help immediately. Common issues:

**"Simulator not found"**
```bash
# Open Simulator manually
open -a Simulator
# Select device, then retry
```

**"Port 8081 already in use"**
```bash
# Kill existing Metro bundler
lsof -ti:8081 | xargs kill -9
# Retry build
```

**"CocoaPods installation failed"**
```bash
cd ios
/opt/homebrew/bin/pod install
cd ..
npx expo run:ios
```

---

## 💡 Pro Tip

For day-to-day development, use:

```bash
# Terminal 1: Start Metro bundler
npx expo start

# Then press 'i' for iOS simulator
```

This is fastest for active development with hot reload.

---

## ✅ Current Status

**Expo CLI build is running in the background now.**

Check your terminal for build progress. The app should launch in the simulator automatically when build completes.

If you see any errors, share them and I'll help fix immediately!

