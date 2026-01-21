#!/bin/bash

# PolyLearn Backend - Development Server Start Script
# Kiểm tra services và khởi động dev server

set -e

echo "🔄 Starting PolyLearn Backend (Development)"
echo "==========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    echo "Run ./scripts/setup.sh first"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check PostgreSQL connection
echo "Checking PostgreSQL connection..."
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1" &> /dev/null; then
    echo -e "${GREEN}✓${NC} PostgreSQL connected"
else
    echo -e "${RED}❌ Cannot connect to PostgreSQL${NC}"
    echo "Please check:"
    echo "  - PostgreSQL is running"
    echo "  - DB credentials in .env are correct"
    exit 1
fi

# Check Redis connection
echo "Checking Redis connection..."
if redis-cli -h $REDIS_HOST -p $REDIS_PORT ping &> /dev/null; then
    echo -e "${GREEN}✓${NC} Redis connected"
else
    echo -e "${YELLOW}⚠${NC} Cannot connect to Redis (optional)"
fi

# Check if migrations have been run
echo "Checking database migrations..."
TABLE_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'" 2>/dev/null | xargs)

if [ "$TABLE_COUNT" -eq "0" ]; then
    echo -e "${YELLOW}⚠${NC} No tables found. Running migrations..."
    npm run migrate:up
    echo -e "${GREEN}✓${NC} Migrations complete"
else
    echo -e "${GREEN}✓${NC} Database initialized ($TABLE_COUNT tables)"
fi

echo ""
echo -e "${GREEN}🚀 Starting development server...${NC}"
echo "Press Ctrl+C to stop"
echo ""

npm run dev
