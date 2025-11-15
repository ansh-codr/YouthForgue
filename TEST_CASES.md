# Integration Test Cases (Phase 3)

These scenarios validate the mock API and client adapters behavior.

## Projects List Pagination
- Seed: 100 projects
- Request: `GET /api/projects?page=2&limit=24`
- Expect: 24 items; `meta.total=100`, `meta.page=2`.

## Create Project (Auth)
- Auth: `Authorization: Bearer MOCK_user_002`
- Request: `POST /api/projects` with `{ title, description }`
- Expect: `201 Created`; returned `authorId=user_002`, `createdAt` set; appears in subsequent `GET /api/projects`.

## Like Toggle with Optimistic Reconciliation
- Start: `likesCount=5`
- Actions: Two rapid `POST /api/projects/:id/like` as same user
- Expect: First response `{ likedByUser: true, likesCount: 6 }`; second `{ likedByUser: false, likesCount: 5 }`.

## Comment Thread
- Action: `POST /api/projects/:id/comments` with `{ content }`
- Expect: Comment present in `GET /api/projects/:id/comments`; `projects/:id.commentsCount` increments by 1.

## Auth Gating
- Action: `POST /api/projects` without token
- Expect: `401` with `error.code = "unauthorized"`.

## Rate Limiting
- Action: Exceed 10 likes/min per user
- Expect: `429` with `error.code = "rate_limited"` and retry hint.

## Upload Simulation
- Action: Upload file to media endpoint
- Expect: Progress events over 3–8s; final media `{ id, url, thumbUrl }`.

## Admin Report Flow
- Steps: `POST /api/reports` → admin `GET /api/admin/reports` → admin `POST /api/admin/reports/:id/action` set to `in_review` then `resolved`.
- Expect: Status updates and corresponding entries in moderation logs.

## Users List & Profile
- Request: `GET /api/users?skills=React&search=anika`
- Expect: Users matching skills OR name substring; pagination metadata included.

## Challenges & Responses
- Request: `GET /api/challenges`
- Post Response: `POST /api/challenges/:id/respond`
- Expect: Response object created; `responsesCount` incremented on challenge.
