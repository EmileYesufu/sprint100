#!/bin/bash
# ------------------------------------------------------------
# Script Name: db_restore.sh
# Description: Restores PostgreSQL database from a backup file
# Usage: ./db_restore.sh <backup_filename.sql>
# Dependencies: psql, DATABASE_URL environment variable, backup files
# ------------------------------------------------------------

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"
LOG_FILE="$BACKUP_DIR/backup.log"

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "❌ Error: No backup file specified"
    echo "Usage: ./scripts/db_restore.sh <backup_filename.sql>"
    echo ""
    echo "Available backup files:"
    ls -la "$BACKUP_DIR"/backup_*.sql 2>/dev/null || echo "No backup files found"
    exit 1
fi

BACKUP_FILE="$1"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo "Please set DATABASE_URL before running this script:"
    echo "export DATABASE_URL='postgresql://user:password@host:port/database'"
    exit 1
fi

# Handle both relative and absolute paths
if [[ "$BACKUP_FILE" == */* ]]; then
    FULL_BACKUP_PATH="$BACKUP_FILE"
else
    FULL_BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILE"
fi

# Check if backup file exists
if [ ! -f "$FULL_BACKUP_PATH" ]; then
    echo "❌ Error: Backup file not found: $FULL_BACKUP_PATH"
    echo "Available backup files:"
    ls -la "$BACKUP_DIR"/backup_*.sql 2>/dev/null || echo "No backup files found"
    exit 1
fi

# Warning about data loss
echo "⚠️  WARNING: This will replace all data in the target database!"
echo "Are you sure you want to continue? (y/N)"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "❌ Restore cancelled"
    exit 0
fi

# Restore database
echo "🔄 Restoring database from backup..."
if psql "$DATABASE_URL" < "$FULL_BACKUP_PATH"; then
    echo "✅ Restore completed successfully from $FULL_BACKUP_PATH"
    echo "✅ Restore completed at $(date) — File: $FULL_BACKUP_PATH" >> "$LOG_FILE"
    
    # Verify restore by checking table count
    echo "🔍 Verifying restore..."
    TABLE_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
    echo "📊 Tables in database: $TABLE_COUNT"
    
    # Check if Sprint100 tables exist
    if psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM \"User\";" > /dev/null 2>&1; then
        USER_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM \"User\";" 2>/dev/null | tr -d ' ')
        echo "👥 Users in database: $USER_COUNT"
    fi
    
else
    echo "❌ Error: Database restore failed"
    echo "❌ ERROR: Restore failed at $(date) — File: $FULL_BACKUP_PATH" >> "$LOG_FILE"
    exit 1
fi

echo "🎉 Database restore completed successfully!"