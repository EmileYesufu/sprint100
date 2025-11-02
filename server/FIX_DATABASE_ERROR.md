# Fix Database Connection Error

**Issue**: "Network request failed" when attempting to register - caused by missing database connection.

## Root Cause
The server needs a PostgreSQL database, but Docker isn't running to provide it.

## ✅ Quick Fix

### Step 1: Start Docker Desktop
1. Open **Docker Desktop** application on your Mac
2. Wait for it to fully start (whale icon in menu bar should be steady)

### Step 2: Start PostgreSQL Container
```bash
cd /Volumes/EmileDrive/sprint100
docker-compose up -d postgres
```

Wait ~10 seconds for PostgreSQL to start.

### Step 3: Setup Database Schema
```bash
cd /Volumes/EmileDrive/sprint100/server
npx prisma db push
```

This will create all the database tables.

### Step 4: Restart the Server
The server needs to be restarted to pick up the database connection. The server is running in the background, so you may need to:

1. **Kill the current server**:
   ```bash
   pkill -f "ts-node-dev.*server"
   ```

2. **Start it again**:
   ```bash
   cd /Volumes/EmileDrive/sprint100/server
   npm run dev
   ```

### Step 5: Verify
```bash
curl http://localhost:4000/health
# Should return: {"status":"ok","timestamp":"..."}
```

## ✅ Alternative: If Docker Won't Start

If you have PostgreSQL installed locally, update `.env`:

```bash
cd /Volumes/EmileDrive/sprint100/server
```

Edit `.env` and change `DATABASE_URL` to your local PostgreSQL:
```
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/sprint100
```

## Current Status

- ✅ `.env` file created with PostgreSQL connection string
- ❌ Docker not running - need to start Docker Desktop
- ✅ Server will work once database is available

---

**Next Steps**: Start Docker Desktop, then run the commands above.

