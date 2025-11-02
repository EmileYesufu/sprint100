# Race Finish Threshold Implementation

## Overview

This implementation adds **early finish threshold logic** to both training and online races:
- **4-racer races** end when **top 3** finish
- **8-racer races** end when **top 4** finish  
- All other racer counts use default behavior (all must finish)

## Architecture

### Client-Side Only Changes
- ✅ No server code modified
- ✅ No database schema changes
- ✅ No online match creation logic changed
- ✅ Server remains authoritative for online matches

### Files Modified/Created

1. **`client/src/utils/finishThreshold.ts`** (NEW)
   - `computeFinishThreshold(totalRacers)` - Maps racer count to threshold
   - `hasReachedThreshold(finishedCount, totalRacers)` - Checks if threshold met
   - Configurable mapping: easy to adjust thresholds in future

2. **`client/src/types.ts`** (UPDATED)
   - Added `LocalEndResult` interface for local end state
   - Added `RaceControlFlags` interface for managing end states

3. **`client/src/hooks/useTraining.ts`** (UPDATED)
   - Added `isLocallyEnded` and `localEndResult` state
   - Added `markLocalRaceEnded()` function
   - Modified `updateLoop()` to check threshold and trigger local end
   - Modified `tap()` to disable when locally ended
   - Updated `reset()` and `abort()` to clear local end state
   - **For training: local end is FINAL** (no server reconciliation)

4. **`client/src/screens/Training/TrainingRaceScreen.tsx`** (UPDATED)
   - Destructure `isLocallyEnded` and `localEndResult` from hook
   - Block taps when `isLocallyEnded` is true
   - Show "Race ended — top N finished" message
   - Render buttons with disabled visual state (opacity 0.3)

5. **`client/src/screens/Race/RaceScreen.tsx`** (UPDATED)
   - Added local end tracking state
   - Track finished players via `finishedPlayers` ref
   - Check threshold in `race_update` handler
   - Show **local overlay** when threshold met (before server confirms)
   - Show **server overlay** when `match_end` received (authoritative)
   - Display "Waiting for official results..." during local end
   - Display "Official results updated" when server result replaces local
   - Disable taps when locally ended
   - **Server result always wins** - no client-side ELO calculation

## Behavior Details

### Training Mode (Offline)
1. Race starts with N racers (player + AIs)
2. As racers finish, positions are assigned immutably
3. When `finishOrder.length >= threshold`:
   - `markLocalRaceEnded()` called
   - Taps disabled immediately
   - "Race ended — top N finished" message shown
   - Race proceeds to finish screen after brief delay
4. **Local end is FINAL** - no server reconciliation needed

### Online Mode
1. Race starts with N players
2. Server sends `race_update` events with player meters
3. Client tracks who has crossed 100m line
4. When threshold reached:
   - Set `isLocallyEnded = true`
   - Show local overlay: "Race ended — top N finished. Waiting for official results..."
   - Disable tap buttons (opacity 0.3, no interaction)
   - Continue listening for server events
5. When server sends `match_end`:
   - Set `serverResultReceived = true`
   - Replace local overlay with server result
   - Show "Official results updated" if local end had triggered
   - Display server-calculated ELO deltas
   - Navigate back to queue after 3 seconds
6. **Server result is authoritative** - client never calculates ELO

## Edge Cases Handled

### 1. Server Result Conflicts with Local
- **Scenario**: Client thinks Player A finished 1st, but server says Player B won
- **Handling**: Server result replaces local state entirely, shows "Official results updated"

### 2. Threshold Not Applicable (e.g., 2 or 6 racers)
- **Behavior**: `computeFinishThreshold()` returns `totalRacers` (all must finish)
- **Result**: No early finish, existing behavior preserved

### 3. Race Quit/Abort During Local End
- **Training**: `abort()` clears `isLocallyEnded` and `localEndResult`
- **Online**: Server handles disconnect, client state cleaned up

### 4. Replay Mode
- **Training**: Replay ignores local end logic (uses recorded step history)
- **Online**: N/A (no replay in online mode)

## Testing Checklist

### ✅ Training Mode Tests

#### Test 1: 4-Racer Training (Threshold = 3)
- [ ] Start training with 4 racers (player + 3 AI)
- [ ] Race until 3 racers finish
- [ ] **Expected**: Race ends immediately, taps disabled
- [ ] **Expected**: Message shows "Race ended — top 3 finished"
- [ ] **Expected**: Results screen shows all 4 racers with positions
- [ ] **Verify**: 4th place racer shows "finished" or position, not stuck "racing"

#### Test 2: 8-Racer Training (Threshold = 4)
- [ ] Start training with 8 racers (player + 7 AI)
- [ ] Race until 4 racers finish
- [ ] **Expected**: Race ends immediately, taps disabled
- [ ] **Expected**: Message shows "Race ended — top 4 finished"
- [ ] **Expected**: Results show all 8 racers ranked

#### Test 3: 2-Racer Training (No Threshold)
- [ ] Start training with 2 racers (player + 1 AI)
- [ ] Race until 1 finishes
- [ ] **Expected**: Race continues (threshold = 2, not met)
- [ ] **Expected**: Race ends only when both finish

#### Test 4: Player Finishes Outside Threshold
- [ ] Start 4-racer training
- [ ] Let 3 AI finish first (player finishes 4th)
- [ ] **Expected**: Race ends when AI #3 finishes
- [ ] **Expected**: Player sees disabled buttons
- [ ] **Expected**: Results show player in 4th place

#### Test 5: Player Finishes Inside Threshold
- [ ] Start 4-racer training
- [ ] Player finishes 1st or 2nd
- [ ] **Expected**: Race continues until 3rd finisher crosses
- [ ] **Expected**: Player sees disabled buttons after 3rd crosses

### ✅ Online Mode Tests

#### Test 6: 2-Player Online (No Threshold, Existing Behavior)
- [ ] Queue for online match
- [ ] Race with 1 opponent
- [ ] **Expected**: Race ends when winner crosses line (server decides)
- [ ] **Expected**: No local early finish overlay
- [ ] **Expected**: Server result shown immediately

#### Test 7: 4-Player Online (Threshold = 3)
*Requires 4 devices/accounts*
- [ ] 4 players join queue
- [ ] Race until 3 players finish
- [ ] **Expected**: All clients show local overlay "Race ended — top 3 finished"
- [ ] **Expected**: Tap buttons disabled for all players
- [ ] **Expected**: Clients wait for server `match_end` event
- [ ] **Expected**: Server result replaces local overlay
- [ ] **Expected**: Subtitle shows "Official results updated"

#### Test 8: 8-Player Online (Threshold = 4)
*Requires 8 devices/accounts*
- [ ] 8 players join queue
- [ ] Race until 4 players finish
- [ ] **Expected**: All clients show local overlay "Race ended — top 4 finished"
- [ ] **Expected**: Tap buttons disabled
- [ ] **Expected**: Server sends `match_end` after all finish or threshold logic (server-side)
- [ ] **Expected**: Client shows server result

#### Test 9: Server Result Differs from Local
*Simulated test with network manipulation*
- [ ] Start 4-player race
- [ ] Client thinks Player A, B, C finished 1-2-3
- [ ] Server sends different order (due to latency/tap timing)
- [ ] **Expected**: Server result displayed, client accepts it
- [ ] **Expected**: Subtitle shows "Official results updated"
- [ ] **Expected**: ELO changes reflect server calculation

#### Test 10: Disconnect Before Server Result
- [ ] Start 4-player race
- [ ] Threshold reached (local overlay shown)
- [ ] Disconnect before server `match_end`
- [ ] **Expected**: Client navigates away or shows error
- [ ] **Expected**: Server still processes match
- [ ] **Expected**: Reconnect shows updated ELO in profile

### ✅ UI/UX Tests

#### Test 11: Button Disabled State
- [ ] Trigger local end (training or online)
- [ ] **Expected**: Buttons show opacity 0.3
- [ ] **Expected**: Buttons do not respond to taps
- [ ] **Expected**: No visual feedback on press

#### Test 12: Overlay Visibility
- [ ] Training: Local end shows message in progress section
- [ ] Online: Local end shows full-screen overlay
- [ ] Online: Server result replaces local overlay seamlessly
- [ ] **Expected**: No flashing or UI jank

#### Test 13: Quit During Local End
- [ ] Start training race
- [ ] Trigger local end (threshold met)
- [ ] Press quit button
- [ ] **Expected**: Confirmation dialog appears
- [ ] **Expected**: Quit returns to setup screen
- [ ] **Expected**: No lingering state on next race

## Future Enhancements

### Easy Threshold Adjustments
To change thresholds, edit `client/src/utils/finishThreshold.ts`:

```typescript
const thresholdMap: Record<number, number> = {
  4: 3,   // Change to 2 for earlier finish
  8: 4,   // Change to 5 for later finish
  10: 6,  // Add new mapping for 10-racer races
};
```

### Server-Side Threshold (Future)
To make server also end races early:
1. Copy `computeFinishThreshold()` to server
2. Modify `server/src/server.ts` match end logic
3. Check threshold in race tick handler
4. Emit `match_end` when threshold met
5. Calculate ELO for top finishers only

## Performance Notes

- **No performance impact**: Threshold check is O(1) (Set size check)
- **No network overhead**: Uses existing `race_update` events
- **No memory bloat**: `finishedPlayers` Set grows to max N players
- **Clean state management**: All state cleared on reset/abort

## Rollback Instructions

If issues arise, rollback is simple:

1. Revert these 5 files to previous commit
2. Delete `client/src/utils/finishThreshold.ts`
3. Rebuild client: `cd client && npm install && npm start`

No server changes needed, no data migration required.

---

**Implementation Date**: 2025-10-09  
**Status**: ✅ Ready for Testing  
**Breaking Changes**: None (backwards compatible)

