# Clear Old Credentials

Your database has been reset with the new `username` field. Old JWT tokens are invalid.

## Steps to fix the "user not found" error:

1. **In your running app on the simulator:**
   - Tap the **Settings** tab (bottom navigation)
   - Tap the **Logout** button
   
2. **Sign up with a new account:**
   - Tap **Register**
   - Enter email, **username** (new field!), and password
   - Tap **Sign Up**

3. **Or login with an existing account:**
   - If you just created a new account after the database reset
   - Use the credentials from that signup

## Why this happened:

- The database schema was updated to add the `username` field
- Old users in the database didn't have usernames
- Old JWT tokens didn't include the username field
- The server couldn't authenticate with the old tokens

## What was fixed:

- Database recreated fresh with username field from the start
- New signups/logins will now include username in the JWT
- Socket authentication will work correctly with the new tokens

## Test:

After logging in with the new account:
- You should see "Socket connected" in the Metro logs
- No "user not found" errors
- Queue/challenges should work normally

