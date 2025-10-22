# Sprint100 Environment Setup Guide

This guide explains how to set up environment files for the Sprint100 project.

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Run the setup script from the project root
./setup-env.sh
```

### Option 2: Manual Setup
```bash
# Server setup
cd server
cp .env.example .env
npm install
npm run dev

# Client setup (in a new terminal)
cd client
cp .env.example .env
npm install
npx expo start
```

## 📁 Environment Files

### Server Environment Files
- **`.env.example`** - Template with all required variables
- **`.env.test`** - Test-specific configuration
- **`.env`** - Your local configuration (created from .env.example)

### Client Environment Files
- **`.env.example`** - Template with all required variables
- **`.env.test`** - Test-specific configuration
- **`.env`** - Your local configuration (created from .env.example)

## 🔧 Required Configuration

### Server (.env)
```bash
# Critical variables that must be set:
JWT_SECRET=your_secure_jwt_secret_here
DATABASE_URL=file:./prisma/dev.db
HOST=0.0.0.0
PORT=4000
```

### Client (.env)
```bash
# Critical variables that must be set:
EXPO_PUBLIC_API_URL=http://localhost:4000
SERVER_URL=http://localhost:4000
```

## 🛡️ Security Notes

### Development
- Default JWT_SECRET is provided for development
- CORS allows all origins for easy testing
- SQLite database is used for simplicity

### Production
- **MUST** set a secure JWT_SECRET
- **MUST** configure specific ALLOWED_ORIGINS
- **MUST** use external database (PostgreSQL recommended)
- **NEVER** commit .env files to git

## 🧪 Testing

### Run Tests with Test Environment
```bash
# Server tests
cd server
NODE_ENV=test npm test

# Client tests
cd client
APP_ENV=test npm test
```

## 🚨 Environment Validation

The server includes automatic environment validation:

### Development Mode
- Shows warnings for insecure defaults
- Continues running with warnings

### Production Mode
- **Exits with error code 1** if critical variables are missing
- **Exits with error code 1** if insecure defaults are detected
- Prevents accidental production deployment with dev settings

### Validation Checks
- ✅ JWT_SECRET is set and not using default/placeholder
- ✅ DATABASE_URL is configured
- ✅ ALLOWED_ORIGINS is not wildcard (*) in production
- ✅ External database is used in production (not SQLite file)

## 📋 Environment Variables Reference

### Server Variables
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | `development` | Environment mode |
| `HOST` | Yes | `0.0.0.0` | Server host |
| `PORT` | Yes | `4000` | Server port |
| `DATABASE_URL` | Yes | `file:./prisma/dev.db` | Database connection |
| `JWT_SECRET` | Yes | `dev_secret_change_me` | JWT signing secret |
| `ALLOWED_ORIGINS` | Yes | `*` | CORS allowed origins |
| `RATE_LIMIT_MAX` | No | `200` | Rate limit per window |
| `ENABLE_REQUEST_LOGGING` | No | `true` | Enable request logging |

### Client Variables
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EXPO_PUBLIC_API_URL` | Yes | `http://localhost:4000` | API server URL |
| `SERVER_URL` | Yes | `http://localhost:4000` | Server URL (fallback) |
| `APP_ENV` | No | `development` | App environment |
| `FEATURE_FLAGS` | No | `challenges,training,leaderboard` | Enabled features |
| `SENTRY_DSN` | No | (empty) | Error tracking DSN |
| `ANALYTICS_ENABLED` | No | `false` | Enable analytics |

## 🔍 Troubleshooting

### Common Issues

#### Server won't start
```bash
# Check if .env exists
ls -la server/.env

# Check environment validation
cd server && node -e "require('./src/config.ts')"
```

#### Client can't connect to server
```bash
# Check API URL in client/.env
cat client/.env | grep EXPO_PUBLIC_API_URL

# Verify server is running
curl http://localhost:4000/health
```

#### Production deployment fails
```bash
# Check production environment
NODE_ENV=production node -e "require('./src/config.ts')"

# Should show validation errors and exit with code 1
```

## 📝 Example Configurations

### Development
```bash
# server/.env
NODE_ENV=development
JWT_SECRET=dev_secret_123
DATABASE_URL=file:./prisma/dev.db
ALLOWED_ORIGINS=http://localhost:19006,exp://192.168.1.250:19000
```

### Production
```bash
# server/.env
NODE_ENV=production
JWT_SECRET=super_secure_production_secret_here
DATABASE_URL=postgresql://user:pass@localhost:5432/sprint100
ALLOWED_ORIGINS=https://app.sprint100.com,https://api.sprint100.com
```

### Testing
```bash
# server/.env.test
NODE_ENV=test
JWT_SECRET=test_secret
DATABASE_URL=file:./prisma/test.db
ALLOWED_ORIGINS=http://localhost:19006
```

## 🎯 Next Steps

1. **Copy environment files**: `./setup-env.sh`
2. **Update configuration**: Edit `.env` files with your settings
3. **Start development**: Follow the quick start commands
4. **Test the setup**: Verify server and client can connect
5. **Deploy to production**: Use production environment variables

---

**⚠️ Security Reminder**: Never commit `.env` files to git. They contain sensitive information and are automatically ignored by `.gitignore`.
