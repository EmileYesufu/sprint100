# Sprint100 Deployment Guide

This guide covers deployment procedures, automated backups, and production operations for the Sprint100 application.

---

## 📦 Automated Backup Schedule

### Overview

Automated database backups are configured to run daily, ensuring data safety and recovery capabilities.

- **Schedule**: Runs daily at **02:00 UTC** (2:00 AM UTC)
- **Storage Location**: `/app/backups/` folder (or `server/backups/` in local development)
- **Backup File Format**: `backup_<date>_<time>.sql` (e.g., `backup_2025-01-29_02-00.sql`)
- **Logs**: 
  - Backup operations: `backups/backup.log`
  - Cron execution: `backups/cron_backup.log`

---

## 🔧 Cron Job Configuration

### For Render/Railway/Heroku or Linux Server

**Cron Entry:**
```bash
0 2 * * * bash /app/scripts/db_backup.sh >> /app/backups/cron_backup.log 2>&1
```

**Details:**
- `0 2 * * *` - Runs daily at 2:00 AM UTC
- `bash /app/scripts/db_backup.sh` - Executes the backup script
- `>> /app/backups/cron_backup.log` - Appends stdout to cron log
- `2>&1` - Redirects stderr to stdout (logs errors too)

---

## ☁️ Platform-Specific Setup

### Render.com

**Using Render Dashboard:**

1. Navigate to **Render Dashboard → Scheduled Jobs**
2. Click **"New Scheduled Job"** or **"Scheduled Jobs"**
3. Configure:
   - **Name**: `database-backup`
   - **Schedule**: `0 2 * * *` (Daily at 2:00 AM UTC)
   - **Command**: 
     ```bash
     bash /app/scripts/db_backup.sh
     ```
   - **Environment Variables**:
     - `DATABASE_URL`: Your PostgreSQL connection string

**Note**: Render automatically sets `DATABASE_URL` if you've linked a PostgreSQL database service.

---

### Railway.app

**Option 1: Using railway.json**

Add to `railway.json` in project root:
```json
{
  "cron": {
    "backup": {
      "schedule": "0 2 * * *",
      "command": "bash /app/server/scripts/db_backup.sh",
      "environment": {
        "DATABASE_URL": "$DATABASE_URL"
      }
    }
  }
}
```

**Option 2: Using Railway Cron Service**

1. Create new **Cron** service in Railway dashboard
2. Set **Schedule**: `0 2 * * *`
3. Set **Command**: `bash /app/server/scripts/db_backup.sh`
4. Link to your database service (DATABASE_URL auto-injected)

---

### Heroku

**Using Heroku Scheduler:**

1. Install Heroku Scheduler addon:
   ```bash
   heroku addons:create scheduler:standard
   ```

2. Add scheduled job:
   - Go to **Heroku Dashboard → Scheduler**
   - Click **"Create job"**
   - **Schedule**: ICU string `0 2 * * *` or select "Daily" at 02:00 UTC
   - **Run Command**: `bash /app/server/scripts/db_backup.sh`

3. Set environment variables:
   ```bash
   heroku config:set DATABASE_URL="postgresql://..."
   ```

---

### Linux Server (Self-Hosted)

**Using Crontab:**

1. Edit crontab:
   ```bash
   crontab -e
   ```

2. Add cron entry:
   ```bash
   0 2 * * * bash /app/scripts/db_backup.sh >> /app/backups/cron_backup.log 2>&1
   ```

3. Ensure DATABASE_URL is set in environment:
   ```bash
   # Add to ~/.bashrc or /etc/environment
   export DATABASE_URL="postgresql://user:password@host:port/database"
   ```

4. Verify cron job:
   ```bash
   crontab -l
   ```

---

## 📊 Monitoring Backups

### Check Backup Status

**View recent backups:**
```bash
ls -lah /app/backups/backup_*.sql
```

**View backup operation log:**
```bash
tail -f /app/backups/backup.log
```

**View cron execution log:**
```bash
tail -f /app/backups/cron_backup.log
```

### Verify Latest Backup

**Check backup age:**
```bash
ls -lt /app/backups/backup_*.sql | head -1
```

**Expected output:**
```
-rw-r--r-- 1 user user 2.5M Jan 29 02:00 backup_2025-01-29_02-00.sql
```

---

## 🔄 Restore from Backup

### Manual Restore

**Restore a specific backup:**
```bash
cd /app/server
export DATABASE_URL="postgresql://user:password@host:port/database"
./scripts/db_restore.sh backup_2025-01-29_02-00.sql
```

**Note**: The restore script includes:
- Safety confirmation prompt
- Automatic restore verification
- Logging to `backups/backup.log`

---

## 📁 Backup File Management

### Retention Policy

**Recommended retention:**
- **Production**: 30 days
- **Staging**: 7 days
- **Development**: 3 days

### Cleanup Old Backups

**Manual cleanup:**
```bash
# Remove backups older than 30 days
find /app/backups -name "backup_*.sql" -mtime +30 -delete
```

**Automated cleanup (add to cron):**
```bash
# Weekly cleanup at 3:00 AM (after backup)
0 3 * * 0 find /app/backups -name "backup_*.sql" -mtime +30 -delete
```

---

## 🔐 Security Considerations

### Environment Variables

- **Never commit** `DATABASE_URL` to git
- Use platform-specific secure environment variable management
- Rotate database passwords regularly

### Backup File Permissions

```bash
# Set restrictive permissions on backup files
chmod 600 /app/backups/*.sql
chmod 600 /app/backups/backup.log
```

### Offsite Backup Storage

Consider syncing backups to cloud storage:

```bash
# Example: Sync to AWS S3 (add to backup script)
aws s3 cp /app/backups/backup_*.sql s3://your-bucket/backups/
```

---

## 🚨 Troubleshooting

### Backup Not Running

1. **Check cron job status:**
   ```bash
   # Linux
   systemctl status cron
   
   # Render/Railway - Check scheduled jobs dashboard
   ```

2. **Verify script permissions:**
   ```bash
   chmod +x /app/scripts/db_backup.sh
   ```

3. **Check DATABASE_URL:**
   ```bash
   echo $DATABASE_URL  # Should output connection string
   ```

4. **Review cron logs:**
   ```bash
   tail -f /app/backups/cron_backup.log
   ```

### Backup Failed

1. **Check backup log:**
   ```bash
   tail -20 /app/backups/backup.log
   ```

2. **Common issues:**
   - Database connection failure
   - Disk space full: `df -h`
   - Permission denied: `ls -la /app/backups/`
   - Invalid DATABASE_URL format

---

## ✅ Verification Checklist

### After Deployment

- [ ] Cron job is scheduled correctly
- [ ] DATABASE_URL environment variable is set
- [ ] Backup script is executable
- [ ] Backup directory exists and is writable
- [ ] First backup executed successfully
- [ ] Backup log is being written
- [ ] Backup files are being created
- [ ] Restore functionality tested

---

## 📞 Support

For backup-related issues:

1. Check `backapes/backup.log` for backup operation logs
2. Check `backups/cron_backup.log` for cron execution logs
3. Verify DATABASE_URL is correctly set
4. Test manual backup execution
5. Review platform-specific scheduled jobs documentation

---

✨ **Last Updated**: 2025-01-09  
**Status**: ✅ Production Ready

