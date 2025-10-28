#!/bin/bash

# Insignia Crypto - Docker Deployment Script
# This script builds and runs the application using Docker Compose

set -e

echo "🚀 Starting Insignia Crypto Deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please update it with your configuration."
    exit 1
fi

# Build and start containers
echo "📦 Building Docker images..."
docker-compose build

echo "🔄 Starting containers..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Check container status
echo "📊 Container status:"
docker-compose ps

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Application is running at: http://localhost:${PORT:-3000}"
echo "📚 API Documentation: http://localhost:${PORT:-3000}/api"
echo ""
echo "📝 Useful commands:"
echo "  - View logs: docker-compose logs -f app"
echo "  - Stop containers: docker-compose down"
echo "  - Restart: docker-compose restart"
echo "  - View database: docker-compose exec postgres psql -U postgres -d insignia_crypto"
