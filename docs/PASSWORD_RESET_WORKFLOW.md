# Password Reset Workflow

The password reset process issues single-use, time-limited tokens stored in the database so players can recover access without developer intervention.

1. **Request** – `POST /api/auth/forgot`
   - Accepts an email address, always returns a generic success response.
   - When a user exists, previous tokens are revoked and a new token (hashed in storage) is generated with a 30-minute expiry.
   - A provider-agnostic mailer logs the reset link in non-production environments for easy testing.

2. **Reset** – `POST /api/auth/reset`
   - Validates the token and new password strength.
   - Consumes the token within a transaction, updates the user password, and invalidates other outstanding tokens.
   - Returns unified error payloads (`invalid_or_expired_token`, `invalid_password`) so the client can react consistently.

The default reset link format is driven by `APP_RESET_URL`; deep-link schemes like `app://reset` are supported, with query param fallbacks for web contexts.

## Recovery Guarantees

- Tokens cannot be reused once consumed or after expiry.
- Restarting the server will not invalidate outstanding tokens because they are persisted in the `PasswordResetToken` table.
- All failure cases return the same error envelope, reducing ambiguity for the client.

See `server/src/services/passwordResetService.ts` and `client/src/screens/Auth/ResetPasswordScreen.tsx` for implementation details.
