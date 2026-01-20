#!/bin/bash

# Database migration script for PolyLearn backend

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '#' | xargs)
fi

# Database connection
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-polylearn}
DB_USER=${DB_USER:-polylearn_user}
DB_PASSWORD=${DB_PASSWORD:-}

echo "🗄️  Running database migrations..."
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo ""

# Run each migration file
for migration in migrations/*.sql; do
  if [ -f "$migration" ]; then
    echo "📝 Running $(basename $migration)..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$migration" -v ON_ERROR_STOP=1 --quiet
    
    if [ $? -eq 0 ]; then
      echo "✅ $(basename $migration) completed"
    else
      echo "❌ $(basename $migration) failed"
      exit 1
    fi
    echo ""
  fi
done

echo "🎉 All migrations completed successfully!"
