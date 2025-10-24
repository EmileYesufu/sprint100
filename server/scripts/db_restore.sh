#!/bin/bash

# Sprint100 Database Restore Script
# Restores a PostgreSQL database from a backup file

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔄 Sprint100 Database Restore${NC}"
echo "=================================="

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: No backup file specified${NC}"
    echo "Usage: $0 <backup_file>"
    echo ""
    echo "Available backup files:"
    ls -la "$BACKUP_DIR"/sprint100_backup_*.sql 2>/dev/null || echo "No backup files found"
    exit 1
fi

BACKUP_FILE="$1"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL environment variable is not set${NC}"
    echo "Please set DATABASE_URL before running this script:"
    echo "export DATABASE_URL='postgresql://user:password@host:port/database'"
    exit 1
fi

# Validate DATABASE_URL format
if [[ ! "$DATABASE_URL" =~ ^postgresql:// ]]; then
    echo -e "${RED}❌ Error: DATABASE_URL must start with 'postgresql://'${NC}"
    echo "Current format: $DATABASE_URL"
    exit 1
fi

# Check if backup file exists
if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Error: Backup file not found: ${BACKUP_DIR}/${BACKUP_FILE}${NC}"
    echo "Available backup files:"
    ls -la "$BACKUP_DIR"/sprint100_backup_*.sql 2>/dev/null || echo "No backup files found"
    exit 1
fi

echo -e "${YELLOW}📊 Database URL: ${DATABASE_URL}${NC}"
echo -e "${YELLOW}📁 Backup file: ${BACKUP_DIR}/${BACKUP_FILE}${NC}"

# Get backup file size
BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
echo -e "${YELLOW}📊 Backup size: ${BACKUP_SIZE}${NC}"

# Test database connection
echo -e "${YELLOW}🔍 Testing database connection...${NC}"
if ! psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Cannot connect to database${NC}"
    echo "Please check your DATABASE_URL and ensure the database is accessible"
    exit 1
fi

echo -e "${GREEN}✅ Database connection successful${NC}"

# Warning about data loss
echo -e "${RED}⚠️  WARNING: This will replace all data in the target database!${NC}"
echo -e "${YELLOW}Are you sure you want to continue? (y/N)${NC}"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}❌ Restore cancelled${NC}"
    exit 0
fi

# Create a backup of current database before restore
echo -e "${YELLOW}📦 Creating safety backup of current database...${NC}"
SAFETY_BACKUP="safety_backup_$(date +%Y%m%d_%H%M%S).sql"
if pg_dump "$DATABASE_URL" > "$BACKUP_DIR/$SAFETY_BACKUP"; then
    echo -e "${GREEN}✅ Safety backup created: ${SAFETY_BACKUP}${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Could not create safety backup${NC}"
fi

# Restore database
echo -e "${YELLOW}🔄 Restoring database from backup...${NC}"
if psql "$DATABASE_URL" < "$BACKUP_DIR/$BACKUP_FILE"; then
    echo -e "${GREEN}✅ Database restored successfully!${NC}"
    
    # Verify restore by checking table count
    echo -e "${YELLOW}🔍 Verifying restore...${NC}"
    TABLE_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
    echo -e "${GREEN}📊 Tables in database: ${TABLE_COUNT}${NC}"
    
    # Check if Sprint100 tables exist
    if psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM \"User\";" > /dev/null 2>&1; then
        USER_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM \"User\";" 2>/dev/null | tr -d ' ')
        echo -e "${GREEN}👥 Users in database: ${USER_COUNT}${NC}"
    fi
    
    if psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM \"Match\";" > /dev/null 2>&1; then
        MATCH_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM \"Match\";" 2>/dev/null | tr -d ' ')
        echo -e "${GREEN}🏁 Matches in database: ${MATCH_COUNT}${NC}"
    fi
    
else
    echo -e "${RED}❌ Error: Database restore failed${NC}"
    echo -e "${YELLOW}💡 You can restore the safety backup with:${NC}"
    echo -e "${YELLOW}   bash scripts/db_restore.sh ${SAFETY_BACKUP}${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Database restore completed successfully!${NC}"
echo -e "${YELLOW}💡 Next steps:${NC}"
echo -e "${YELLOW}   1. Run 'npx prisma generate' to update Prisma client${NC}"
echo -e "${YELLOW}   2. Test the application to ensure everything works${NC}"
echo -e "${YELLOW}   3. Run 'npm run dev' to start the server${NC}"
