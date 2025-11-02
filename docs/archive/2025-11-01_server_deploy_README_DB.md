# Sprint100 Database Deployment Guide

This guide covers setting up PostgreSQL for Sprint100 in production environments.

## 🗄️ Database Providers

### Option 1: Render (Recommended for small-medium apps)
1. **Create Database:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "PostgreSQL"
   - Name: `sprint100-db`
   - Plan: Free tier (1GB) or Starter ($7/month)
   - Region: Choose closest to your users

2. **Get Connection String:**
   - Copy the "External Database URL"
   - Format: `postgresql://username:password@host:port/database`

3. **Set Environment Variable:**
   ```bash
   DATABASE_URL=postgresql://sprint100_user:your_password@dpg-abc123-a.oregon-postgres.render.com:5432/sprint100_db
   ```

### Option 2: Railway
1. **Create Database:**
   - Go to [Railway Dashboard](https://railway.app)
   - Click "New Project" → "Database" → "PostgreSQL"
   - Name: `sprint100-db`

2. **Get Connection String:**
   - Go to your database service
   - Copy the "Connection URL" from the Connect tab

3. **Set Environment Variable:**
   ```bash
   DATABASE_URL=postgresql://postgres:password@containers-us-west-1.railway.app:5432/railway
   ```

### Option 3: AWS RDS
1. **Create RDS Instance:**
   - Go to AWS RDS Console
   - Click "Create database"
   - Engine: PostgreSQL
   - Template: Free tier or Production
   - DB instance identifier: `sprint100-db`
   - Master username: `sprint100_admin`
   - Master password: Generate secure password

2. **Configure Security Group:**
   - Allow inbound connections on port 5432
   - Source: Your application's security group or IP

3. **Get Connection String:**
   ```bash
   DATABASE_URL=postgresql://sprint100_admin:password@sprint100-db.abc123.us-west-2.rds.amazonaws.com:5432/sprint100
   ```

## 🚀 Deployment Steps

### 1. Set Environment Variables
```bash
# Production environment
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your_secure_jwt_secret_here
ALLOWED_ORIGINS=https://your-domain.com,https://api.your-domain.com
```

### 2. Run Database Migrations
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Deploy migrations to production
npx prisma migrate deploy

# Optional: Seed database with initial data
npx prisma db seed
```

### 3. Verify Database Connection
```bash
# Test connection
npx prisma db pull

# View database in Prisma Studio
npx prisma studio
```

## 🔧 Migration Commands

### Development
```bash
# Create new migration
npx prisma migrate dev --name add_user_stats

# Reset database (development only)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

### Production
```bash
# Deploy migrations (production safe)
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Check migration status
npx prisma migrate status
```

## 📊 Database Schema

### Tables Created:
- **users** - User accounts with ELO ratings
- **matches** - Race matches
- **match_players** - Player participation in matches

### Key Features:
- **User Management**: Email/username authentication
- **ELO System**: Rating-based matchmaking
- **Match History**: Complete race records
- **Leaderboard**: Computed user statistics

## 🛡️ Security Best Practices

### Database Security:
- ✅ Use strong passwords (16+ characters)
- ✅ Enable SSL connections
- ✅ Restrict network access to application servers
- ✅ Regular security updates
- ✅ Backup strategy (daily automated backups)

### Connection Security:
```bash
# Use SSL in production
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require

# Connection pooling (recommended)
DATABASE_URL=postgresql://user:pass@host:port/db?connection_limit=20&pool_timeout=20
```

## 📈 Performance Optimization

### Connection Pooling:
```bash
# Add to DATABASE_URL for production
?connection_limit=20&pool_timeout=20&connect_timeout=60
```

### Indexes (Auto-created by Prisma):
- `users.email` (unique)
- `users.username` (unique)
- `matches.created_at` (for time-based queries)
- `match_players.user_id` (for user match history)

## 🔍 Monitoring & Maintenance

### Health Checks:
```bash
# Check database connection
curl https://your-api.com/ready

# Check migration status
npx prisma migrate status
```

### Backup Strategy:
```bash
# Daily backup (add to cron)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup_20240115.sql
```

## 🚨 Troubleshooting

### Common Issues:

#### Connection Refused:
```bash
# Check if database is running
pg_isready -h your-host -p 5432

# Verify connection string
echo $DATABASE_URL
```

#### Migration Failed:
```bash
# Check migration status
npx prisma migrate status

# Reset and redeploy (development only)
npx prisma migrate reset
npx prisma migrate deploy
```

#### SSL Certificate Error:
```bash
# Add SSL mode to connection string
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require
```

## 📋 Environment Variables Reference

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `postgresql://user:pass@host:5432/db` | Database connection string |
| `NODE_ENV` | Yes | `production` | Environment mode |
| `JWT_SECRET` | Yes | `secure_random_string` | JWT signing secret |
| `ALLOWED_ORIGINS` | Yes | `https://app.com` | CORS allowed origins |

## 🎯 Production Checklist

- [ ] **Database Provider**: PostgreSQL instance created
- [ ] **Connection String**: DATABASE_URL configured
- [ ] **Security**: Strong password and SSL enabled
- [ ] **Migrations**: `npx prisma migrate deploy` completed
- [ ] **Client**: `npx prisma generate` completed
- [ ] **Health Check**: `/ready` endpoint responding
- [ ] **Backup**: Automated backup strategy in place
- [ ] **Monitoring**: Database metrics configured

## 📞 Support

For database issues:
1. Check connection string format
2. Verify network access
3. Review migration status
4. Check application logs
5. Contact database provider support

---

**⚠️ Security Note**: Never commit DATABASE_URL with real credentials to git. Use environment variables or secure secret management.
