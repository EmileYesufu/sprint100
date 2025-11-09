## Environment Variables

- `DATABASE_URL`: Connection string for the Postgres instance powering matchmaking/session data.
- `JWT_SECRET`: Rotation-ready secret for auth tokens; rotate by generating new secret and restarting server with both old/new handled via dual verification if needed.
- `ALLOWED_ORIGINS`: Comma-separated list of front-end origins allowed by CORS.
- Mobile builds should embed `EXPO_PUBLIC_API_URL` (Expo/EAS) for connecting to the appropriate environment. For managed distribution, update `app.json` / `app.config.ts` and re-run builds.

## Monitoring / Observability

- `GET /health/live` — quick liveness probe (returns status + timestamp).
- `GET /health/ready` — readiness probe (checks database connectivity and counts pending queue entries).
- Wire these endpoints into your uptime provider (e.g., Pingdom, New Relic Synthetics, CloudWatch Synthetics) to alert on non-200 responses or slow response times. Poll `/health/live` frequently (e.g., every 30s) and `/health/ready` at a lower cadence (e.g., 1 min).
- Log tailing: `docker compose logs -f server` (single container) or `docker logs -f sprint100_prod_server`. For cloud providers, tail via their CLI/console equivalent (e.g., `heroku logs --tail`).

## Rollback

To roll back to a previous server image/build:

1. Identify the previously published container tag (e.g., `sprint100/server:<tag>`).
2. Update `docker-compose.prod.yml` (or orchestrator config) to pin to the prior tag.
3. Run `docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d --force-recreate`.
4. If schema migrations were applied, evaluate whether a backward-compatible migration exists; otherwise restore from snapshot.
# Persistent Matchmaking State

Sprint100 now stores matchmaking queue, active challenges, and match metadata in the primary database. This change ensures that:

- **Process restarts do not lose state** – queued players and pending challenges are preserved so reconnecting clients can resume without manual recovery.
- **Reconnect flows are idempotent** – socket reconnects update the stored socket identifier, allowing players to rejoin in-progress matches safely.
- **Operational visibility improves** – queue depth, challenge volumes, and match lifecycles can be inspected directly from the database.

## Recovery Behaviour

- When a player rejoins, their socket ID is linked to the existing `MatchPlayer` entry, and a race snapshot is delivered so the UI can resync.
- If a match is created but one or more players disconnect before the race begins, the match is cancelled and the missing players are re-queued automatically.
- Completed races persist their results (placements, finish times, and Elo deltas) so downstream analytics and leaderboards remain consistent even if sockets drop during result emission.

Refer to `server/src/services/matchStore.ts` for the repository methods that manage queue transitions, challenge lifecycles, and match persistence.
