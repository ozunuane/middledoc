#!/bin/sh
# Run all database migrations
# Usage: DATABASE_URL=postgres://... ./scripts/run-migrations.sh

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL not set"
  exit 1
fi

echo "Running migrations..."

# Run each migration file
for f in scripts/migrate-*.sql; do
  if [ -f "$f" ]; then
    echo "  Running: $f"
    psql "$DATABASE_URL" -f "$f" 2>&1 | grep -E "CREATE|ALTER|INSERT|ERROR" || true
  fi
done

# Run init.sql for fresh databases (idempotent — uses IF NOT EXISTS)
echo "  Running: scripts/init.sql"
psql "$DATABASE_URL" -f scripts/init.sql 2>&1 | grep -E "CREATE|ALTER|INSERT|ERROR" || true

echo "Migrations complete."
