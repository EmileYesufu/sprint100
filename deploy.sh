#!/bin/bash

# Sprint100 Deployment Script
# Usage: ./deploy.sh [render|railway|heroku|docker]

set -e

DEPLOY_TARGET=${1:-render}

echo "🚀 Deploying Sprint100 to $DEPLOY_TARGET..."

case $DEPLOY_TARGET in
  "render")
    echo "📋 Render Deployment Instructions:"
    echo "1. Connect your GitHub repository to Render"
    echo "2. Create a new Web Service"
    echo "3. Set the following environment variables:"
    echo "   - NODE_ENV=production"
    echo "   - DATABASE_URL=postgresql://user:pass@host:5432/sprint100"
    echo "   - JWT_SECRET=your_secure_jwt_secret"
    echo "   - ALLOWED_ORIGINS=https://your-domain.com"
    echo "4. Build Command: cd server && npm install && npx prisma migrate deploy && npm run build"
    echo "5. Start Command: cd server && npm start"
    echo ""
    echo "✅ Render deployment configured!"
    ;;
    
  "railway")
    echo "📋 Railway Deployment:"
    if ! command -v railway &> /dev/null; then
      echo "Installing Railway CLI..."
      npm install -g @railway/cli
    fi
    
    echo "Logging in to Railway..."
    railway login
    
    echo "Deploying to Railway..."
    railway up
    
    echo "Running database migrations..."
    railway run npx prisma migrate deploy
    
    echo "✅ Railway deployment complete!"
    ;;
    
  "heroku")
    echo "📋 Heroku Deployment:"
    if ! command -v heroku &> /dev/null; then
      echo "Please install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli"
      exit 1
    fi
    
    echo "Creating Heroku app..."
    heroku create sprint100-api
    
    echo "Adding PostgreSQL addon..."
    heroku addons:create heroku-postgresql:mini
    
    echo "Setting environment variables..."
    heroku config:set NODE_ENV=production
    heroku config:set JWT_SECRET=$(openssl rand -base64 32)
    heroku config:set ALLOWED_ORIGINS=https://sprint100-api.herokuapp.com
    
    echo "Deploying to Heroku..."
    git push heroku main
    
    echo "Running database migrations..."
    heroku run npx prisma migrate deploy
    
    echo "✅ Heroku deployment complete!"
    ;;
    
  "docker")
    echo "📋 Docker Deployment:"
    echo "Building production image..."
    docker build -t sprint100-server ./server
    
    echo "Starting services with Docker Compose..."
    docker-compose -f docker-compose.prod.yml up -d
    
    echo "Waiting for services to start..."
    sleep 10
    
    echo "Running database migrations..."
    docker-compose -f docker-compose.prod.yml exec server npx prisma migrate deploy
    
    echo "✅ Docker deployment complete!"
    echo "Server running at: http://localhost:4000"
    ;;
    
  *)
    echo "❌ Invalid deployment target: $DEPLOY_TARGET"
    echo "Usage: ./deploy.sh [render|railway|heroku|docker]"
    exit 1
    ;;
esac

echo ""
echo "🎉 Deployment complete!"
echo "Check the logs and health endpoints to verify deployment."
