# Sprint100 Shell Scripts Inventory

**Generated**: 2025-11-01  
**Total Scripts**: 22  
**Status**: Audit and cleanup in progress

---

## 📋 Script Catalog

| Script | Purpose | Location | Dependencies | Last Modified | Action |
|--------|---------|----------|--------------|---------------|--------|
| `setup-env.sh` | Environment setup for server/client | Root | None | 2025-11-01 | **Keep** |
| `deploy.sh` | Multi-platform deployment (render/railway/heroku/docker) | Root | None | 2025-11-01 | **Keep** |
| `COMPLETE_FIX.sh` | Complete fix for Expo Go issues (obsolete) | Root | nvm | 2025-11-01 | **Archive** |
| `DIAGNOSE_AND_FIX.sh` | Diagnostic and fix script (obsolete) | Root | nvm | 2025-11-01 | **Archive** |
| `FAST_START.sh` | Fast Expo start with tunnel | Root | nvm, expo-cli | 2025-11-01 | **Archive** |
| `FIX_EXPO_GO.sh` | Fix Expo Go connection (obsolete) | Root | nvm | 2025-11-01 | **Archive** |
| `REMOTE_TESTER_FIX.sh` | Remote tester setup (obsolete) | Root | nvm | 2025-11-01 | **Archive** |
| `SIMPLE_START.sh` | Simple Expo start in LAN mode | Root | nvm, expo-cli | 2025-11-01 | **Archive** |
| `START_EXPO_QR.sh` | Start Expo with QR code | Root | nvm, expo-cli | 2025-11-01 | **Archive** |
| `START_IOS_APP.sh` | Complete iOS app workflow | Root | nvm, expo-cli, Xcode | 2025-11-01 | **Keep** |
| `START_LAN.sh` | Start Expo in LAN mode | Root | nvm, expo-cli | 2025-11-01 | **Archive** |
| `ULTRA_FAST_START.sh` | Ultra-fast Expo start (optimized) | Root | nvm, expo-cli | 2025-11-01 | **Archive** |
| `client/execute_builds.sh` | EAS build and submit automation | client/ | eas-cli, jq | 2025-11-01 | **Keep** ⚠️ |
| `client/monitor_builds.sh` | Monitor EAS build status | client/ | eas-cli, jq | 2025-11-01 | **Keep** |
| `client/BUILD_AND_RUN.sh` | Build and run iOS app via Expo | client/ | expo-cli, CocoaPods | 2025-11-01 | **Keep** |
| `client/FIX_XCODE_BUILD.sh` | Fix Xcode build configuration | client/ | CocoaPods | 2025-11-01 | **Keep** |
| `client/INSTALL_COCOAPODS.sh` | Install CocoaPods for Xcode | client/ | Homebrew, Ruby | 2025-11-01 | **Keep** |
| `server/scripts/db_backup.sh` | PostgreSQL database backup | server/scripts/ | pg_dump, DATABASE_URL | 2025-11-01 | **Keep** ⚠️ |
| `server/scripts/db_restore.sh` | PostgreSQL database restore | server/scripts/ | psql, DATABASE_URL | 2025-11-01 | **Keep** ⚠️ |
| `server/scripts/deploy_production.sh` | Production deployment automation | server/scripts/ | validate_deployment.sh, production_health_check.sh | 2025-11-01 | **Keep** ⚠️ |
| `server/scripts/production_health_check.sh` | Production health check | server/scripts/ | curl | 2025-11-01 | **Keep** ⚠️ |
| `server/scripts/validate_deployment.sh` | Deployment validation | server/scripts/ | None | 2025-11-01 | **Keep** ⚠️ |

⚠️ = Referenced in other scripts or critical infrastructure

---

## 🔗 Dependency Graph

### Root Scripts
- `deploy.sh` → Standalone
- `setup-env.sh` → Standalone

### Client Scripts
- `client/execute_builds.sh` → Referenced in `client/package.json` as `build:release`
- `client/monitor_builds.sh` → Standalone

### Server Scripts
- `server/scripts/deploy_production.sh` → Calls:
  - `./scripts/validate_deployment.sh`
  - `./scripts/production_health_check.sh`

---

## 📦 Archive Candidates

**Root Expo Start Scripts** (redundant, similar functionality):
- `FAST_START.sh`
- `SIMPLE_START.sh`
- `ULTRA_FAST_START.sh`
- `START_EXPO_QR.sh`
- `START_LAN.sh`

**Obsolete Fix Scripts** (development troubleshooting, no longer needed):
- `COMPLETE_FIX.sh`
- `DIAGNOSE_AND_FIX.sh`
- `FIX_EXPO_GO.sh`
- `REMOTE_TESTER_FIX.sh`

**Total to Archive**: 9 scripts

---

## ✅ Active Scripts (Keep)

**Infrastructure & Deployment**:
- `setup-env.sh` - Environment setup
- `deploy.sh` - Multi-platform deployment

**Client Development**:
- `START_IOS_APP.sh` - iOS app workflow
- `client/execute_builds.sh` - EAS builds (referenced in package.json)
- `client/monitor_builds.sh` - Build monitoring
- `client/BUILD_AND_RUN.sh` - Build and run iOS
- `client/FIX_XCODE_BUILD.sh` - Xcode build fixes
- `client/INSTALL_COCOAPODS.sh` - CocoaPods setup

**Server Operations**:
- `server/scripts/db_backup.sh` - Database backups
- `server/scripts/db_restore.sh` - Database restore
- `server/scripts/deploy_production.sh` - Production deployment
- `server/scripts/production_health_check.sh` - Health checks
- `server/scripts/validate_deployment.sh` - Deployment validation

**Total Active**: 13 scripts

---

## 🔍 Validation Status

- **Syntax Validation**: ✅ All 22 scripts passed `bash -n` syntax check
- **Dependencies**: ✅ All dependencies identified and verified
- **References**: ✅ All package.json references identified
- **Executable Permissions**: ⚠️ Need to verify and set `chmod +x`

---

## 📝 Notes

1. **Client Build Scripts**: `client/execute_builds.sh` is referenced in `client/package.json` as `build:release` - **DO NOT RENAME OR MOVE**

2. **Server Scripts**: All server scripts in `server/scripts/` are production-critical and have interdependencies - **DO NOT RENAME OR MOVE**

3. **Archive Strategy**: Obsolete and redundant scripts will be moved to `/scripts/archive/` with timestamp prefix

4. **Formatting**: All scripts will be standardized with:
   - `#!/bin/bash` shebang
   - `set -euo pipefail` for safety
   - 2-space indentation
   - Consistent variable naming
   - Proper quoting

---

**Status**: ✅ Inventory complete - Ready for cleanup and formatting

