# Sprint100 Manual Testing Guide

## 🎯 End-to-End User Flow Testing

This guide provides step-by-step instructions for manually testing the complete Sprint100 user flow from registration to race results.

## 📋 Prerequisites

### System Requirements
- Server running on `http://localhost:4000`
- Client running on Expo
- Database connected and accessible
- No rate limiting issues (wait 15 minutes between test runs)

### Test Environment
- Use a fresh browser/device for each test
- Clear browser cache between tests
- Use unique email addresses for each test

## 🧪 Test Scenarios

### Test 1: User Registration

#### Steps
1. **Open Client Application**
   - Start Expo development server
   - Scan QR code or open in simulator
   - Navigate to registration screen

2. **Register New User**
   - Enter email: `test_user_${Date.now()}@example.com`
   - Enter username: `test_user_${Date.now().toString().slice(-8)}`
   - Enter password: `TestPassword123!`
   - Click "Register"

3. **Verify Registration**
   - ✅ Should see success message
   - ✅ Should be redirected to main app
   - ✅ Username should be displayed correctly

#### Expected Results
- Registration successful
- User logged in automatically
- Profile shows correct username
- No validation errors

### Test 2: User Login

#### Steps
1. **Logout from Previous Session**
   - Find logout button/menu
   - Click logout
   - Should return to login screen

2. **Login with Credentials**
   - Enter email from registration
   - Enter password
   - Click "Login"

3. **Verify Login**
   - ✅ Should see success message
   - ✅ Should be redirected to main app
   - ✅ Profile shows correct username
   - ✅ Session persists

#### Expected Results
- Login successful
- User profile accessible
- Session maintained
- No authentication errors

### Test 3: Profile Verification

#### Steps
1. **Access Profile/Leaderboard**
   - Navigate to leaderboard or profile section
   - Look for your username in the list

2. **Verify User Data**
   - ✅ Username matches registration
   - ✅ ELO rating displayed (default 1200)
   - ✅ User statistics visible

#### Expected Results
- User found in leaderboard
- Correct username displayed
- ELO rating shown
- Profile data accurate

### Test 4: Race Queue System

#### Steps
1. **Join Race Queue**
   - Navigate to race/play section
   - Click "Join Queue" or similar button
   - Wait for queue status

2. **Verify Queue Status**
   - ✅ Should see "In Queue" status
   - ✅ Should see queue position or waiting message
   - ✅ Should be able to leave queue

3. **Test Queue Leave**
   - Click "Leave Queue" if available
   - Verify queue status updates

#### Expected Results
- Successfully joined queue
- Queue status displayed
- Can leave queue
- Real-time updates working

### Test 5: Race Execution (4-Player)

#### Steps
1. **Start Race**
   - Join queue with 4 players (or simulate)
   - Wait for race to start
   - Verify countdown begins

2. **Race Controls**
   - Test race controls (tap, hold, etc.)
   - Verify progress updates
   - Check real-time synchronization

3. **Early Finish Logic**
   - Test with 4 players
   - Verify race ends when 3 players finish
   - Check with 8 players (should end when 4 finish)

#### Expected Results
- Race starts with countdown
- Controls responsive
- Progress updates in real-time
- Early finish logic works (4→3, 8→4)
- Race ends correctly

### Test 6: Race Results and ELO

#### Steps
1. **Complete Race**
   - Finish race or wait for completion
   - View race results screen

2. **Verify Results**
   - ✅ Final placings displayed
   - ✅ ELO changes shown
   - ✅ Race statistics updated

3. **Check Leaderboard**
   - Navigate to leaderboard
   - Verify ELO rating updated
   - Check match history

#### Expected Results
- Race results displayed correctly
- ELO changes calculated properly
- Leaderboard updated
- Match history recorded

### Test 7: Session Persistence

#### Steps
1. **Close Application**
   - Close the app completely
   - Wait a few seconds

2. **Reopen Application**
   - Open the app again
   - Check if still logged in

3. **Verify Session**
   - ✅ Should still be logged in
   - ✅ Profile accessible
   - ✅ Can join races immediately

#### Expected Results
- Session persists across app restarts
- User remains logged in
- Profile data accessible
- No re-authentication required

## 🔍 Visual Issues to Check

### UI/UX Issues
1. **Loading States**
   - Are loading indicators shown?
   - Are loading times reasonable?
   - Is feedback provided during operations?

2. **Error Handling**
   - Are error messages clear?
   - Are validation errors helpful?
   - Is error recovery possible?

3. **Navigation**
   - Is navigation intuitive?
   - Are buttons clearly labeled?
   - Is the flow logical?

4. **Responsiveness**
   - Does the app work on different screen sizes?
   - Are controls easy to use?
   - Is text readable?

### Race-Specific Issues
1. **Race Controls**
   - Are controls responsive?
   - Is feedback immediate?
   - Are controls intuitive?

2. **Real-time Updates**
   - Are updates smooth?
   - Is synchronization accurate?
   - Are there any delays?

3. **Race End Logic**
   - Does early finish work correctly?
   - Are final placings accurate?
   - Is the transition smooth?

## 📊 Test Results Documentation

### For Each Test
1. **Record Results**
   - ✅ Pass / ❌ Fail / ⚠️ Partial
   - Screenshot if visual issue
   - Error message if failure
   - Time taken for operation

2. **Note Issues**
   - Description of problem
   - Steps to reproduce
   - Severity (High/Medium/Low)
   - Suggested fix

3. **Performance Notes**
   - Response times
   - Loading times
   - Smoothness of animations
   - Memory usage

## 🎯 Success Criteria

### Complete User Flow
- ✅ User can register successfully
- ✅ User can login and logout
- ✅ Profile displays correctly
- ✅ User can join race queue
- ✅ Race executes properly
- ✅ Results are calculated correctly
- ✅ ELO changes are applied
- ✅ Session persists across app restarts

### Performance Criteria
- ✅ Registration/login < 2 seconds
- ✅ Race queue join < 1 second
- ✅ Race start < 3 seconds
- ✅ Real-time updates < 100ms delay
- ✅ Results display < 1 second

### Quality Criteria
- ✅ No crashes or freezes
- ✅ Clear error messages
- ✅ Intuitive user interface
- ✅ Smooth animations
- ✅ Responsive controls

## 📞 Reporting Issues

### Issue Template
```
**Issue**: [Brief description]
**Severity**: High/Medium/Low
**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result**: [What should happen]
**Actual Result**: [What actually happened]
**Screenshot**: [If applicable]
**Device/OS**: [If applicable]
```

### Priority Levels
- **High**: Blocks core functionality
- **Medium**: Affects user experience
- **Low**: Minor visual or text issues

---

**Manual testing guide completed**: 2025-10-24  
**Status**: ✅ **READY FOR MANUAL TESTING**
