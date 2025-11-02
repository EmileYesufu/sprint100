# Network Request Failed - Troubleshooting Guide

## ✅ Current Status
- Server is running and responding on `192.168.1.140:4000`
- Registration endpoint is working (curl test successful)
- Configuration files have correct IP addresses

## 🔍 Debugging Steps

### 1. Check Xcode Console Logs
After rebuilding the app, check the Xcode console (View → Debug Area → Activate Console) when you try to register. Look for:

```
📡 Using API URL from app.json: http://192.168.1.140:4000
🌐 Attempting registration to: http://192.168.1.140:4000/api/register
📡 Response status: [status code]
```

**What to check:**
- Is the URL correct? Should be `http://192.168.1.140:4000`
- What error details are shown?

### 2. Verify App Was Rebuilt
**CRITICAL**: `app.json` changes only take effect after a full rebuild!

```bash
# In Xcode:
1. Product → Clean Build Folder (Cmd+Shift+K)
2. Product → Run (Cmd+R)
```

### 3. Check Device Network
The device and Mac must be on the **same Wi-Fi network**.

**On your iPhone:**
- Settings → Wi-Fi → Check network name
- Must match your Mac's Wi-Fi network

### 4. Test Connectivity from Device
If possible, open Safari on your iPhone and navigate to:
```
http://192.168.1.140:4000/health
```
Should return: `{"status":"ok"}`

### 5. Check Firewall Settings
On your Mac:
```bash
# Check firewall status
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# If firewall is blocking, temporarily disable for testing:
# System Settings → Network → Firewall → Turn Off (or add exception for Node)
```

### 6. Verify Info.plist ATS Settings
The `Info.plist` should have:
```xml
<key>NSAllowsArbitraryLoads</key>
<true/>
```

After changing Info.plist, **full rebuild is required**.

### 7. Network Connectivity Test
Try these commands on your Mac:

```bash
# Test server locally
curl http://192.168.1.140:4000/health

# Test from another device on network (replace DEVICE_IP)
# curl http://192.168.1.140:4000/health
```

## 🚨 Common Issues

### Issue: "Network request failed" immediately
- **Cause**: App Transport Security blocking HTTP
- **Fix**: Rebuild app after Info.plist changes

### Issue: Timeout after 10 seconds
- **Cause**: Device can't reach Mac IP
- **Fix**: Check Wi-Fi network, firewall, or use ngrok

### Issue: Wrong URL in console logs
- **Cause**: app.json change not applied
- **Fix**: Full rebuild required (Cmd+Shift+K, then Cmd+R)

### Issue: Works on simulator but not device
- **Cause**: Simulator can use localhost, device needs IP
- **Fix**: Already using IP address, check device network

## 📱 Alternative: Use ngrok for Testing
If local network issues persist:

1. Install ngrok: `brew install ngrok`
2. Start tunnel: `ngrok http 4000`
3. Update `app.json`:
   ```json
   "API_URL": "https://[your-ngrok-url].ngrok.io"
   ```
4. Rebuild app

## 🎯 Quick Checklist
- [ ] Server running (`npm run dev` in server/)
- [ ] Mac and device on same Wi-Fi
- [ ] app.json has correct IP: `192.168.1.140:4000`
- [ ] Info.plist has NSAllowsArbitraryLoads = true
- [ ] Full rebuild after config changes (Cmd+Shift+K, Cmd+R)
- [ ] Check Xcode console for actual error details
- [ ] Firewall not blocking port 4000

