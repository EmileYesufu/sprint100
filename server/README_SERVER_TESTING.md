# Sprint100 Server - External Testing & Deployment Guide

## Overview

This guide explains how to make your Sprint100 server accessible to external testers and how to deploy to cloud providers.

---

## Quick Start: Local Testing with Public Access

### Method 1: Localtunnel (Easiest, No Signup)

**Step 1:** Start your server
```bash
cd server
npm run dev
```

**Step 2:** In a new terminal, expose it publicly
```bash
cd server
npm run start:ngrok
```

**Output:**
```
your url is: https://random-words-here.loca.lt
```

**Step 3:** Share this URL with testers

Update client `.env`:
```
EXPO_PUBLIC_API_URL=https://random-words-here.loca.lt
```

✅ **Pros:** No signup, instant, free  
⚠️ **Cons:** URL changes each time, has interstitial page on first visit

---

### Method 2: ngrok (More Reliable, Requires Free Signup)

**Step 1:** Sign up at https://dashboard.ngrok.com/signup

**Step 2:** Install authtoken
```bash
ngrok config add-authtoken YOUR_TOKEN_HERE
```

**Step 3:** Start server and ngrok
```bash
# Terminal 1:
cd server && npm run dev

# Terminal 2:
ngrok http 4000
```

**Output:**
```
Forwarding: https://abc-123-xyz.ngrok-free.app -> http://localhost:4000
```

✅ **Pros:** Stable, no interstitial, better performance  
⚠️ **Cons:** Requires free signup

---

## Cloud Deployment Options

### Option 1: Render (Recommended - Easy & Free)

**1. Create account:** https://render.com

**2. Create new Web Service**
- Connect GitHub repo
- Build command: `cd server && npm install && npm run build && npx prisma generate`
- Start command: `cd server && npm run start:prod`

**3. Add environment variables:**
```
NODE_ENV=production
JWT_SECRET=your_random_secret_here_min_32_chars
DATABASE_URL=your_postgres_url
ALLOWED_ORIGINS=*
PORT=4000
```

**4. Provision PostgreSQL database** (free tier available)

**5. Run migrations:**
```bash
# In Render shell or locally:
DATABASE_URL="your_render_postgres_url" npx prisma migrate deploy
```

**6. Seed test users:**
```bash
DATABASE_URL="your_render_postgres_url" npm run seed:test
```

**7. Note your URL:** `https://sprint100-server.onrender.com`

---

### Option 2: Fly.io (Fast, Global Edge)

**1. Install flyctl:**
```bash
brew install flyctl
```

**2. Login:**
```bash
fly auth login
```

**3. Create Dockerfile** (already provided in repo)

**4. Launch app:**
```bash
cd server
fly launch
```

**5. Set secrets:**
```bash
fly secrets set JWT_SECRET=your_secret_here
fly secrets set DATABASE_URL=your_postgres_url
fly secrets set ALLOWED_ORIGINS=*
```

**6. Deploy:**
```bash
fly deploy
```

---

### Option 3: Heroku

**1. Install Heroku CLI:**
```bash
brew tap heroku/brew && brew install heroku
```

**2. Login:**
```bash
heroku login
```

**3. Create app:**
```bash
cd server
heroku create sprint100-server
```

**4. Add Postgres:**
```bash
heroku addons:create heroku-postgresql:mini
```

**5. Set config vars:**
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret_here
heroku config:set ALLOWED_ORIGINS=*
```

**6. Add Procfile** (already in repo)

**7. Deploy:**
```bash
git push heroku main
```

**8. Run migrations:**
```bash
heroku run npx prisma migrate deploy
```

**9. Seed test users:**
```bash
heroku run npm run seed:test
```

---

## Environment Variables Reference

### Required for Production

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `JWT_SECRET` | Auth secret (32+ chars) | `use_openssl_rand_-hex_32` |
| `DATABASE_URL` | Postgres connection | `postgresql://...` |
| `ALLOWED_ORIGINS` | CORS origins | `https://yourdomain.com` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `HOST` | Bind address | `0.0.0.0` |
| `PORT` | Server port | `4000` |
| `RATE_LIMIT_MAX` | Max requests per window | `200` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `ENABLE_REQUEST_LOGGING` | HTTP request logs | `true` (dev), `false` (prod) |

---

## Security Checklist

### ✅ Before Public Testing

- [ ] Change `JWT_SECRET` from default
- [ ] Set `ALLOWED_ORIGINS` to specific domains (not `*`)
- [ ] Use HTTPS/TLS (automatic on Render/Fly/Heroku)
- [ ] Enable rate limiting (already configured)
- [ ] Use PostgreSQL instead of SQLite
- [ ] Review and limit test user permissions
- [ ] Monitor server logs for abuse
- [ ] Set up basic alerting

### ✅ Production Deployment

- [ ] Use strong JWT_SECRET (32+ random chars)
- [ ] Use managed PostgreSQL database
- [ ] Configure CORS to specific client domains
- [ ] Enable HTTPS only
- [ ] Set up CDN/reverse proxy
- [ ] Configure Redis for Socket.IO scaling (if multiple instances)
- [ ] Set up monitoring (Sentry, LogRocket, etc.)
- [ ] Enable database backups
- [ ] Set up CI/CD pipeline

---

## Database Migration

### SQLite to PostgreSQL

**1. Export data** (if needed):
```bash
npx prisma db pull
```

**2. Update `DATABASE_URL`:**
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

**3. Run migrations:**
```bash
npx prisma migrate deploy
```

**4. Seed test users:**
```bash
npm run seed:test
```

---

## Socket.IO Scaling (Multiple Instances)

If deploying multiple server instances, you need Redis adapter:

**1. Install:**
```bash
npm install @socket.io/redis-adapter redis
```

**2. Update server.ts:**
```typescript
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
});
```

**3. Add `REDIS_URL` env var**

---

## Testing the Deployment

### Health Checks
```bash
# Basic health
curl https://your-server.com/health

# Database connectivity
curl https://your-server.com/ready
```

### API Endpoints
```bash
# Test registration
curl -X POST https://your-server.com/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"testuser","password":"pass123"}'

# Test login
curl -X POST https://your-server.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tester1@sprint100.test","password":"testpass123"}'
```

### Socket.IO Connection
```bash
# Test WebSocket upgrade
curl -i https://your-server.com/socket.io/
```

---

## Monitoring & Logs

### Local Development
```bash
# Logs are printed to console
npm run dev
```

### Production (Render)
```bash
# View logs in dashboard or:
render logs
```

### Production (Fly)
```bash
fly logs
```

### Production (Heroku)
```bash
heroku logs --tail
```

---

## Troubleshooting

### Issue: CORS Errors

**Solution:** Add client domain to `ALLOWED_ORIGINS`
```bash
ALLOWED_ORIGINS=https://your-expo-tunnel-url.com,*
```

### Issue: Database Connection Failed

**Solution:** Check `DATABASE_URL` and run migrations
```bash
npx prisma migrate deploy
```

### Issue: Socket.IO Not Connecting

**Solution:** Verify CORS origins include client domain
```typescript
cors: { origin: ALLOWED_ORIGINS, credentials: true }
```

### Issue: Rate Limit Too Restrictive

**Solution:** Increase limits in `.env`
```bash
RATE_LIMIT_MAX=500
RATE_LIMIT_WINDOW_MS=900000
```

---

## Security Best Practices

### JWT Secret
```bash
# Generate strong secret:
openssl rand -hex 32
# Set in .env:
JWT_SECRET=<generated_secret>
```

### HTTPS Only (Production)
All major platforms (Render, Fly, Heroku) provide free HTTPS.

### Environment Secrets
Never commit `.env` files. Use platform secret management:
- Render: Environment variables in dashboard
- Fly: `fly secrets set KEY=value`
- Heroku: `heroku config:set KEY=value`

---

## Quick Commands Reference

```bash
# Local development
npm run dev

# Expose locally with localtunnel
npm run start:ngrok

# Build for production
npm run build

# Start production server
npm run start:prod

# Seed test users
npm run seed:test

# Database migrations
npm run db:migrate

# View database
npm run db:studio
```

---

## External Tester Workflow

**1. You (Developer):**
```bash
# Option A: Localtunnel (quick test)
npm run dev             # Terminal 1
npm run start:ngrok     # Terminal 2

# Option B: Deploy to Render (persistent)
# Follow Render deployment steps above
```

**2. Update client `.env`:**
```bash
EXPO_PUBLIC_API_URL=https://your-public-url
```

**3. Share with tester:**
- Public server URL
- Test credentials (from `npm run seed:test`)
- Expo Go QR code

**4. Tester tests:**
- Login with test account
- Or register new account
- Test all features

---

## Cost Estimate

| Provider | Free Tier | Paid |
|----------|-----------|------|
| **Localtunnel** | ✅ Free | N/A |
| **ngrok** | ✅ Free (1 tunnel) | $8/mo (more tunnels) |
| **Render** | ✅ Free (spins down after inactivity) | $7/mo (always on) |
| **Fly.io** | ✅ Free (256MB RAM) | $1.94/mo (512MB) |
| **Heroku** | ❌ No free tier | $5/mo (Eco) |

**Recommendation:** Localtunnel for quick tests, Render for persistent testing

---

## Next Steps

1. ✅ Use Xcode for your own testing (fast, reliable)
2. ✅ For external tester: Run `npm run start:ngrok` to expose server
3. ✅ Or deploy to Render for persistent access
4. ✅ Run `npm run seed:test` to create test accounts
5. ✅ Share public URL and test credentials with testers

**Your local dev workflow (`npm run dev`) remains unchanged!** 🎯

