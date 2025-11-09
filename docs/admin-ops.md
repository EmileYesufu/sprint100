# Admin Operations

## Superuser Provisioning

Run this once per environment to ensure an administrator account exists.

1. Set credentials in the environment (override the defaults as needed):
   ```
   SUPERUSER_EMAIL=admin@sprint100.app
   SUPERUSER_PASSWORD=YourStrongSecurePassword!
   ```
   These values are documented in `server/env.production`.

2. Execute the provisioning script from the `server` directory:
   ```
   NODE_ENV=production npx tsx scripts/createSuperuser.ts
   ```

3. Confirm the script outputs `✅ Superuser ensured: <email>`.

4. Log in with the seeded credentials inside the app to verify the admin role.

This script is intended as a one-time bootstrap step. After the superuser is created, disable or remove the credentials from the environment to reduce risk. Use standard user-management flows for ongoing administration.


