#!/bin/bash

# Quick deployment script for Ubuntu server
# Usage: ./deploy.sh

set -e

echo "🚀 Starting deployment..."

# Variables
APP_DIR="/var/www/institute-api"
APP_NAME="institute-api"

# Pull latest code
echo "📦 Pulling latest code..."
cd $APP_DIR
git pull

# Install dependencies
echo "📚 Installing dependencies..."
npm install --production

# Run migrations
echo "🗄️  Running database migrations..."
npm run migrate

# Restart application
echo "♻️  Restarting application..."
pm2 reload $APP_NAME

# Check status
echo "✅ Deployment complete!"
pm2 status $APP_NAME

echo ""
echo "📊 Logs: pm2 logs $APP_NAME"
echo "🏥 Health: curl http://localhost:5000/health"
