# Manual Testing Guide - Race Threshold Feature

## ✅ Automated Checks Passed

- ✅ **TypeScript compilation**: No type errors
- ✅ **Linting**: No ESLint/TSLint errors
- ✅ **Git**: Changes committed and pushed successfully
- ✅ **Unit test assertions**: All threshold calculations verified (see `finishThreshold.test.ts`)

---

## 📱 Manual Testing Steps

### Prerequisites
```bash
# Start the client app
cd /Users/emile/sprint100-1/client
npm start

# Or use the shortcuts
cd /Users/emile/sprint100-1
./ULTRA_FAST_START.sh
```

---

## Test 1: 4-Racer Training (Threshold = 3) ⭐ PRIORITY

**Steps:**
1. Open app → Navigate to **Training** tab
2. Select configuration:
   - AI Count: **4 racers** (1 + 3 AI)
   - Difficulty: Any (e.g., Medium)
   - Personality: Any (e.g., Consistent)
3. Tap **Start Race**
4. Wait for countdown (3...2...1...Go)
5. **Tap LEFT and RIGHT alternately** (or just watch AI race)
6. **Observe carefully when 3rd racer finishes**

**Expected Results:**
- ✅ Race should **end immediately** when 3rd racer crosses 100m
- ✅ Tap buttons should **fade out** (opacity 0.3) and become unresponsive
- ✅ Message should appear: **"Race ended — top 3 finished"** (in gold/yellow text)
- ✅ Results screen should show **all 4 racers** with positions 1-4
- ✅ 4th place racer should show position, NOT stuck in "racing" state

**How to Verify Threshold Logic:**
- If you finish 1st, 2nd, or 3rd → race continues until 3rd finisher
- If you finish 4th → race ends before you cross (buttons disabled while you're still racing)

---

## Test 2: 8-Racer Training (Threshold = 4) ⭐ PRIORITY

**Steps:**
1. Training tab → Select:
   - AI Count: **8 racers** (1 + 7 AI)
   - Difficulty: Easy (so race is faster)
   - Personality: Any
2. Start race
3. Watch or tap to participate
4. **Observe when 4th racer finishes**

**Expected Results:**
- ✅ Race ends when **4th racer** crosses 100m
- ✅ Buttons disabled (faded)
- ✅ Message: **"Race ended — top 4 finished"**
- ✅ Results show all 8 racers ranked 1-8
- ✅ Positions 5-8 should display correctly even though race ended early

---

## Test 3: 2-Racer Training (No Early Finish)

**Steps:**
1. Training tab → Select:
   - AI Count: **2 racers** (1 + 1 AI)
   - Any difficulty/personality
2. Start race
3. Race until one finishes

**Expected Results:**
- ✅ Race **continues** even after 1st finisher
- ✅ Buttons remain **enabled** (no fade)
- ✅ Race only ends when **both** racers finish
- ✅ No "top N finished" message (default behavior)

---

## Test 4: Player Finishes 1st (4-Racer)

**Steps:**
1. 4-racer training, Medium difficulty
2. **Tap very fast** to finish 1st place
3. After you cross, **stop tapping**
4. Watch AI continue racing

**Expected Results:**
- ✅ After you finish 1st, race **continues**
- ✅ Buttons remain **enabled** (you can keep tapping but it doesn't matter)
- ✅ When 3rd racer finishes, race ends
- ✅ You see position #1 in results

---

## Test 5: Player Finishes Last (4-Racer)

**Steps:**
1. 4-racer training, Hard difficulty
2. **Don't tap** (or tap slowly)
3. Let 3 AI finish before you

**Expected Results:**
- ✅ When 3rd AI finishes, race ends **immediately**
- ✅ Buttons become **disabled while you're still racing**
- ✅ Your progress stops updating
- ✅ Message: "Race ended — top 3 finished"
- ✅ Results show you in **4th place**

---

## Test 6: UI/UX Verification

**Check disabled button state:**
1. Start any 4-racer training
2. When threshold reached (3 finish):
   - ✅ LEFT button: opacity ~0.3, no visual feedback on tap
   - ✅ RIGHT button: opacity ~0.3, no visual feedback on tap
   - ✅ Text inside buttons: faded/grayed
   - ✅ Tapping buttons does nothing (no response)

**Check message appearance:**
- ✅ Text: "Race ended — top 3 finished" (or "top 4" for 8-racer)
- ✅ Color: Gold/yellow (#FFD700)
- ✅ Position: Below timer, centered
- ✅ Font: Bold, size ~14

---

## Test 7: Quit During Local End

**Steps:**
1. Start 4-racer training
2. Let 3 racers finish (race ends locally)
3. Before results screen, tap **✕ Quit** button (top-right)

**Expected Results:**
- ✅ Confirmation dialog: "Quit Race?"
- ✅ Tap "Quit" → returns to Training setup screen
- ✅ Start new race → no lingering state, works normally

---

## Test 8: Replay Race (Verify No Issues)

**Steps:**
1. Complete a 4-racer training race
2. On results screen, tap **🔄 Replay** button
3. Watch replay animation

**Expected Results:**
- ✅ Replay shows entire race history
- ✅ No early finish during replay (shows full race)
- ✅ Replay completes normally

---

## Test 9: Online Race - 2 Player (No Threshold)

**Steps:**
1. Navigate to **Online** tab
2. Tap "Enter Queue"
3. Wait for match (or use second device/account)
4. Race against 1 opponent

**Expected Results:**
- ✅ Race uses **existing behavior** (no threshold)
- ✅ No "top N finished" message
- ✅ Race ends when server sends `match_end`
- ✅ Server result shown immediately
- ✅ ELO updated correctly

**Note:** This verifies we didn't break existing 1v1 online races.

---

## Test 10: Visual Regression Check

**Before/After Comparison:**

**Training Setup Screen:**
- ✅ No visual changes

**Training Race Screen (before threshold):**
- ✅ No visual changes
- ✅ Buttons normal, timer visible

**Training Race Screen (after threshold):**
- ✅ NEW: Buttons faded (opacity 0.3)
- ✅ NEW: Gold message below timer
- ✅ Progress bars frozen at current positions

**Results Screen:**
- ✅ No visual changes
- ✅ Shows all racers correctly

---

## 🐛 Known Limitations (Expected Behavior)

1. **Online 4+ player races:**
   - Client shows local overlay when threshold met
   - Must wait for server `match_end` event
   - Server may take longer than client threshold
   - This is **correct** - server is authoritative

2. **Replay mode:**
   - Uses recorded step history
   - Shows full race regardless of threshold
   - This is **correct** - replays show complete data

3. **6-racer or 10-racer races:**
   - No early finish (threshold = total racers)
   - Race ends when all finish
   - This is **correct** - only 4 and 8 have custom thresholds

---

## ✅ Success Criteria

All tests should pass with these results:
- ✅ 4-racer ends at 3 finishers
- ✅ 8-racer ends at 4 finishers
- ✅ 2-racer ends only when both finish
- ✅ Buttons disabled correctly (visual + functional)
- ✅ Messages display properly
- ✅ Results show all racers ranked
- ✅ Quit works during local end
- ✅ No regression in existing flows

---

## 🔧 If Issues Found

**Issue**: Race doesn't end at threshold
- Check: `client/src/hooks/useTraining.ts` line ~184
- Verify: `hasReachedThreshold()` is called
- Debug: Add `console.log(finishedCount, threshold)` before check

**Issue**: Buttons still active after threshold
- Check: `client/src/screens/Training/TrainingRaceScreen.tsx` line ~90
- Verify: `isLocallyEnded` condition in `handleTap()`
- Debug: Add `console.log('isLocallyEnded:', isLocallyEnded)`

**Issue**: Message not showing
- Check: `TrainingRaceScreen.tsx` line ~246
- Verify: Conditional render logic
- Debug: Check if `localEndResult` is populated

**Issue**: Wrong threshold number
- Check: `client/src/utils/finishThreshold.ts` line ~20
- Verify: `thresholdMap` values are correct (4→3, 8→4)

---

## 📊 Testing Checklist

Copy this checklist and mark as you test:

- [ ] Test 1: 4-racer training (threshold = 3)
- [ ] Test 2: 8-racer training (threshold = 4)
- [ ] Test 3: 2-racer training (no threshold)
- [ ] Test 4: Player finishes 1st
- [ ] Test 5: Player finishes last
- [ ] Test 6: UI disabled states
- [ ] Test 7: Quit during local end
- [ ] Test 8: Replay race
- [ ] Test 9: Online 2-player (no regression)
- [ ] Test 10: Visual regression check

---

**Testing Time Estimate:** 15-20 minutes for full suite

**Ready to test!** 🚀

