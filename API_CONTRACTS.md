# API Contracts (Phase 3 Mock)

All endpoints return JSON. Authentication for protected routes uses `Authorization: Bearer MOCK_{userId}`. Error format is consistent across endpoints.

## Error Format
- HTTP status: appropriate status code (400/401/403/404/409/429/500)
- Body:
```
{
  "error": { "code": "string", "message": "string", "details": {"...": "..."} }
}
```

## Projects

GET /api/projects
- Query: `page` (int), `limit` (int), `tags` (comma), `sort` ("new"|"popular"|"featured"), `search` (string), `circle` (string)
- Response: `{ data: Project[], meta: { page, limit, total, nextCursor? } }`

GET /api/projects/:id
- Response: `{ data: Project }`

POST /api/projects (auth)
- Payload: `{ title, description, tags?: string[], media?: ProjectMedia[], repoUrl?: string, visibility?: "public"|"private" }`
- Response: `{ data: Project }`

PATCH /api/projects/:id (auth; author/admin)
- Payload: Partial<Project>
- Response: `{ data: Project }`

POST /api/projects/:id/like (auth)
- Behavior: toggle like by user; returns final counts
- Response: `{ data: { projectId, likesCount, likedByUser } }`

GET /api/projects/:id/comments
- Query: `limit` (int), `cursor` (string)
- Response: `{ data: Comment[], meta: { nextCursor?, hasMore } }`

POST /api/projects/:id/comments (auth)
- Payload: `{ content: string, parentId?: string }`
- Response: `{ data: Comment }`

## Challenges

GET /api/challenges
- Query: `page`, `limit`, `tags`, `sort`, `search`
- Response: `{ data: Challenge[], meta: {...} }`

GET /api/challenges/:id
- Response: `{ data: Challenge, responses: ChallengeResponse[] }` (responses may be paginated)

POST /api/challenges (auth)
- Payload: `{ title, prompt, tags: string[], deadline?: string|null, visibility?: "public"|"private" }`
- Response: `{ data: Challenge }`

POST /api/challenges/:id/respond (auth)
- Payload: `{ content: string, media?: ProjectMedia[] }`
- Response: `{ data: ChallengeResponse }`

## Users

GET /api/users
- Query: `page`, `limit`, `skills`, `search`
- Response: `{ data: User[], meta: {...} }`

GET /api/users/:id
- Response: `{ data: User, projects?: Project[], circles?: Circle[] }`

POST /api/users/:id/contact (auth or anonymous permitted)
- Payload: `{ message: string, contactEmail?: string }`
- Response: `{ data: { messageId: string, status: "sent" } }`

## Auth (mock)

POST /api/auth/login
- Payload: `{ provider: "google"|"email", credentials?: any }`
- Response: `{ token: "MOCK_{userId}", user: User }`

GET /api/auth/me
- Header: `Authorization: Bearer MOCK_{userId}`
- Response: `{ data: User }`

## Admin

GET /api/admin/reports (moderator/admin)
- Query: `status`, `type`, `page`, `limit`
- Response: `{ data: Report[], meta: {...} }`

POST /api/admin/spotlight (admin)
- Payload: `{ itemType: "project"|"user", itemId: string, title?: string, description?: string, publishAt: string }`
- Response: `{ data: Spotlight }`

POST /api/admin/reports/:id/action (moderator/admin)
- Payload: `{ action: "resolve"|"dismiss"|"ban_user"|"delete_item", notes?: string }`
- Response: `{ data: ModerationLog }`

## Schemas (Shapes)

User: `{ id, username, displayName, bio?, avatarUrl?, links?: string[], skills?: string[], role: "user"|"mentor"|"moderator"|"admin", createdAt, banned }`

ProjectMedia: `{ id, type: "image"|"video"|"embed", url, thumbUrl? }`

Project: `{ id, title, slug, description, authorId, authorSnapshot?, media: ProjectMedia[], tags: string[], likesCount, commentsCount, createdAt, updatedAt?, featured, repoUrl?, visibility }`

Comment: `{ id, parentType: "project"|"challenge"|"comment", parentId, authorId, content, createdAt, likes, edited }`

Challenge: `{ id, title, prompt, authorId, tags: string[], createdAt, deadline: string|null, responsesCount, visibility }`

ChallengeResponse: `{ id, challengeId, authorId, content, media: ProjectMedia[], createdAt, likesCount }`

Circle: `{ id, name, description, tags: string[], coverImageUrl?, createdAt, membersCount }`

Report: `{ id, itemType: "project"|"comment"|"user"|"challenge", itemId, reporterId?: string, reason, details?, createdAt, status }`

Spotlight: `{ id, itemType: "project"|"user", itemId, title?, description?, publishedAt, authorId }`

ModerationLog: `{ id, modId, actionType, targetType, targetId, timestamp, notes? }`
