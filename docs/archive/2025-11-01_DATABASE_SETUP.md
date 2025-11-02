# Sprint100 Database Setup Guide

## 🚀 Quick Start

### Local Development with Docker
```bash
# Start PostgreSQL + Server
docker-compose up -d

# Run migrations
cd server && npx prisma migrate dev --name init

# Seed database
npx prisma db seed
```

### Production Deployment
```bash
# Set environment variables
export DATABASE_URL="postgresql://user:pass@host:5432/sprint100"
export JWT_SECRET="your_secure_secret"

# Deploy migrations
cd server && npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

## 📋 Prisma Schema

The schema is configured for PostgreSQL with the following models:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  username  String   @unique
  password  String
  elo       Int      @default(1200)
  createdAt DateTime @default(now())
  players   MatchPlayer[]
  matchesPlayed Int @default(0)
  wins          Int @default(0)
}

model Match {
  id        Int           @id @default(autoincrement())
  createdAt DateTime      @default(now())
  duration  Int?
  players   MatchPlayer[]
}

model MatchPlayer {
  id            Int   @id @default(autoincrement())
  match         Match @relation(fields: [matchId], references: [id])
  matchId       Int
  user          User  @relation(fields: [userId], references: [id])
  userId        Int
  finishPosition Int?
  timeMs        Int?
  deltaElo      Int?
}
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

## 🐳 Docker Setup

### Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f server

# Stop services
docker-compose down
```

### Production
```bash
# Set environment variables
cp .env.docker .env
# Edit .env with production values

# Start production services
docker-compose -f server/deploy/docker-compose.prod.yml up -d
```

## 📊 Database Providers

### Render (Recommended)
- **Free Tier**: 1GB PostgreSQL
- **Starter**: $7/month, 1GB
- **Setup**: [Render Dashboard](https://dashboard.render.com)

### Railway
- **Free Tier**: 1GB PostgreSQL
- **Hobby**: $5/month, 1GB
- **Setup**: [Railway Dashboard](https://railway.app)

### AWS RDS
- **Free Tier**: 20GB PostgreSQL
- **Production**: Pay-as-you-go
- **Setup**: [AWS RDS Console](https://console.aws.amazon.com/rds)

## 🛡️ Security Best Practices

### Connection String Format
```bash
# Production (with SSL)
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require

# With connection pooling
DATABASE_URL=postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=20
```

### Environment Variables
```bash
# Required
DATABASE_URL=postgresql://user:pass@host:5432/sprint100
JWT_SECRET=your_secure_jwt_secret
NODE_ENV=production

# Optional
ALLOWED_ORIGINS=https://your-domain.com
RATE_LIMIT_MAX=100
```

## 🔍 Health Checks

### Database Connection
```bash
# Test connection
npx prisma db pull

# Check migration status
npx prisma migrate status

# View in Prisma Studio
npx prisma studio
```

### Application Health
```bash
# Server health endpoint
curl http://localhost:4000/health

# Database readiness
curl http://localhost:4000/ready
```

## 📈 Performance Optimization

### Connection Pooling
```bash
# Add to DATABASE_URL
?connection_limit=20&pool_timeout=20&connect_timeout=60
```

### Indexes (Auto-created)
- `users.email` (unique)
- `users.username` (unique)
- `matches.created_at`
- `match_players.user_id`

## 🚨 Troubleshooting

### Common Issues

#### Migration Failed
```bash
# Check status
npx prisma migrate status

# Reset (development only)
npx prisma migrate reset
```

#### Connection Refused
```bash
# Check database
pg_isready -h your-host -p 5432

# Verify connection string
echo $DATABASE_URL
```

#### SSL Certificate Error
```bash
# Add SSL mode
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

## 📋 Production Checklist

- [ ] **Database Provider**: PostgreSQL instance created
- [ ] **Connection String**: DATABASE_URL configured
- [ ] **Security**: Strong password and SSL enabled
- [ ] **Migrations**: `npx prisma migrate deploy` completed
- [ ] **Client**: `npx prisma generate` completed
- [ ] **Health Check**: `/ready` endpoint responding
- [ ] **Backup**: Automated backup strategy in place
- [ ] **Monitoring**: Database metrics configured

---

**⚠️ Security Note**: Never commit DATABASE_URL with real credentials to git. Use environment variables or secure secret management.
