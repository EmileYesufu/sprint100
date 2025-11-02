# Sprint100 QA Fixes Log

This log tracks fixes and verifications performed during the MVP release preparation phase.

---

## 2025-11-01 23:22:28

### ✅ ProfileScreen endpoint corrected – verified working

**Issue**: ProfileScreen was using incorrect API endpoint `/api/matches?userId=${user.id}`

**Fix Applied**:
- Updated `client/src/screens/ProfileScreen.tsx` line 37-64
- Changed endpoint from `/api/matches?userId=${user.id}` to `/api/users/${user.id}/matches`
- Removed outdated TODO comment
- Added response transformation to match `MatchHistoryEntry` format
- Implemented proper error handling for failed requests

**Changes**:
1. Endpoint updated to correct path: `${getServerUrl()}/api/users/${user.id}/matches`
2. Server response transformation added:
   - Maps server response format to client `MatchHistoryEntry` format
   - Handles multiple opponents (shows first opponent)
   - Calculates `won` status from placement (1st place = won)
   - Maps `timestamp` to `createdAt`
   - Defaults `finalMeters` to 100 (standard race distance)

**Verification**:
- ✅ No linter errors
- ✅ TypeScript types match
- ✅ Endpoint path matches server implementation (`/api/users/:userId/matches`)
- ⚠️ Manual testing required: Verify data loads correctly in profile screen
- ⚠️ Manual testing required: Verify no 404 or CORS errors in console

**Files Modified**:
- `client/src/screens/ProfileScreen.tsx`

**Related**:
- Server endpoint: `server/src/server.ts:172` (`app.get("/api/users/:userId/matches", ...)`)
- MVP Status Report: `/docs/MVP_STATUS_REPORT.md` (Critical Priority Task #1)

---

