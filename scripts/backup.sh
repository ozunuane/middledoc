#!/bin/bash
# MiddleDoc Database Backup Script
# Run via cron: 0 2 * * * /path/to/backup.sh

BACKUP_DIR="${BACKUP_DIR:-/backups/db}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
DB_CONTAINER="${DB_CONTAINER:-accountant-hub-db}"
DB_USER="${DB_USER:-accountant}"
DB_NAME="${DB_NAME:-accountant_hub}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup..."

docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_DIR/middledoc_${TIMESTAMP}.sql.gz"

if [ $? -eq 0 ]; then
  SIZE=$(du -h "$BACKUP_DIR/middledoc_${TIMESTAMP}.sql.gz" | cut -f1)
  echo "[$(date)] Backup completed: middledoc_${TIMESTAMP}.sql.gz ($SIZE)"
else
  echo "[$(date)] ERROR: Backup failed!"
  exit 1
fi

# Cleanup old backups
find "$BACKUP_DIR" -name "middledoc_*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "[$(date)] Cleaned backups older than $RETENTION_DAYS days"
