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
