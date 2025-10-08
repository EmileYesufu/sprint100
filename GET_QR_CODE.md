# 📱 Get Your QR Code - Simple Steps

## Method 1: Run the Script (Easiest)

Open a **new terminal window** and run:

```bash
cd /Users/emile/sprint100-1
./START_EXPO_QR.sh
```

**The QR code will appear in your terminal!** 🎉

## Method 2: Manual Command

If the script doesn't work, run this in a **new terminal**:

```bash
cd /Users/emile/sprint100-1/client
npx expo start --tunnel
```

## What You'll See

After running either command, you'll see:

```
Starting Metro Bundler...
Tunnel ready.

› Metro waiting on exp://...
› Using Expo Go  
› Scan the QR code above with Expo Go (iOS)

████████████████████████████████
███ ▄▄▄▄▄ █▀ █▀▀██ █ ▄▄▄▄▄ ███
███ █   █ █▀ ▄  ▀█▄█ █   █ ███
███ █▄▄▄█ █▀█ ▀ ▄ ▀█ █▄▄▄█ ███
███▄▄▄▄▄▄▄█ ▀ █ █ ▀ █▄▄▄▄▄▄███
████ ▄▄ ▀▄  ▄▀▀ ▀▀▄▀▄▀ ▀ █▄███
████████████████████████████████
```

**👆 This is your QR code!**

## Connect Your iPhone

1. **Install Expo Go** from App Store (if you haven't already)
2. **Open Expo Go** on your iPhone  
3. **Tap "Scan QR code"**
4. **Point at the QR code** in your terminal
5. **Sprint100 loads!** 🚀

## Alternative: Manual URL Entry

If QR scanning doesn't work:

1. Look for the `exp://` URL in your terminal
2. Open Expo Go on iPhone
3. Tap "Enter URL manually"
4. Type the URL and connect

---

## Quick Start Summary

```bash
# In a new terminal window:
cd /Users/emile/sprint100-1
./START_EXPO_QR.sh

# Then scan the QR code with Expo Go!
```

**That's it!** 📱✨
