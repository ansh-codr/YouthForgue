# MOCK_DATA_README

Phase 3 uses a production-ready mock data layer to accelerate UI development and integration tests before Firestore adoption.

## Goals
- Provide stable, documented JSON shapes identical to future backend contracts.
- Support latency + error simulation.
- Enable optimistic UI behaviors with reconciliation.
- Allow bulk seeding and deterministic export for repeatable tests.

## Data Domains
- Users, Projects, Comments, Challenges, ChallengeResponses, Circles, Reports, Spotlights, ModerationLogs.

## File Layout (suggested)
```
/mocks/
  users.json
  projects.json
  comments.json
  challenges.json
  challenge_responses.json
  circles.json
  reports.json
  spotlights.json
  moderation_logs.json
  config.json
```
`SEED_DATASET.json` aggregates core high-volume collections (users/projects/challenges/comments).

## Seeding Process (script description)
1. Load each JSON file into in-memory store objects keyed by `id`.
2. Derive computed counters:
   - `projects.commentsCount` = count of comments with parentType=project & parentId
   - `projects.likesCount` may be stored directly or derived from separate `project_likes` records (mock stores directly).
3. Initialize indexes/maps for fast lookup (e.g., `projectsByTag`).
4. Print summary counts.

## Latency & Error Simulation
- Configurable via environment variables (`MOCK_LATENCY_MIN_MS`, `MOCK_LATENCY_MAX_MS`, `MOCK_ERROR_RATE`).
- Each request chooses a latency in range and may inject an error based on probability.

## Optimistic Update Flow
- Client updates local state immediately (e.g., increment like, append comment).
- Mock server returns authoritative counts; client reconciles.
- On error: revert local mutation and surface error toast.

## Authentication Model (Mock)
- Token format: `MOCK_{userId}`.
- Parsing: substring after `MOCK_` is user id; role looked up on user object.
- Anonymous: missing header = unauthenticated; some endpoints still allowed (public GET, contact with optional email).

## Rate Limiting (Mock)
- Store ephemeral counters (e.g., likes per minute) in memory using sliding window arrays keyed by userId + action.
- On exceed: respond with 429 and `retryAfterSeconds` hint.

## Data Integrity Rules (Mock Enforced)
- Unique constraints: `users.username`, `projects.slug`.
- Referential integrity: `project.authorId` must exist in users; same for `comment.authorId`.
- Visibility filtering: private projects only returned if `authorId` matches requester or requester is admin.

## Extending Data
Add new field → update:
1. Schema description docs (`API_CONTRACTS.md`).
2. Seed generator script to populate sensible values.
3. Firestore handoff doc if persistent.

## Export / Reset
- `exportMockData` dumps current store to timestamped JSON under `/exports/`.
- `resetMockDB` clears memory and re-runs seed pipeline.

## Deterministic Generation
For synthetic large datasets use a seeded PRNG (e.g., `mulberry32(seed)`) to ensure stable likes/comments distribution across runs.

## Handling Media
- Media objects refer to static placeholder assets under `/public/seed/`.
- For uploads: generate id `upload_{n}` and return URL `/mock/uploads/{id}.jpg`.

## Firestore Migration Notes
- Direct collections map 1:1 (see `HANDOFF_PHASE3_TO_FIRESTORE.md`).
- Counters migrate to server transactions or Cloud Functions (increment on create/delete).

## Versioning
- Include `schemaVersion` field in `config.json`; increment when data shape changes.

## Quality Checklist
- All IDs unique.
- Counts consistent with relational data.
- At least 5 tags variety per domain.
- Timestamps within realistic 6–12 month window.

## Maintenance Strategy
- Keep manual seed examples small; rely on generator for scale (>100 records).
- Document any deviation from API contracts inside this readme.
