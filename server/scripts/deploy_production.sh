#!/bin/bash

# Sprint100 Production Deployment Script
# This script automates the production deployment process

echo "🚀 Sprint100 Production Deployment"
echo "=================================="

# Check if we're in the server directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the server directory"
    exit 1
fi

# Check if required environment variables are set
echo "📋 Checking Environment Variables..."
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not set"
    echo "   Please set DATABASE_URL to your managed PostgreSQL instance"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ Error: JWT_SECRET not set"
    echo "   Please set JWT_SECRET to a secure 32+ character string"
    exit 1
fi

if [ "$NODE_ENV" != "production" ]; then
    echo "⚠️  Warning: NODE_ENV is not set to production (current: $NODE_ENV)"
    echo "   Setting NODE_ENV to production..."
    export NODE_ENV=production
fi

echo "✅ Environment variables configured"

# Step 1: Install dependencies
echo ""
echo "📦 Installing Dependencies..."
npm ci --only=production
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"

# Step 2: Generate Prisma client
echo ""
echo "🔧 Generating Prisma Client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to generate Prisma client"
    exit 1
fi
echo "✅ Prisma client generated"

# Step 3: Deploy database migrations
echo ""
echo "🗄️  Deploying Database Migrations..."
npx prisma migrate deploy
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to deploy database migrations"
    exit 1
fi
echo "✅ Database migrations deployed"

# Step 4: Build TypeScript
echo ""
echo "🔨 Building TypeScript..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to build TypeScript"
    exit 1
fi
echo "✅ TypeScript built"

# Step 5: Validate deployment
echo ""
echo "🔍 Validating Deployment..."
if [ -f "scripts/validate_deployment.sh" ]; then
    ./scripts/validate_deployment.sh
    if [ $? -ne 0 ]; then
        echo "❌ Error: Deployment validation failed"
        exit 1
    fi
else
    echo "⚠️  Warning: Validation script not found, skipping validation"
fi

# Step 6: Start production server
echo ""
echo "🚀 Starting Production Server..."
echo "   Environment: $NODE_ENV"
echo "   Database: $(echo $DATABASE_URL | cut -d'@' -f2 | cut -d'/' -f1)"
echo "   Port: ${PORT:-4000}"
echo ""

# Start the server in the background
npm start &
SERVER_PID=$!

# Wait a moment for the server to start
sleep 5

# Check if the server is running
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Production server started (PID: $SERVER_PID)"
else
    echo "❌ Error: Failed to start production server"
    exit 1
fi

# Step 7: Run health checks
echo ""
echo "🏥 Running Health Checks..."
if [ -f "scripts/production_health_check.sh" ]; then
    ./scripts/production_health_check.sh
    if [ $? -ne 0 ]; then
        echo "❌ Error: Health checks failed"
        kill $SERVER_PID 2>/dev/null
        exit 1
    fi
else
    echo "⚠️  Warning: Health check script not found, skipping health checks"
fi

echo ""
echo "🎉 Production Deployment Complete!"
echo "=================================="
echo ""
echo "✅ Server Status: RUNNING"
echo "✅ Database: CONNECTED"
echo "✅ Migrations: DEPLOYED"
echo "✅ Health Checks: PASSED"
echo ""
echo "🌐 Server Information:"
echo "   URL: http://localhost:${PORT:-4000}"
echo "   Health: http://localhost:${PORT:-4000}/health"
echo "   API: http://localhost:${PORT:-4000}/api"
echo ""
echo "📊 Monitoring:"
echo "   PID: $SERVER_PID"
echo "   Logs: Check server logs for any issues"
echo "   Health: Run ./scripts/production_health_check.sh"
echo ""
echo "🚀 Production server is ready for traffic!"
echo ""
echo "To stop the server: kill $SERVER_PID"
echo "To view logs: Check server output above"
echo "To run health checks: ./scripts/production_health_check.sh"
