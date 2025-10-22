# Sprint100 Deployment Guide

## 🚀 Production Deployment Options

### Option 1: Render (Recommended)
**Best for**: Small to medium applications, easy setup, free tier available

#### Setup Steps:
1. **Create Render Account**: [render.com](https://render.com)
2. **Connect GitHub Repository**: Link your Sprint100 repo
3. **Create Web Service**:
   - Build Command: `cd server && npm install && npm run build`
   - Start Command: `cd server && npm start`
   - Environment: Node.js
   - Region: Choose closest to your users

#### Environment Variables:
```bash
NODE_ENV=production
HOST=0.0.0.0
PORT=10000
DATABASE_URL=postgresql://user:pass@host:5432/sprint100
JWT_SECRET=your_secure_jwt_secret_here
ALLOWED_ORIGINS=https://your-domain.com,https://api.your-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
ENABLE_REQUEST_LOGGING=false
```

#### Database Setup:
1. **Create PostgreSQL Database**:
   - Go to Render Dashboard → New → PostgreSQL
   - Name: `sprint100-db`
   - Plan: Free (1GB) or Starter ($7/month)
   - Copy the External Database URL

2. **Run Migrations**:
   ```bash
   # Add to Build Command in Render:
   cd server && npm install && npx prisma migrate deploy && npm run build
   ```

### Option 2: Railway
**Best for**: Modern deployment, excellent DX, automatic deployments

#### Setup Steps:
1. **Install Railway CLI**: `npm install -g @railway/cli`
2. **Login**: `railway login`
3. **Deploy**: `railway up`

#### Environment Variables:
```bash
NODE_ENV=production
DATABASE_URL=postgresql://postgres:password@containers-us-west-1.railway.app:5432/railway
JWT_SECRET=your_secure_jwt_secret_here
ALLOWED_ORIGINS=https://your-domain.com
```

#### Railway Configuration:
```json
// railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd server && npm start",
    "healthcheckPath": "/health"
  }
}
```

### Option 3: Heroku
**Best for**: Established platform, extensive add-ons, enterprise features

#### Setup Steps:
1. **Install Heroku CLI**: [devcenter.heroku.com](https://devcenter.heroku.com)
2. **Login**: `heroku login`
3. **Create App**: `heroku create sprint100-api`
4. **Add PostgreSQL**: `heroku addons:create heroku-postgresql:mini`

#### Environment Variables:
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secure_jwt_secret_here
heroku config:set ALLOWED_ORIGINS=https://your-domain.com
```

#### Deploy:
```bash
git push heroku main
heroku run npx prisma migrate deploy
```

### Option 4: Docker (Self-Hosting)
**Best for**: Full control, custom infrastructure, enterprise deployments

#### Setup Steps:
1. **Build Image**: `docker build -t sprint100-server .`
2. **Run Container**: `docker-compose up -d`
3. **Access**: `http://localhost:4000`

## 🔧 Deployment Scripts

### Root Package.json Scripts:
```json
{
  "scripts": {
    "deploy:render": "cd server && npm run build && echo 'Deploy to Render via GitHub integration'",
    "deploy:railway": "railway up",
    "deploy:heroku": "git push heroku main && heroku run npx prisma migrate deploy",
    "deploy:docker": "docker-compose up -d",
    "deploy:production": "npm run deploy:render"
  }
}
```

### Server Package.json Scripts:
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "start:prod": "cross-env NODE_ENV=production node dist/server.js",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:generate": "prisma generate"
  }
}
```

## 📋 Environment Configuration

### Development:
```bash
NODE_ENV=development
DATABASE_URL=file:./prisma/dev.db
JWT_SECRET=dev_secret_change_me
ALLOWED_ORIGINS=*
```

### Production:
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/sprint100
JWT_SECRET=your_secure_production_secret
ALLOWED_ORIGINS=https://your-domain.com,https://api.your-domain.com
```

## 🗄️ Database Migration

### Pre-deployment:
```bash
# Generate Prisma client
npx prisma generate

# Deploy migrations
npx prisma migrate deploy

# Verify database connection
npx prisma db pull
```

### Post-deployment:
```bash
# Check migration status
npx prisma migrate status

# View database in Prisma Studio
npx prisma studio
```

## 🔍 Health Checks

### Endpoints:
- **Health**: `GET /health` - Basic server health
- **Ready**: `GET /ready` - Database connectivity
- **Metrics**: `GET /metrics` - Application metrics

### Monitoring:
```bash
# Check server health
curl https://your-api.com/health

# Check database connectivity
curl https://your-api.com/ready

# View logs
heroku logs --tail  # Heroku
railway logs        # Railway
```

## 🚨 Troubleshooting

### Common Issues:

#### Build Failures:
```bash
# Check Node.js version
node --version

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Database Connection:
```bash
# Test database URL
npx prisma db pull

# Check environment variables
echo $DATABASE_URL

# Verify SSL settings
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

#### Memory Issues:
```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" npm start

# Monitor memory usage
heroku ps:scale web=1:standard-1x  # Heroku
```

## 📊 Performance Optimization

### Production Settings:
```bash
# Node.js optimization
NODE_ENV=production
NODE_OPTIONS="--max-old-space-size=2048"

# Database connection pooling
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=20"

# Rate limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
```

### Monitoring:
- **Uptime**: Use UptimeRobot or Pingdom
- **Logs**: Centralized logging with Papertrail or LogDNA
- **Metrics**: Application performance monitoring
- **Alerts**: Set up alerts for downtime and errors

## 🔐 Security Checklist

### Pre-deployment:
- [ ] **JWT_SECRET**: Strong, unique secret (32+ characters)
- [ ] **Database**: SSL-enabled connection
- [ ] **CORS**: Specific allowed origins (not *)
- [ ] **Rate Limiting**: Appropriate limits for your traffic
- [ ] **HTTPS**: SSL certificate configured
- [ ] **Environment**: All secrets in environment variables

### Post-deployment:
- [ ] **Health Checks**: All endpoints responding
- [ ] **Database**: Migrations applied successfully
- [ ] **Logs**: No errors in application logs
- [ ] **Performance**: Response times under 200ms
- [ ] **Security**: No sensitive data in logs

## 🎯 Quick Start Commands

### Render Deployment:
```bash
# 1. Connect GitHub repo to Render
# 2. Set environment variables in Render dashboard
# 3. Deploy automatically on git push
```

### Railway Deployment:
```bash
npm install -g @railway/cli
railway login
railway up
railway run npx prisma migrate deploy
```

### Heroku Deployment:
```bash
heroku create sprint100-api
heroku addons:create heroku-postgresql:mini
git push heroku main
heroku run npx prisma migrate deploy
```

### Docker Deployment:
```bash
docker-compose up -d
docker-compose logs -f
```

---

**💡 Pro Tip**: Start with Render for simplicity, then migrate to Railway or Heroku for advanced features. Use Docker for full control and enterprise deployments.
