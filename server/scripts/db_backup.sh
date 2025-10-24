#!/bin/bash

# Sprint100 Database Backup Script
# Creates a timestamped backup of the PostgreSQL database

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="sprint100_backup_${TIMESTAMP}.sql"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🗄️  Sprint100 Database Backup${NC}"
echo "=================================="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL environment variable is not set${NC}"
    echo "Please set DATABASE_URL before running this script:"
    echo "export DATABASE_URL='postgresql://user:password@host:port/database'"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Validate DATABASE_URL format
if [[ ! "$DATABASE_URL" =~ ^postgresql:// ]]; then
    echo -e "${RED}❌ Error: DATABASE_URL must start with 'postgresql://'${NC}"
    echo "Current format: $DATABASE_URL"
    exit 1
fi

echo -e "${YELLOW}📊 Database URL: ${DATABASE_URL}${NC}"
echo -e "${YELLOW}📁 Backup file: ${BACKUP_DIR}/${BACKUP_FILE}${NC}"

# Test database connection
echo -e "${YELLOW}🔍 Testing database connection...${NC}"
if ! psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Cannot connect to database${NC}"
    echo "Please check your DATABASE_URL and ensure the database is accessible"
    exit 1
fi

echo -e "${GREEN}✅ Database connection successful${NC}"

# Create backup
echo -e "${YELLOW}📦 Creating database backup...${NC}"
if pg_dump "$DATABASE_URL" > "$BACKUP_DIR/$BACKUP_FILE"; then
    echo -e "${GREEN}✅ Backup created successfully: ${BACKUP_DIR}/${BACKUP_FILE}${NC}"
    
    # Get backup file size
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}📊 Backup size: ${BACKUP_SIZE}${NC}"
    
    # List recent backups
    echo -e "${YELLOW}📋 Recent backups:${NC}"
    ls -la "$BACKUP_DIR"/sprint100_backup_*.sql 2>/dev/null | tail -5 || echo "No previous backups found"
    
else
    echo -e "${RED}❌ Error: Backup failed${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Database backup completed successfully!${NC}"
echo -e "${YELLOW}💡 To restore this backup, run:${NC}"
echo -e "${YELLOW}   bash scripts/db_restore.sh ${BACKUP_FILE}${NC}"
