#!/bin/bash

# Sprint100 EAS Build and Submit Automation Script
# This script builds and submits the app for both iOS and Android platforms

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Sprint100 EAS Build & Submit Automation${NC}"
echo "=============================================="

# Check if EAS CLI is installed
if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ Error: npx is not installed${NC}"
    exit 1
fi

# Check if we're logged in to EAS
echo -e "${YELLOW}🔍 Checking EAS authentication...${NC}"
if ! npx eas whoami &> /dev/null; then
    echo -e "${RED}❌ Error: Not logged in to EAS${NC}"
    echo -e "${YELLOW}Please run: npx eas login${NC}"
    exit 1
fi

echo -e "${GREEN}✅ EAS authentication confirmed${NC}"

# Create build status file
BUILD_STATUS_FILE="build_status.md"
echo "# Sprint100 Build Status Report" > "$BUILD_STATUS_FILE"
echo "**Date**: $(date)" >> "$BUILD_STATUS_FILE"
echo "**Status**: Building..." >> "$BUILD_STATUS_FILE"
echo "" >> "$BUILD_STATUS_FILE"

# Function to log build results
log_build_result() {
    local platform=$1
    local status=$2
    local build_id=$3
    local url=$4
    
    echo "## $platform Build" >> "$BUILD_STATUS_FILE"
    echo "- **Status**: $status" >> "$BUILD_STATUS_FILE"
    echo "- **Build ID**: $build_id" >> "$BUILD_STATUS_FILE"
    echo "- **URL**: $url" >> "$BUILD_STATUS_FILE"
    echo "" >> "$BUILD_STATUS_FILE"
}

# Function to log submission results
log_submit_result() {
    local platform=$1
    local status=$2
    local submit_id=$3
    
    echo "## $platform Submission" >> "$BUILD_STATUS_FILE"
    echo "- **Status**: $status" >> "$BUILD_STATUS_FILE"
    echo "- **Submit ID**: $submit_id" >> "$BUILD_STATUS_FILE"
    echo "" >> "$BUILD_STATUS_FILE"
}

# Build iOS
echo -e "${BLUE}📱 Building iOS app...${NC}"
if npx eas build --platform ios --profile production --non-interactive; then
    echo -e "${GREEN}✅ iOS build completed successfully${NC}"
    # Extract build ID from output (this is a simplified approach)
    IOS_BUILD_ID=$(npx eas build:list --platform ios --limit 1 --json | jq -r '.[0].id' 2>/dev/null || echo "unknown")
    IOS_BUILD_URL=$(npx eas build:list --platform ios --limit 1 --json | jq -r '.[0].url' 2>/dev/null || echo "unknown")
    log_build_result "iOS" "✅ Success" "$IOS_BUILD_ID" "$IOS_BUILD_URL"
else
    echo -e "${RED}❌ iOS build failed${NC}"
    log_build_result "iOS" "❌ Failed" "N/A" "N/A"
fi

# Build Android
echo -e "${BLUE}🤖 Building Android app...${NC}"
if npx eas build --platform android --profile production --non-interactive; then
    echo -e "${GREEN}✅ Android build completed successfully${NC}"
    # Extract build ID from output
    ANDROID_BUILD_ID=$(npx eas build:list --platform android --limit 1 --json | jq -r '.[0].id' 2>/dev/null || echo "unknown")
    ANDROID_BUILD_URL=$(npx eas build:list --platform android --limit 1 --json | jq -r '.[0].url' 2>/dev/null || echo "unknown")
    log_build_result "Android" "✅ Success" "$ANDROID_BUILD_ID" "$ANDROID_BUILD_URL"
else
    echo -e "${RED}❌ Android build failed${NC}"
    log_build_result "Android" "❌ Failed" "N/A" "N/A"
fi

# Wait for builds to complete before submitting
echo -e "${YELLOW}⏳ Waiting for builds to complete before submission...${NC}"
echo -e "${YELLOW}💡 Note: You may need to wait for builds to finish before submission${NC}"

# Submit iOS
echo -e "${BLUE}📱 Submitting iOS app...${NC}"
if npx eas submit --platform ios --profile production --non-interactive; then
    echo -e "${GREEN}✅ iOS submission completed successfully${NC}"
    IOS_SUBMIT_ID=$(npx eas submit:list --platform ios --limit 1 --json | jq -r '.[0].id' 2>/dev/null || echo "unknown")
    log_submit_result "iOS" "✅ Success" "$IOS_SUBMIT_ID"
else
    echo -e "${RED}❌ iOS submission failed${NC}"
    log_submit_result "iOS" "❌ Failed" "N/A"
fi

# Submit Android
echo -e "${BLUE}🤖 Submitting Android app...${NC}"
if npx eas submit --platform android --profile production --non-interactive; then
    echo -e "${GREEN}✅ Android submission completed successfully${NC}"
    ANDROID_SUBMIT_ID=$(npx eas submit:list --platform android --limit 1 --json | jq -r '.[0].id' 2>/dev/null || echo "unknown")
    log_submit_result "Android" "✅ Success" "$ANDROID_SUBMIT_ID"
else
    echo -e "${RED}❌ Android submission failed${NC}"
    log_submit_result "Android" "❌ Failed" "N/A"
fi

# Final status
echo -e "${GREEN}🎉 Build and submit automation completed!${NC}"
echo -e "${YELLOW}📊 Build status report saved to: $BUILD_STATUS_FILE${NC}"

# Show recent builds
echo -e "${YELLOW}📋 Recent builds:${NC}"
npx eas build:list --limit 5

echo -e "${YELLOW}📋 Recent submissions:${NC}"
npx eas submit:list --limit 5

echo -e "${GREEN}✅ Automation complete! Check $BUILD_STATUS_FILE for detailed results.${NC}"
