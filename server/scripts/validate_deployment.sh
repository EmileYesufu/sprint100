#!/bin/bash
# ------------------------------------------------------------
# Script Name: validate_deployment.sh
# Description: Validates production deployment configuration
# Usage: ./validate_deployment.sh
# Dependencies: prisma, DATABASE_URL, JWT_SECRET environment variables
# ------------------------------------------------------------

set -euo pipefail

echo "🚀 Sprint100 Production Deployment Validation"
echo "=============================================="

# Check if we're in the server directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the server directory"
    exit 1
fi

echo "✅ Running from server directory"

# Check Prisma configuration
echo ""
echo "📋 Checking Prisma Configuration..."
if grep -q 'provider = "postgresql"' prisma/schema.prisma; then
    echo "✅ Prisma configured for PostgreSQL"
else
    echo "❌ Prisma not configured for PostgreSQL"
    exit 1
fi

# Check if DATABASE_URL is set
echo ""
echo "📋 Checking Environment Variables..."
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set"
    echo "   Please set DATABASE_URL to your managed PostgreSQL instance"
    exit 1
else
    echo "✅ DATABASE_URL is set"
    echo "   Database: $(echo $DATABASE_URL | cut -d'@' -f2 | cut -d'/' -f1)"
fi

# Check NODE_ENV
if [ "$NODE_ENV" = "production" ]; then
    echo "✅ NODE_ENV is set to production"
else
    echo "⚠️  NODE_ENV is not set to production (current: $NODE_ENV)"
fi

# Check JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
    echo "❌ JWT_SECRET not set"
    exit 1
else
    if [ ${#JWT_SECRET} -ge 32 ]; then
        echo "✅ JWT_SECRET is set and secure (${#JWT_SECRET} characters)"
    else
        echo "⚠️  JWT_SECRET is too short (${#JWT_SECRET} characters, minimum 32)"
    fi
fi

# Check if migrations exist
echo ""
echo "📋 Checking Database Migrations..."
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations)" ]; then
    echo "✅ Database migrations found"
    echo "   Migration count: $(ls -1 prisma/migrations | grep -v migration_lock.toml | wc -l)"
else
    echo "❌ No database migrations found"
    exit 1
fi

# Check Dockerfile.prod
echo ""
echo "📋 Checking Production Dockerfile..."
if [ -f "Dockerfile.prod" ]; then
    echo "✅ Production Dockerfile exists"
    if grep -q "FROM node:18-alpine" Dockerfile.prod; then
        echo "✅ Using Node.js 18 Alpine"
    fi
    if grep -q "HEALTHCHECK" Dockerfile.prod; then
        echo "✅ Health check configured"
    fi
else
    echo "❌ Production Dockerfile not found"
    exit 1
fi

# Check Procfile
echo ""
echo "📋 Checking Procfile..."
if [ -f "Procfile" ]; then
    echo "✅ Procfile exists"
    if grep -q "npx prisma migrate deploy" Procfile; then
        echo "✅ Database migration command configured"
    fi
else
    echo "❌ Procfile not found"
    exit 1
fi

# Check package.json scripts
echo ""
echo "📋 Checking Package.json Scripts..."
if grep -q '"start": "node dist/server.js"' package.json; then
    echo "✅ Production start script configured"
else
    echo "❌ Production start script not found"
    exit 1
fi

if grep -q '"db:migrate:deploy": "prisma migrate deploy"' package.json; then
    echo "✅ Database migration script configured"
else
    echo "❌ Database migration script not found"
    exit 1
fi

# Test database connection
echo ""
echo "📋 Testing Database Connection..."
if npx prisma db pull --schema=prisma/schema.prisma > /dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    echo "   Please check your DATABASE_URL and ensure the database is accessible"
    exit 1
fi

# Check if tables exist
echo ""
echo "📋 Checking Database Schema..."
if npx prisma db pull --schema=prisma/schema.prisma > /dev/null 2>&1; then
    if npx prisma db pull --schema=prisma/schema.prisma | grep -q "model User"; then
        echo "✅ User table exists"
    else
        echo "⚠️  User table not found - migrations may need to be applied"
    fi
else
    echo "❌ Cannot check database schema"
fi

echo ""
echo "🎉 Deployment Validation Complete!"
echo "=================================="
echo ""
echo "Next Steps:"
echo "1. Run 'npx prisma migrate deploy' to apply migrations"
echo "2. Run 'npm run build' to compile TypeScript"
echo "3. Test the production server with 'npm start'"
echo "4. Run health checks on /health and /api/leaderboard"
echo ""
echo "Production deployment is ready! 🚀"
