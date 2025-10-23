#!/bin/bash

# Sales God Quick Start Script
# This script helps you set up the Sales God platform quickly

set -e

echo "🚀 Sales God Quick Start"
echo "========================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version) found${NC}"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL not found${NC}"
    echo "Please install PostgreSQL from https://www.postgresql.org/"
    exit 1
fi
echo -e "${GREEN}✅ PostgreSQL found${NC}"

echo ""
echo "📦 Installing dependencies..."
echo ""

# Backend setup
echo "Setting up backend..."
cd backend
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit backend/.env with your database credentials${NC}"
fi
npm install
echo -e "${GREEN}✅ Backend dependencies installed${NC}"
cd ..

# Dashboard setup
echo ""
echo "Setting up dashboard..."
cd dashboard
npm install
if [ ! -f .env ]; then
    echo "VITE_API_URL=http://localhost:3000/api" > .env
fi
echo -e "${GREEN}✅ Dashboard dependencies installed${NC}"
cd ..

echo ""
echo "🗄️  Database Setup"
echo "===================="
echo ""
echo "Please ensure you have:"
echo "1. PostgreSQL running"
echo "2. Created a database called 'sales_god'"
echo "3. Updated backend/.env with your database password"
echo ""
read -p "Have you completed the above steps? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Please complete the database setup and run this script again."
    echo ""
    echo "Quick commands:"
    echo "  psql -U postgres"
    echo "  CREATE DATABASE sales_god;"
    echo "  \\q"
    exit 1
fi

# Run migrations
echo ""
echo "Running database migrations..."
cd backend
npm run migrate
echo -e "${GREEN}✅ Database migrations completed${NC}"

echo ""
read -p "Would you like to seed the database with sample data? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run seed
    echo -e "${GREEN}✅ Database seeded with sample data${NC}"
fi
cd ..

echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo "To start the application:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend"
echo "  npm run dev"
echo ""
echo "Terminal 2 (Dashboard):"
echo "  cd dashboard"
echo "  npm run dev"
echo ""
echo "Chrome Extension:"
echo "  1. Open Chrome and go to chrome://extensions/"
echo "  2. Enable Developer mode"
echo "  3. Click 'Load unpacked'"
echo "  4. Select the 'extension' folder"
echo "  5. Configure your User ID in extension settings"
echo ""
echo "📚 For detailed instructions, see SETUP.md"
echo ""

