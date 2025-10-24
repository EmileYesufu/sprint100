#!/bin/bash

# Sprint100 Build Status Monitor
# Monitors EAS builds and submissions, generates status reports

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}📊 Sprint100 Build Status Monitor${NC}"
echo "====================================="

# Check if EAS CLI is available
if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ Error: npx is not installed${NC}"
    exit 1
fi

# Check if we're logged in to EAS
if ! npx eas whoami &> /dev/null; then
    echo -e "${RED}❌ Error: Not logged in to EAS${NC}"
    echo -e "${YELLOW}Please run: npx eas login${NC}"
    exit 1
fi

echo -e "${GREEN}✅ EAS authentication confirmed${NC}"

# Create/update build status file
BUILD_STATUS_FILE="build_status.md"
TIMESTAMP=$(date)

echo "# Sprint100 Build Status Report" > "$BUILD_STATUS_FILE"
echo "**Date**: $TIMESTAMP" >> "$BUILD_STATUS_FILE"
echo "**Status**: 📊 **Monitoring Active**" >> "$BUILD_STATUS_FILE"
echo "" >> "$BUILD_STATUS_FILE"

# Function to get build status
get_build_status() {
    local platform=$1
    local limit=${2:-5}
    
    echo "## $platform Builds" >> "$BUILD_STATUS_FILE"
    echo "" >> "$BUILD_STATUS_FILE"
    
    # Get recent builds for platform
    if npx eas build:list --platform "$platform" --limit "$limit" --json > /tmp/builds_${platform}.json 2>/dev/null; then
        # Parse and format build information
        jq -r '.[] | "- **Build ID**: " + .id + " | **Status**: " + .status + " | **Created**: " + .createdAt + " | **URL**: " + (.url // "N/A")' /tmp/builds_${platform}.json >> "$BUILD_STATUS_FILE" 2>/dev/null || echo "- No builds found" >> "$BUILD_STATUS_FILE"
    else
        echo "- No builds found or error retrieving builds" >> "$BUILD_STATUS_FILE"
    fi
    
    echo "" >> "$BUILD_STATUS_FILE"
}

# Function to get submission status
get_submit_status() {
    local platform=$1
    local limit=${2:-5}
    
    echo "## $platform Submissions" >> "$BUILD_STATUS_FILE"
    echo "" >> "$BUILD_STATUS_FILE"
    
    # Get recent submissions for platform
    if npx eas submit:list --platform "$platform" --limit "$limit" --json > /tmp/submits_${platform}.json 2>/dev/null; then
        # Parse and format submission information
        jq -r '.[] | "- **Submit ID**: " + .id + " | **Status**: " + .status + " | **Created**: " + .createdAt' /tmp/submits_${platform}.json >> "$BUILD_STATUS_FILE" 2>/dev/null || echo "- No submissions found" >> "$BUILD_STATUS_FILE"
    else
        echo "- No submissions found or error retrieving submissions" >> "$BUILD_STATUS_FILE"
    fi
    
    echo "" >> "$BUILD_STATUS_FILE"
}

# Monitor iOS builds
echo -e "${BLUE}📱 Checking iOS builds...${NC}"
get_build_status "ios" 5

# Monitor Android builds
echo -e "${BLUE}🤖 Checking Android builds...${NC}"
get_build_status "android" 5

# Monitor iOS submissions
echo -e "${BLUE}📱 Checking iOS submissions...${NC}"
get_submit_status "ios" 5

# Monitor Android submissions
echo -e "${BLUE}🤖 Checking Android submissions...${NC}"
get_submit_status "android" 5

# Add summary section
echo "## Build Summary" >> "$BUILD_STATUS_FILE"
echo "" >> "$BUILD_STATUS_FILE"

# Count builds by status
echo "### Build Statistics" >> "$BUILD_STATUS_FILE"
echo "" >> "$BUILD_STATUS_FILE"

# Get overall build statistics
if npx eas build:list --limit 20 --json > /tmp/all_builds.json 2>/dev/null; then
    TOTAL_BUILDS=$(jq '. | length' /tmp/all_builds.json 2>/dev/null || echo "0")
    echo "- **Total Recent Builds**: $TOTAL_BUILDS" >> "$BUILD_STATUS_FILE"
    
    # Count by status
    FINISHED_BUILDS=$(jq '[.[] | select(.status == "finished")] | length' /tmp/all_builds.json 2>/dev/null || echo "0")
    ERROR_BUILDS=$(jq '[.[] | select(.status == "errored")] | length' /tmp/all_builds.json 2>/dev/null || echo "0")
    IN_PROGRESS_BUILDS=$(jq '[.[] | select(.status == "in-progress")] | length' /tmp/all_builds.json 2>/dev/null || echo "0")
    
    echo "- **Finished Builds**: $FINISHED_BUILDS" >> "$BUILD_STATUS_FILE"
    echo "- **Error Builds**: $ERROR_BUILDS" >> "$BUILD_STATUS_FILE"
    echo "- **In Progress**: $IN_PROGRESS_BUILDS" >> "$BUILD_STATUS_FILE"
else
    echo "- **Error**: Could not retrieve build statistics" >> "$BUILD_STATUS_FILE"
fi

echo "" >> "$BUILD_STATUS_FILE"

# Add monitoring commands
echo "## Monitoring Commands" >> "$BUILD_STATUS_FILE"
echo "" >> "$BUILD_STATUS_FILE"
echo "### Check Build Status" >> "$BUILD_STATUS_FILE"
echo "\`\`\`bash" >> "$BUILD_STATUS_FILE"
echo "# List recent builds" >> "$BUILD_STATUS_FILE"
echo "npx eas build:list" >> "$BUILD_STATUS_FILE"
echo "" >> "$BUILD_STATUS_FILE"
echo "# List recent submissions" >> "$BUILD_STATUS_FILE"
echo "npx eas submit:list" >> "$BUILD_STATUS_FILE"
echo "" >> "$BUILD_STATUS_FILE"
echo "# Check specific build" >> "$BUILD_STATUS_FILE"
echo "npx eas build:view <build-id>" >> "$BUILD_STATUS_FILE"
echo "\`\`\`" >> "$BUILD_STATUS_FILE"
echo "" >> "$BUILD_STATUS_FILE"

# Add footer
echo "---" >> "$BUILD_STATUS_FILE"
echo "" >> "$BUILD_STATUS_FILE"
echo "**Report Generated**: $TIMESTAMP" >> "$BUILD_STATUS_FILE"
echo "**Status**: 📊 **Monitoring Complete**" >> "$BUILD_STATUS_FILE"

# Display summary
echo -e "${GREEN}✅ Build status monitoring completed!${NC}"
echo -e "${YELLOW}📊 Status report saved to: $BUILD_STATUS_FILE${NC}"

# Show recent builds in terminal
echo -e "${YELLOW}📋 Recent builds:${NC}"
npx eas build:list --limit 5

echo -e "${YELLOW}📋 Recent submissions:${NC}"
npx eas submit:list --limit 5

echo -e "${GREEN}🎉 Monitoring complete! Check $BUILD_STATUS_FILE for detailed results.${NC}"
