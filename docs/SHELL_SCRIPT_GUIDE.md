# ⚙️ Sprint100 Shell Script Reference

**Last Updated**: 2025-11-01  
**Total Active Scripts**: 13

---

## 📁 Active Scripts

| Script | Purpose | Key Dependencies | Example Command |
|--------|---------|------------------|-----------------|
| `setup-env.sh` | Environment setup for server/client | npm, .env.example files | `./setup-env.sh` |
| `deploy.sh` | Multi-platform deployment | npm, git, platform CLIs | `./deploy.sh render` |
| `START_IOS_APP.sh` | Complete iOS app workflow | nvm, expo-cli, Xcode | `./START_IOS_APP.sh` |
| `client/execute_builds.sh` | EAS build and submit automation | eas-cli, jq | `cd client && ./execute_builds.sh` |
| `client/monitor_builds.sh` | Monitor EAS builds and submissions | eas-cli, jq | `cd client && ./monitor_builds.sh` |
| `client/BUILD_AND_RUN.sh` | Build and run iOS app | expo-cli, CocoaPods | `cd client && ./BUILD_AND_RUN.sh` |
| `client/FIX_XCODE_BUILD.sh` | Fix Xcode build configuration | CocoaPods | `cd client && ./FIX_XCODE_BUILD.sh` |
| `client/INSTALL_COCOAPODS.sh` | Install CocoaPods for Xcode | Homebrew, Ruby | `cd client && ./INSTALL_COCOAPODS.sh` |
| `server/scripts/db_backup.sh` | PostgreSQL database backup | pg_dump, DATABASE_URL | `cd server && ./scripts/db_backup.sh` |
| `server/scripts/db_restore.sh` | Restore database from backup | psql, DATABASE_URL | `cd server && ./scripts/db_restore.sh backup_2025-11-01.sql` |
| `server/scripts/deploy_production.sh` | Production deployment automation | validate_deployment.sh, production_health_check.sh | `cd server && ./scripts/deploy_production.sh` |
| `server/scripts/production_health_check.sh` | Production health checks | curl, jq (optional) | `cd server && ./scripts/production_health_check.sh` |
| `server/scripts/validate_deployment.sh` | Deployment validation | prisma, DATABASE_URL | `cd server && ./scripts/validate_deployment.sh` |

---

## 🔗 Script Dependencies

### Root Scripts
- **`setup-env.sh`**: Standalone
- **`deploy.sh`**: Standalone

### Client Scripts
- **`client/execute_builds.sh`**: 
  - Referenced in `client/package.json` as `build:release`
  - Dependencies: `eas-cli`, `jq`
- **`client/monitor_builds.sh`**: Standalone

### Server Scripts
- **`server/scripts/deploy_production.sh`**: 
  - Calls: `./scripts/validate_deployment.sh`
  - Calls: `./scripts/production_health_check.sh`
- **`server/scripts/db_backup.sh`**: Standalone
- **`server/scripts/db_restore.sh`**: Standalone

---

## 📋 Usage Examples

### Environment Setup
```bash
# Set up environment files for server and client
./setup-env.sh
```

### Deployment
```bash
# Deploy to Render
./deploy.sh render

# Deploy to Railway
./deploy.sh railway

# Deploy to Heroku
./deploy.sh heroku

# Deploy with Docker
./deploy.sh docker
```

### Client Builds
```bash
# Execute EAS builds (referenced in package.json)
cd client
npm run build:release  # Uses execute_builds.sh

# Monitor build status
cd client
./monitor_builds.sh

# Build and run iOS app
cd client
./BUILD_AND_RUN.sh
```

### Server Operations
```bash
# Database backup
cd server
./scripts/db_backup.sh

# Database restore
cd server
./scripts/db_restore.sh backup_2025-11-01_12-30.sql

# Production deployment
cd server
./scripts/deploy_production.sh

# Health check
cd server
./scripts/production_health_check.sh

# Validate deployment
cd server
./scripts/validate_deployment.sh
```

---

## 🗃️ Archived Scripts

The following scripts have been archived to `/scripts/archive/`:
- `COMPLETE_FIX.sh` - Complete fix for Expo Go issues (obsolete)
- `DIAGNOSE_AND_FIX.sh` - Diagnostic and fix script (obsolete)
- `FAST_START.sh` - Fast Expo start with tunnel (redundant)
- `FIX_EXPO_GO.sh` - Fix Expo Go connection (obsolete)
- `REMOTE_TESTER_FIX.sh` - Remote tester setup (obsolete)
- `SIMPLE_START.sh` - Simple Expo start in LAN mode (redundant)
- `START_EXPO_QR.sh` - Start Expo with QR code (redundant)
- `START_LAN.sh` - Start Expo in LAN mode (redundant)
- `ULTRA_FAST_START.sh` - Ultra-fast Expo start (redundant)

---

## 🧾 Notes

### Formatting Standards
- All scripts use `#!/bin/bash` shebang
- All scripts include `set -euo pipefail` for safe execution
- All scripts have standardized header comments
- All scripts have executable permissions (`chmod +x`)

### Dependencies
- **package.json references**: `client/execute_builds.sh` is referenced in `client/package.json` as `build:release` - **DO NOT RENAME OR MOVE**
- **Server script dependencies**: `server/scripts/deploy_production.sh` calls other server scripts - paths are relative and correct
- **External dependencies**: All external commands (pg_dump, eas-cli, etc.) are validated before use

### Validation
- All scripts validated with `bash -n` (syntax check) ✅
- All dependencies verified and correct ✅
- All executable permissions set ✅

---

## 🔧 Troubleshooting

### Script Not Executable
```bash
chmod +x script_name.sh
```

### Missing Dependencies
```bash
# Check if command exists
which command_name

# Install missing dependencies
npm install -g package-name
```

### Script Syntax Error
```bash
# Validate syntax
bash -n script_name.sh
```

### Database Backup/Restore Issues
```bash
# Check DATABASE_URL is set
echo $DATABASE_URL

# Verify database connection
pg_isready -d $DATABASE_URL
```

---

## 📝 Maintenance

When adding new scripts:
1. Use `#!/bin/bash` shebang
2. Include `set -euo pipefail` at the top
3. Add standardized header comments
4. Validate syntax with `bash -n script_name.sh`
5. Set executable permissions with `chmod +x script_name.sh`
6. Update this guide with script details
7. Add to `docs/SHELL_SCRIPTS_INVENTORY.md`

---

**Status**: ✅ All scripts validated and documented

