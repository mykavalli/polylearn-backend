#!/bin/bash

# PolyLearn Backend - Quick Start Script
# Hỗ trợ khởi động nhanh development environment

set -e  # Exit on error

echo "🚀 PolyLearn Backend - Quick Start"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 20+ from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js $(node --version)"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠${NC} PostgreSQL not found (optional for remote DB)"
else
    echo -e "${GREEN}✓${NC} PostgreSQL installed"
fi

# Check if Redis is installed
if ! command -v redis-cli &> /dev/null; then
    echo -e "${YELLOW}⚠${NC} Redis not found (optional for remote Redis)"
else
    echo -e "${GREEN}✓${NC} Redis installed"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

# Check if .env exists
if [ ! -f .env ]; then
    echo ""
    echo -e "${YELLOW}⚠${NC} .env file not found"
    echo "Copying .env.example to .env..."
    cp .env.example .env
    echo -e "${YELLOW}⚠${NC} Please edit .env with your configuration"
    echo ""
    read -p "Press Enter to open .env in editor (or Ctrl+C to exit)..."
    
    # Try to open in editor
    if command -v code &> /dev/null; then
        code .env
    elif command -v nano &> /dev/null; then
        nano .env
    else
        echo "Please manually edit .env file"
    fi
    
    echo ""
    read -p "Press Enter when you've configured .env..."
fi

echo ""
echo "🔨 Building TypeScript..."
npm run build

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Make sure PostgreSQL and Redis are running"
echo "  2. Run migrations: npm run migrate:up"
echo "  3. Start dev server: npm run dev"
echo ""
echo "Or run: ./scripts/start-dev.sh"
