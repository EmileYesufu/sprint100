#!/bin/bash

# Sprint100 Environment Setup Script
# This script sets up environment files for both server and client

echo "🚀 Setting up Sprint100 environment files..."

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "server" ] || [ ! -d "client" ]; then
    echo "❌ Error: Please run this script from the Sprint100 root directory"
    exit 1
fi

# Server setup
echo "📁 Setting up server environment..."
cd server

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Created server/.env from .env.example"
    else
        echo "❌ Error: server/.env.example not found"
        exit 1
    fi
else
    echo "⚠️  server/.env already exists, skipping..."
fi

# Install server dependencies
echo "📦 Installing server dependencies..."
npm install

# Client setup
echo "📁 Setting up client environment..."
cd ../client

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Created client/.env from .env.example"
    else
        echo "❌ Error: client/.env.example not found"
        exit 1
    fi
else
    echo "⚠️  client/.env already exists, skipping..."
fi

# Install client dependencies
echo "📦 Installing client dependencies..."
npm install

# Return to root
cd ..

echo ""
echo "🎉 Environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update server/.env with your configuration"
echo "2. Update client/.env with your API URL"
echo "3. Start the server: cd server && npm run dev"
echo "4. Start the client: cd client && npx expo start"
echo ""
echo "🔧 Configuration files created:"
echo "   - server/.env (from .env.example)"
echo "   - client/.env (from .env.example)"
echo ""
echo "⚠️  Remember to:"
echo "   - Set a secure JWT_SECRET in server/.env"
echo "   - Update EXPO_PUBLIC_API_URL in client/.env"
echo "   - Never commit .env files to git"
