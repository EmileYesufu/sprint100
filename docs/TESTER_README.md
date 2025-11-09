## Deployment Environments

- `DATABASE_URL` — Postgres connection string used by server (e.g., `postgresql://user:pass@host:port/dbname`).
- `JWT_SECRET` — Secret used to sign auth tokens; rotate by updating environment and restarting deployment.
- `ALLOWED_ORIGINS` — Comma-separated list of web origins permitted for CORS.
- Mobile builds should configure `EXPO_PUBLIC_API_URL` (or `expo.extra.API_URL`) to target staging/production servers.

Expo (development) builds rely on `client/src/config.ts` which prioritizes runtime override, Expo config, then environment variables. Update environment values before generating new builds for QA.

