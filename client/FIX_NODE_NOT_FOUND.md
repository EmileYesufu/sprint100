# Fix: "Could not find 'node' executable" in Xcode

## ✅ I've Fixed the Configuration Files

Updated both `.xcode.env` and `.xcode.env.local` with explicit node path:
```bash
/Users/emile/.nvm/versions/node/v24.9.0/bin/node
```

**Now you need to restart Xcode so it picks up the new configuration.**

---

## 🔄 Steps to Fix (Do This Now)

### 1. Quit Xcode Completely

- Press `Cmd + Q` to quit Xcode
- **Important:** Make sure it's fully closed (not just the window)
- Check Dock to ensure Xcode is not running

### 2. Verify Node Path is Set

Open Terminal and run:

```bash
cat /Users/emile/sprint100-1/client/ios/.xcode.env
```

Should show:
```bash
export NODE_BINARY=/Users/emile/.nvm/versions/node/v24.9.0/bin/node
export PATH="/Users/emile/.nvm/versions/node/v24.9.0/bin:$PATH"
```

✅ If it shows this, the fix is in place.

### 3. Reopen Xcode Workspace

```bash
open /Users/emile/sprint100-1/client/ios/Sprint100.xcworkspace
```

**Wait for Xcode to fully open and index the project (watch the top bar).**

### 4. Clean Everything

In Xcode:

1. **Clean Build Folder:**
   - Press `Cmd + Shift + K`
   - Or: Product → Clean Build Folder

2. **Delete Derived Data:**
   - Press `Cmd + Shift + Option + K`  
   - Or: Product → Clean Derived Data
   - Confirm when prompted

### 5. Build Again

- Select **iPhone 15 Pro** simulator
- Press `Cmd + R` or click ▶️
- **Wait 3-5 minutes** for build

---

## ✅ This Should Work Now

The build scripts will now find node at:
```
/Users/emile/.nvm/versions/node/v24.9.0/bin/node
```

---

## 🐛 If It Still Fails

### Check Which Script is Failing

1. Look at the error in Xcode
2. Find the script name (usually "Bundle React Native code and images")
3. Click on the error to see details

### Verify the Error Message

If it says:
```
Could not find "node" executable
```

Share the **full error** and the **script name** that's failing.

---

## 🔍 Alternative: Add Node to Xcode Build Settings Manually

If the .xcode.env fix doesn't work, we can add it directly to Xcode:

### Steps:

1. **In Xcode, click on Sprint100 project** (blue icon in left sidebar)

2. **Select Sprint100 target** (under TARGETS)

3. **Go to Build Settings tab**

4. **Search for "User-Defined"** in the search box

5. **Click the + button** and select "Add User-Defined Setting"

6. **Name:** `NODE_BINARY`  
   **Value:** `/Users/emile/.nvm/versions/node/v24.9.0/bin/node`

7. **Click + again** and add another:  
   **Name:** `PATH`  
   **Value:** `/Users/emile/.nvm/versions/node/v24.9.0/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin`

8. **Clean and rebuild** (`Cmd + Shift + K` then `Cmd + R`)

---

## 📋 Quick Troubleshooting Checklist

- [ ] Quit Xcode completely (`Cmd + Q`)
- [ ] Verified `.xcode.env` has explicit node path
- [ ] Reopened workspace (NOT project)
- [ ] Cleaned build folder (`Cmd + Shift + K`)
- [ ] Deleted derived data (`Cmd + Shift + Option + K`)
- [ ] Selected iPhone simulator (not "Any iOS Device")
- [ ] Rebuilt with `Cmd + R`

---

## 🎯 Expected Success

After these steps, the build should:
1. ✅ Find node executable
2. ✅ Complete script phases
3. ✅ Build successfully
4. ✅ Launch simulator
5. ✅ Run the app

---

## 💡 Why This Happens

Xcode runs build scripts in a clean environment without your shell's PATH. It needs explicit configuration to find node.

The `.xcode.env` file tells Xcode where node is located. By hardcoding the path instead of using `command -v node`, we ensure it's always found.

---

## ✅ Follow the Steps Above Now

1. Quit Xcode (`Cmd + Q`)
2. Reopen workspace
3. Clean (`Cmd + Shift + K`)
4. Build (`Cmd + R`)

**The build should succeed after these steps!**

Let me know if you still see the error after following these steps.

