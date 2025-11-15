# Mock Configuration (Phase 3)

Environment variables control runtime behavior of the mock server or MSW handlers.

| Variable | Default | Description |
|----------|---------|-------------|
| `MOCK_PORT` | 5050 | Port for standalone mock server. |
| `MOCK_LATENCY_MIN_MS` | 100 | Minimum simulated latency per request. |
| `MOCK_LATENCY_MAX_MS` | 800 | Maximum simulated latency per request. |
| `MOCK_ERROR_RATE` | 0.01 | Probability (0–1) of random error injection. |
| `SEED_COUNT_PROJECTS` | 100 | Number of synthetic projects to generate when no seed file present. |
| `SEED_COUNT_USERS` | 200 | Number of synthetic users to generate when no seed file present. |
| `MOCK_UPLOAD_MIN_MS` | 3000 | Minimum simulated upload duration. |
| `MOCK_UPLOAD_MAX_MS` | 8000 | Maximum simulated upload duration. |
| `MOCK_RATE_LIMIT_LIKES_PER_MIN` | 10 | Per-user like operations allowed per rolling minute. |
| `MOCK_RATE_LIMIT_PROJECTS_PER_HOUR` | 5 | Per-user project creations allowed per rolling hour. |
| `MOCK_TOKEN_PREFIX` | "MOCK_" | Prefix for auth token parsing. |
| `MOCK_SEED_VERSION` | 1 | Schema version for seed data. |

## Behavior Descriptions

### Latency Simulation
Select random latency = `uniform(MIN, MAX)`. Apply with `setTimeout` before resolving.

### Error Injection
If `Math.random() < MOCK_ERROR_RATE`, return a 500 error with `server_error`. Do not mutate state on injected errors.

### Rate Limiting
Maintain in-memory ring buffers of timestamps per user & action. Reject if count within window exceeds threshold.

### Upload Progress
Emit progress events at ~10 equal intervals between min/max duration. Final event includes media object.

### Seed Generation
When seed files absent, generate deterministic data using a seeded PRNG. Ensure distribution across tags & timestamps.

### Token Parsing
Incoming header `Authorization: Bearer MOCK_user_123` → userId = `user_123`. Look up role in users dataset.

### Reconciliation
Optimistic updates patched client-side first; server authoritative state returned; client overwrites divergent counters.

### Logging
Include request id (incremental counter) and timestamp in console output for debugging.
