# 🌐 Setup for External Tester (Step-by-Step)

Your external tester is on different WiFi and getting "network request failure"

## ✅ Here's What You Need to Do:

---

### Step 1: Install ngrok (if not installed)
```bash
npm install -g ngrok
```

### Step 2: Start ngrok in a NEW terminal window

Open a new terminal and run:
```bash
ngrok http 4000
```

**You'll see output like:**
```
Session Status    online
Forwarding        https://1a2b-3c4d-5e6f.ngrok-free.app -> http://localhost:4000
```

**COPY THE HTTPS URL** (the part after "Forwarding")
Example: `https://1a2b-3c4d-5e6f.ngrok-free.app`

**KEEP THIS TERMINAL OPEN!** ngrok must stay running.

---

### Step 3: Update client/.env with ngrok URL

```bash
cd /Users/emile/sprint100-1/client
nano .env
```

Find this line:
```
EXPO_PUBLIC_API_URL=http://192.168.1.250:4000
```

Replace with YOUR ngrok URL:
```
EXPO_PUBLIC_API_URL=https://1a2b-3c4d-5e6f.ngrok-free.app
```

Save: `Ctrl+X`, then `Y`, then `Enter`

---

### Step 4: Restart Expo Client

Kill the current Expo process (Ctrl+C if running)

Then start fresh:
```bash
cd /Users/emile/sprint100-1/client
npm start
```

---

### Step 5: Share QR Code with Tester

Send them:
- Screenshot of the QR code, OR
- The `exp://` URL shown in terminal

---

## 📋 Summary: What Should Be Running

**Terminal 1:** Server
```
cd server && npm run dev
```

**Terminal 2:** ngrok
```
ngrok http 4000
```

**Terminal 3:** Expo Client
```
cd client && npm start
```

---

## ✅ How to Verify It's Working

Test the ngrok URL:
```bash
# Replace with YOUR ngrok URL
curl https://1a2b-3c4d-5e6f.ngrok-free.app/api/register

# Should show:
{"error":"email, password, and username required"}
```

If you see this ✅ It's working!

---

## 📱 Tell Your Tester

"I've exposed the server publicly. Please:
1. Close Expo Go completely
2. Rescan the QR code I just sent
3. Wait 30 seconds for first load
4. Try signup again - should work now!"

---

**Once ngrok is running and .env is updated, your tester can access from anywhere!** 🌐
