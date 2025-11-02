# Fix: Command PhaseScriptExecution Failed

## ✅ Issue Fixed!

The "Command PhaseScriptExecution failed with a nonzero exit code" error is caused by node not being accessible during Xcode's build scripts.

### What I Fixed:
1. ✅ Updated `ios/.xcode.env` to load nvm
2. ✅ Created `ios/.xcode.env.local` with explicit node path
3. ✅ Node is now accessible to Xcode build scripts

---

## 🔄 Now You Need to Clean and Rebuild

### In Xcode (which should still be open):

1. **Clean Build Folder:**
   - Press `Cmd + Shift + K`
   - Or: Product → Clean Build Folder

2. **Clear Derived Data:**
   - Press `Cmd + Shift + Option + K`
   - Or: Product → Clean Derived Data

3. **Close Xcode:**
   - Press `Cmd + Q` to quit completely

4. **Reopen Workspace:**
   ```bash
   open /Users/emile/sprint100-1/client/ios/Sprint100.xcworkspace
   ```

5. **Select Simulator:**
   - Choose **iPhone 15 Pro** from device selector

6. **Build and Run:**
   - Press `Cmd + R` or click ▶️
   - Wait 2-5 minutes for build

---

## 🎯 Expected Result

You should see:
- ✅ Build progress in Xcode
- ✅ "Build Succeeded" message
- ✅ Simulator launches
- ✅ App appears on home screen
- ✅ Login/Register screen displays

---

## 🐛 If Build Still Fails

### Check the Error in Xcode

Look at the error message. Common issues:

#### "node: command not found"
The .xcode.env fix didn't work. Try:
```bash
# Verify node path
/bin/bash -c "export NVM_DIR=\"\$HOME/.nvm\" && source \"\$NVM_DIR/nvm.sh\" && which node"

# Update ios/.xcode.env.local with the output path
```

#### "Signing for 'Sprint100' requires a development team"
In Xcode:
1. Click on Sprint100 project (blue icon)
2. Select Sprint100 target
3. Go to "Signing & Capabilities" tab
4. Select your Apple ID team
5. Let Xcode manage signing automatically

#### "Unable to boot simulator"
```bash
# Reset simulator
xcrun simctl shutdown all
xcrun simctl erase all

# Or open Simulator and select device manually
open -a Simulator
```

#### "Library not found" or Pod errors
```bash
cd /Users/emile/sprint100-1/client/ios
/opt/homebrew/bin/pod deintegrate
/opt/homebrew/bin/pod install
```

---

## 📋 What Was Changed

### File: `ios/.xcode.env`
```bash
# Added nvm loading
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" --no-use
export NODE_BINARY=$(command -v node)
```

### File: `ios/.xcode.env.local` (new)
```bash
# Explicit node path for immediate access
export NODE_BINARY=/Users/emile/.nvm/versions/node/v24.9.0/bin/node
```

---

## 🔍 Why This Happened

Xcode runs build scripts in a clean environment without your shell's PATH. The scripts need node to:
- Run Metro bundler
- Generate React Native code
- Process TypeScript/JSX
- Bundle JavaScript

Without node in PATH, these scripts fail with "PhaseScriptExecution" errors.

The `.xcode.env` file tells Xcode where to find node.

---

## ✅ After Successful Build

Once the app is running:

1. **Test Authentication:**
   - Register new account
   - Login with credentials

2. **Start the Server** (if not running):
   ```bash
   cd /Users/emile/sprint100-1/server
   npm run dev
   ```

3. **Test Features:**
   - Join queue
   - Race functionality
   - Profile, Leaderboard, Settings

---

## 📝 Share if Still Having Issues

If the build still fails, please share:

1. **The exact error message** from Xcode
2. **Build log** (Product → Build → Show Build Log)
3. **Screenshot** of the error (helpful)

I'll help you resolve it!

