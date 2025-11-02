# Fix Network Request Failed - iOS App Transport Security

**Issue**: "Network request failed" error on iOS app

## Root Cause

iOS App Transport Security (ATS) was blocking HTTP connections because:
- `NSAllowsArbitraryLoads` was set to `false`
- No exception domains configured for local IP addresses

## ✅ Fix Applied

Updated `Info.plist` to allow HTTP connections:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
    <key>NSAllowsLocalNetworking</key>
    <true/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>192.168.1.140</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
        </dict>
        <key>localhost</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
        </dict>
    </dict>
</dict>
```

## ⚠️ IMPORTANT: Rebuild Required

**Info.plist changes only take effect after rebuilding the app!**

### Steps to Apply:

1. **Close Xcode completely** (`Cmd+Q`)

2. **Reopen workspace**:
   ```bash
   open client/ios/Sprint100Dev.xcworkspace
   ```

3. **Clean Build Folder**:
   - `Product` → `Clean Build Folder` (`Cmd+Shift+K`)

4. **Build and Run**:
   - `Product` → `Run` (`Cmd+R`)

## Why This Fix Works

- `NSAllowsArbitraryLoads: true` - Allows HTTP connections in development
- `NSExceptionDomains` - Explicitly allows HTTP to local IP and localhost
- `NSAllowsLocalNetworking: true` - Allows connections to local network devices

## Verification

After rebuilding, check Xcode console for:
```
🔗 Sprint100 will connect to: http://192.168.1.140:4000
```

If you see this, the app is using the correct URL and ATS should allow the connection.

## Production Note

⚠️ For production builds, disable `NSAllowsArbitraryLoads` and use HTTPS only!

