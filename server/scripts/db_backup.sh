#!/bin/bash

# Sprint100 Database Backup Script
# Creates a timestamped backup of the PostgreSQL database with logging

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"
LOG_FILE="$BACKUP_DIR/backup.log"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo "Please set DATABASE_URL before running this script:"
    echo "export DATABASE_URL='postgresql://user:password@host:port/database'"
    exit 1
fi

# Create timestamped backup file
BACKUP_FILE="$BACKUP_DIR/backup_$(date +%F_%H-%M).sql"

# Create backup
echo "📦 Creating database backup..."
if pg_dump "$DATABASE_URL" > "$BACKUP_FILE"; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "✅ Backup completed at $(date) — File: $BACKUP_FILE, Size: $BACKUP_SIZE"
    echo "✅ Backup completed at $(date) — File: $BACKUP_FILE" >> "$LOG_FILE"
    echo "✅ Backup file created: $BACKUP_FILE"
else
    echo "❌ Error: Backup failed at $(date)"
    echo "❌ ERROR: Backup failed at $(date) — File: $BACKUP_FILE" >> "$LOG_FILE"
    exit 1
fi

echo "🎉 Database backup completed successfully!"