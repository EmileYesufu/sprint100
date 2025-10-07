# ✅ Xcode is Ready to Build!

## 🎉 All Issues Fixed!

Pod install completed successfully with 79 dependencies installed.
The workspace is now open in Xcode.

---

## 🚀 How to Build and Run in Xcode

### 1. Verify You're Using the Workspace

In Xcode, check the window title shows:
```
Sprint100.xcworkspace
```

**NOT** `Sprint100.xcodeproj` ❌

If it shows `.xcodeproj`, close it and reopen:
```bash
open /Users/emile/sprint100-1/client/ios/Sprint100.xcworkspace
```

---

### 2. Select a Simulator

At the top of Xcode, next to the Play button:
- Click the device selector
- Choose **iPhone 15 Pro** (or any iPhone simulator)
- Make sure it says iOS 17.x or later

---

### 3. Start Metro Bundler (Optional but Recommended)

Open a **new Terminal window** and run:

```bash
cd /Users/emile/sprint100-1/client
npx expo start
```

This starts the Metro bundler separately. Leave it running.

**Why?** This gives you better control and clearer error messages.

---

### 4. Build in Xcode

Back in Xcode:

**Option A: Build and Run (Recommended)**
- Press `Cmd + R` or click ▶️ Play button
- This builds AND runs the app

**Option B: Build Only**
- Press `Cmd + B`
- Then press `Cmd + R` to run

---

### 5. Wait for Build

**First build:** 3-5 minutes  
**Subsequent builds:** 30 seconds - 2 minutes

You'll see:
```
Building "Sprint100" (1 of 1)
Compiling...
Linking...
Build Succeeded ✅
```

---

### 6. App Should Launch

After build succeeds:
1. ✅ Simulator opens automatically
2. ✅ App installs on simulator
3. ✅ App launches
4. ✅ You see Login/Register screen

---

## 🔧 If Build Fails Again

### Check the Error Type

Click on the red error in Xcode. Common issues:

#### 1. "Signing for 'Sprint100' requires a development team"

**Fix:**
1. Click Sprint100 project (blue icon on left)
2. Select Sprint100 target
3. Go to "Signing & Capabilities" tab
4. Team: Select your Apple ID
5. ✅ Check "Automatically manage signing"

#### 2. "Command PhaseScriptExecution failed"

This should be fixed now with `.xcode.env.local`, but if it happens:

**Verify node is accessible:**
```bash
cat /Users/emile/sprint100-1/client/ios/.xcode.env.local
```

Should show:
```bash
export NODE_BINARY=/Users/emile/.nvm/versions/node/v24.9.0/bin/node
export PATH="/Users/emile/.nvm/versions/node/v24.9.0/bin:$PATH"
```

If different or missing, the file got reset. Re-run pod install:
```bash
cd /Users/emile/sprint100-1/client/ios
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
/opt/homebrew/bin/pod install
```

#### 3. "Library not found"

**Fix:**
```bash
# Clean in Xcode
Cmd + Shift + K

# Re-install pods
cd /Users/emile/sprint100-1/client/ios
export LANG=en_US.UTF-8
/opt/homebrew/bin/pod install

# Rebuild
Cmd + B
```

#### 4. "Unable to boot simulator"

**Fix:**
```bash
# Open Simulator manually
open -a Simulator

# Select device: Hardware → Device → iOS 17.x → iPhone 15 Pro
# Then build again in Xcode
```

---

## 🎯 After Successful Build

### 1. Start the Backend Server

In a **new Terminal window**:

```bash
cd /Users/emile/sprint100-1/server
npm run dev
```

You should see:
```
Server listening on port 4000
```

### 2. Test the App

In the simulator:

**Authentication:**
1. Tap "Register"
2. Enter email and password
3. Create account
4. Login with credentials
5. Should see main tabs: Race, Profile, Leaderboard, Settings

**Race Feature:**
1. Tap "Race" tab
2. Tap "Join Queue"
3. See yourself in queue
4. (Need 2nd player to test full race)

**Other Tabs:**
- Profile: Shows your Elo and match history
- Leaderboard: Top players
- Settings: Logout option

---

## 📋 Development Workflow in Xcode

### Making Code Changes

1. **Edit files** in your code editor (VS Code, etc.)
2. **Save the file**
3. **Xcode automatically detects changes**
4. **Fast Refresh** updates the app (no rebuild needed!)

### When to Rebuild

Only rebuild (`Cmd + B`) if you:
- Add new dependencies
- Modify native code
- Change Xcode project settings
- Add new assets

### Using Xcode Debugger

1. Set breakpoints by clicking line numbers
2. Run with `Cmd + R`
3. When breakpoint hits, inspect variables
4. Use debug console at bottom

### Viewing Logs

- **Xcode Console:** View → Debug Area → Show Debug Area
- **Metro Logs:** In the terminal where you ran `npx expo start`
- **console.log():** Appears in both Xcode and Metro logs

---

## ✅ Success Checklist

Before reporting issues, verify:

- [ ] Using `.xcworkspace` not `.xcodeproj`
- [ ] iPhone simulator selected (not "Any iOS Device")
- [ ] Build succeeded (check Xcode status bar)
- [ ] Simulator is running
- [ ] App icon appears on simulator home screen
- [ ] App launches without crash
- [ ] Login/Register screen is visible
- [ ] Server is running on port 4000
- [ ] `SERVER_URL` in `src/config.ts` is `http://localhost:4000`

---

## 🔄 Clean Build (If Needed)

If you want to start completely fresh:

### In Xcode:
1. `Cmd + Shift + K` (Clean Build Folder)
2. `Cmd + Shift + Option + K` (Delete Derived Data)
3. Quit Xcode (`Cmd + Q`)

### In Terminal:
```bash
cd /Users/emile/sprint100-1/client/ios
export LANG=en_US.UTF-8
/opt/homebrew/bin/pod deintegrate
/opt/homebrew/bin/pod install
```

### Reopen and Build:
```bash
open /Users/emile/sprint100-1/client/ios/Sprint100.xcworkspace
# Then Cmd + R in Xcode
```

---

## 📚 Resources

- **Xcode Shortcuts:**
  - `Cmd + R`: Build and Run
  - `Cmd + B`: Build
  - `Cmd + .`: Stop running
  - `Cmd + Shift + K`: Clean
  - `Cmd + 0`: Show/Hide Navigator
  - `Cmd + Shift + Y`: Show/Hide Debug Area

- **Metro Bundler:**
  - `R` in terminal: Reload app
  - `D` in terminal: Open dev menu
  - `Cmd + D` in simulator: Open dev menu

---

## 🎉 You're All Set!

**Xcode is open and ready.**

**Next step:** Press `Cmd + R` to build and run!

The first build will take a few minutes. Be patient! ☕

---

## 💬 If You Still Have Issues

Share:
1. The exact error message from Xcode
2. Screenshot of the error (if possible)
3. Build log (Product → Build → Show Build Log)

I'll help you fix it immediately!

