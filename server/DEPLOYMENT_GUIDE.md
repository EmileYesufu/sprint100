# Sprint100 PostgreSQL Automated Backup Deployment Guide

## Overview

This guide provides instructions for setting up automated daily backups for the Sprint100 PostgreSQL database in both staging and production environments.

---

## 📋 Prerequisites

- PostgreSQL database accessible via `DATABASE_URL`
- `pg_dump` and `psql` utilities installed
- Access to cron or scheduled job system
- Backups directory: `server/backups/`

---

## 🔧 Scripts

### Backup Script: `scripts/db_backup.sh`

Creates timestamped database backups with logging.

**Features:**
- Automatic timestamped backup files: `backup_YYYY-MM-DD_HH-MM.sql`
- Logging to `backups/backup.log`
- Error handling with `set -e`
- Backup size tracking

**Usage:**
```bash
export DATABASE_URL="postgresql://user:password@host:port/database"
./scripts/db_backup.sh
```

**Output:**
- Backup file: `backups/backup_2025-01-29_13-45.sql`
- Log entry: `✅ Backup completed at [timestamp] — File: backup_2025-01-29_13-45.sql, Size: 2.5M`

### Restore Script: `scripts/db_restore.sh`

Restores database from a backup file.

**Usage:**
```bash
export DATABASE_URL="postgresql://user:password@host:port/database"
./scripts/db_restore.sh backup_2025-01-29_13-45.sql
```

**Features:**
- Safety confirmation prompt
- Restore verification
- Table count validation
- Logging to `backups/backup.log`

---

## ⏰ Automated Backup Scheduling

### Automated Backup Schedule
- **Runs daily at 02:00 UTC** (2:00 AM UTC)
- **Stored in**: `/app/backups/` folder (or `server/backups/` in local deployments)
- **Latest backup**: `backups/backup_<date>_<time>.sql` (e.g., `backup_2025-01-29_02-00.sql`)
- **Logs written to**: `backups/backup.log`
- **Cron logs written to**: `backups/cron_backup.log`

### Option 1: Linux Cron (Recommended for Self-Hosted)

**Daily Backup at 2:00 AM UTC:**

```bash
# Add to crontab: crontab -e
0 2 * * * bash /app/scripts/db_backup.sh >> /app/backups/cron_backup.log 2>&1
```

**For Render/Railway/Heroku or Linux server:**
```bash
0 2 * * * bash /app/scripts/db_backup.sh >> /app/backups/cron_backup.log 2>&1
```

This cron entry:
- Runs daily at 2:00 AM UTC (`0 2 * * *`)
- Logs both stdout and stderr to `cron_backup.log` (`2>&1`)
- Uses absolute paths for reliability

**Twice Daily (2:00 AM and 2:00 PM):**

```bash
0 2,14 * * * cd /path/to/server && export DATABASE_URL="postgresql://..." && bash scripts/db_backup.sh >> backups/cron_backup.log 2>&1
```

**Weekly Backup (Sunday 2:00 AM):**

```bash
0 2 * * 0 cd /path/to/server && export DATABASE_URL="postgresql://..." && bash scripts/db_backup.sh >> backups/cron_backup.log 2>&1
```

### Option 2: Render.com Scheduled Jobs

**Using Render Dashboard:**

1. Go to **Render Dashboard → Scheduled Jobs**
2. Click **"New Scheduled Job"**
3. Configure the job:
   - **Name**: `database-backup`
   - **Schedule**: `0 2 * * *` (Daily at 2:00 AM UTC)
   - **Command**: 
     ```bash
     bash /app/scripts/db_backup.sh
     ```
   - **Environment Variables**: 
     - `DATABASE_URL`: Your PostgreSQL connection string
   
4. The job will automatically:
   - Create timestamped backups in `/app/backups/`
   - Log to `/app/backups/backup.log`
   - Log cron execution to `/app/backups/cron_backup.log` (if configured)

### Option 3: Railway.app Cron Jobs

**Add to `railway.json`:**

```json
{
  "cron": {
    "backup": {
      "schedule": "0 2 * * *",
      "command": "cd server && bash scripts/db_backup.sh",
      "environment": {
        "DATABASE_URL": "$DATABASE_URL"
      }
    }
  }
}
```

Or use Railway's Cron service:

1. Create new Cron service
2. Set schedule: `0 2 * * *`
3. Set command: `bash scripts/db_backup.sh`
4. Link to database service

### Option 4: Heroku Scheduler

**Add Heroku Scheduler addon:**

```bash
heroku addons:create scheduler:standard
```

**Configure job:**

1. Go to Heroku Dashboard → Scheduler
2. Create job:
   - **Schedule**: `0 2 * * *` (Daily at 2:00 AM)
   - **Command**: `cd server && bash scripts/db_backup.sh`

**Set environment variables:**

```bash
heroku config:set DATABASE_URL="postgresql://..."
```

### Option 5: Fly.io Cron Jobs

**Add to `fly.toml`:**

```toml
[[services]]
  [[services.concurrency]]
    hard_limit = 25
    soft_limit = 20
    type = "connections"

[[services.http_checks]]
  interval = "10s"
  timeout = "2s"
  grace_period = "5s"
  method = "GET"
  path = "/health"

[[vm]]
  size = "shared-cpu-1x"

[[vm.init]]
  ["/app/server/scripts/db_backup.sh"]

[[vm.cron]]
  schedule = "0 2 * * *"
  command = "bash /app/server/scripts/db_backup.sh"
```

---

## 📊 Backup Monitoring

### Check Backup Status

**View recent backups:**
```bash
ls -lah server/backups/backup_*.sql
```

**View backup log:**
```bash
tail -f server/backups/backup.log
```

**View cron execution log:**
```bash
tail -f server/backups/cron_backup.log
```

### Backup Verification Script

Create `scripts/verify_backups.sh`:

```bash
#!/bin/bash

BACKUP_DIR="server/backups"
LOG_FILE="$BACKUP_DIR/backup.log"

echo "📊 Backup Status"
echo "================"

# Check latest backup
LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/backup_*.sql 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ No backups found"
    exit 1
fi

BACKUP_AGE=$(($(date +%s) - $(stat -c %Y "$LATEST_BACKUP" 2>/dev/null || stat -f %m "$LATEST_BACKUP")))
BACKUP_AGE_HOURS=$((BACKUP_AGE / 3600))

echo "✅ Latest backup: $(basename $LATEST_BACKUP)"
echo "📅 Age: $BACKUP_AGE_HOURS hours"

if [ $BACKUP_AGE_HOURS -gt 25 ]; then
    echo "⚠️  WARNING: Backup is older than 25 hours"
    exit 1
fi

# Check log
echo ""
echo "📝 Recent log entries:"
tail -5 "$LOG_FILE" 2>/dev/null || echo "No log entries found"

echo ""
echo "✅ Backup verification complete"
```

---

## 🧪 Testing Backup and Restore

### Test Backup

```bash
cd server
export DATABASE_URL="postgresql://user:password@host:port/database"
./scripts/db_backup.sh
```

**Expected Output:**
```
📦 Creating database backup...
✅ Backup completed at [timestamp] — File: backups/backup_2025-01-29_13-45.sql, Size: 2.5M
✅ Backup file created: backups/backup_2025-01-29_13-45.sql
🎉 Database backup completed successfully!
```

### Test Restore

**Step 1: Drop a test table (optional):**
```sql
-- Connect to database
psql $DATABASE_URL

-- Drop a test table
DROP TABLE IF EXISTS test_table;
```

**Step 2: Restore from backup:**
```bash
cd server
export DATABASE_URL="postgresql://user:password@host:port/database"
./scripts/db_restore.sh backup_2025-01-29_13-45.sql
```

**Expected Output:**
```
⚠️  WARNING: This will replace all data in the target database!
Are you sure you want to continue? (y/N): y
🔄 Restoring database from backup...
✅ Restore completed successfully from backups/backup_2025-01-29_13-45.sql
🔍 Verifying restore...
📊 Tables in database: 3
👥 Users in database: 5
🎉 Database restore completed successfully!
```

**Step 3: Verify restore:**
```sql
-- Connect to database
psql $DATABASE_URL

-- Verify tables exist
\dt

-- Check user count
SELECT COUNT(*) FROM "User";
```

---

## 📁 Backup File Management

### Backup Retention

The backup script creates timestamped files daily. Recommended retention:

- **Production**: Keep last 30 days
- **Staging**: Keep last 7 days
- **Development**: Keep last 3 days

**Manual cleanup:**
```bash
# Remove backups older than 30 days
find server/backups -name "backup_*.sql" -mtime +30 -delete
```

**Automated cleanup (add to cron):**
```bash
# Weekly cleanup at 3:00 AM
0 3 * * 0 find /path/to/server/backups -name "backup_*.sql" -mtime +30 -delete
```

### Backup Storage

**Recommended storage locations:**

1. **Local filesystem**: `server/backups/`
2. **Cloud storage**: AWS S3, Google Cloud Storage, Azure Blob
3. **External backup service**: Backupify, Backblaze

**S3 Backup Example:**
```bash
# After backup, sync to S3
aws s3 cp server/backups/backup_*.sql s3://your-bucket/backups/
```

---

## 🔐 Security Considerations

### Environment Variables

**Never commit DATABASE_URL to git:**
```bash
# Add to .gitignore
.env
*.env
backups/
```

**Use secure environment variable management:**
- Render: Environment variables in dashboard
- Railway: Environment variables in settings
- Heroku: `heroku config:set DATABASE_URL=...`
- Fly.io: `fly secrets set DATABASE_URL=...`

### Backup File Permissions

**Secure backup files:**
```bash
# Set restrictive permissions
chmod 600 server/backups/*.sql
chmod 600 server/backups/backup.log
```

---

## 🚨 Troubleshooting

### Common Issues

**1. Permission Denied:**
```bash
chmod +x scripts/db_backup.sh
chmod +x scripts/db_restore.sh
```

**2. DATABASE_URL Not Set:**
```bash
export DATABASE_URL="postgresql://user:password@host:port/database"
```

**3. pg_dump Not Found:**
```bash
# Install PostgreSQL client tools
# Ubuntu/Debian:
sudo apt-get install postgresql-client

# macOS:
brew install postgresql

# Docker:
docker run --rm postgres:alpine pg_dump ...
```

**4. Backup Fails:**
- Check database connectivity
- Verify DATABASE_URL format
- Check disk space: `df -h`
- Review backup log: `tail -f server/backups/backup.log`

---

## ✅ Verification Checklist

### Production Deployment

- [ ] Backup script is executable: `chmod +x scripts/db_backup.sh`
- [ ] Restore script is executable: `chmod +x scripts/db_restore.sh`
- [ ] DATABASE_URL is set in environment
- [ ] Cron job is configured and tested
- [ ] Backup log is being written: `tail -f backups/backup.log`
- [ ] Backup files are being created: `ls -lah backups/backup_*.sql`
- [ ] Restore functionality tested and verified
- [ ] Backup retention policy configured
- [ ] Monitoring alerts configured (optional)

### Staging Deployment

- [ ] Same checklist as production
- [ ] Test restore from production backup
- [ ] Verify backup schedule works correctly

---

## 📞 Support

For issues or questions:
1. Check backup log: `server/backups/backup.log`
2. Check cron log: `server/backups/cron_backup.log`
3. Verify DATABASE_URL is correct
4. Test manual backup execution
5. Review troubleshooting section above

---

**Last Updated**: 2025-01-29  
**Status**: ✅ Production Ready

