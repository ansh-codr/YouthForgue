# ADAPTER_MAPPING.md

Function-level mapping between current mock adapter and future Firebase adapter (Spark-safe). The goal is to minimize reads/writes and avoid Cloud Functions by using client-side increments and simple transactions.

Conventions:
- Firestore path notation: `collection/doc/subcollection/doc`.
- All timestamps use `serverTimestamp()`.
- Pagination uses cursor with `startAfter(lastDoc)` and `limit(N)`.
- Real-time listeners only where explicitly noted; otherwise use one-off `get()`.

## Projects

fetchProjects({ pageSize, cursor, tags?, sort?, search?, circle? })
- Input: pageSize (default `NEXT_PUBLIC_PAGE_SIZE_PROJECTS`), optional `cursor` (DocumentSnapshot), tags (array), sort ("new"|"popular"|"featured"), search (string)
- Ops:
  - Base: query `projects` where `visibility == "public"`.
  - If tags: `where('tags', 'array-contains-any', tags.slice(0, 10))`.
  - Sort "new": `orderBy('createdAt', 'desc')`.
  - Sort "popular": `orderBy('likesCount', 'desc')` then secondary `orderBy('commentsCount', 'desc')` if needed.
  - Sort "featured": `where('featured', '==', true')` + `orderBy('createdAt', 'desc')`.
  - Search: for Spark, approximate with `where('titleKeywords', 'array-contains', termLower)` (requires precomputed keywords client-side when creating doc) OR fallback to client-side filter after fetching a single page (cheaper than full-text indexes on free tier).
  - Apply `startAfter(cursor)` if provided; `limit(pageSize)`.
- Output: `{ data: Project[], nextCursor?: DocumentSnapshot }`.

fetchProjectById(projectId)
- Ops: `get(doc('projects', projectId))`.
- Output: `Project | null`.

createProject({ title, description, tags, media, repoUrl, visibility })
- Pre: require `request.auth`.
- Ops:
  - Build `slug` (check unique with `where('slug','==',slug)`, limit 1).
  - `add` to `projects` with fields: `authorId=request.auth.uid`, `authorSnapshot` (id, displayName, avatarUrl), `likesCount=0`, `commentsCount=0`, `featured=false`, `createdAt=serverTimestamp()`.
- Output: newly created `Project` (with resolved timestamps after re-fetch if needed).

updateProject(projectId, partial)
- Auth: only author or admin.
- Ops: `update(doc('projects', projectId), partial)`.
- Output: updated `Project`.

likeProject(projectId)
- Input: toggles like for current user.
- Data model (Spark-friendly): subcollection `projects/{id}/likes/{uid}` with doc `{ createdAt }`.
- Ops:
  - Read `doc('projects/{id}/likes/{uid}')`. If exists → `delete` and `update(projects/{id}, { likesCount: increment(-1) })`; else `set` and `update(increment(1))`.
- Output: `{ projectId, likesCount, likedByUser }` (final authoritative from post-update `get(doc('projects', id))`).

## Comments

fetchProjectComments(projectId, { pageSize, cursor })
- Ops: query `projects/{id}/comments` ordered by `createdAt` asc, `limit(pageSize)`, optional `startAfter(cursor)`.
- Output: `{ data: Comment[], nextCursor? }`.

listenProject(projectId)
- Real-time allowed: `onSnapshot(doc('projects', id))`.
- Output stream: Project.

listenProjectComments(projectId, { limit })
- Real-time allowed: `onSnapshot(query('projects/{id}/comments', orderBy('createdAt','asc'), limit(limit)))` for detail page only.
- Output stream: Comment[].

addProjectComment(projectId, { content, parentId? })
- Ops:
  - `add` to `projects/{id}/comments` with `{ authorId, content, likes=0, edited=false, createdAt=serverTimestamp(), parentType: parentId ? 'comment' : 'project', parentId: parentId ?? projectId }`.
  - Update counter on project: `update('projects/{id}', { commentsCount: increment(1) })`.
- Output: created `Comment` doc.

## Challenges

fetchChallenges({ pageSize, cursor, tags?, sort?, search? })
- Ops: similar to projects; default `orderBy('createdAt','desc')`.
- Output: `{ data: Challenge[], nextCursor? }`.

fetchChallengeById(id)
- Ops: `get(doc('challenges', id))`.

respondToChallenge(challengeId, { content, media })
- Ops:
  - `add` to `challenges/{id}/responses` with `{ authorId, content, media, createdAt: serverTimestamp(), likesCount:0 }`.
  - `update('challenges/{id}', { responsesCount: increment(1) })`.
- Output: created `ChallengeResponse`.

fetchChallengeResponses(challengeId, { pageSize, cursor })
- Ops: query `challenges/{id}/responses`, orderBy `createdAt desc`, with pagination.

## Users

fetchUsers({ pageSize, cursor, skills?, search? })
- Ops: query `users` with optional `array-contains-any` on `skills`, `orderBy('createdAt','desc')`; search approximated via `displayNameKeywords` array or client filter.

fetchUserById(uid)
- Ops: `get(doc('users', uid))`.

contactUser(userId, { message, contactEmail? })
- Without CF/email, store as inbox message for manual processing: `add(doc('users/{userId}/inbox'), { from: currentUidOrNull, contactEmail?, message, createdAt: serverTimestamp(), status: 'new' })`.
- Output: `{ ok: true }`.

## Admin

fetchReports({ status?, type?, pageSize, cursor })
- Access: role in [admin, moderator].
- Ops: query `reports` with optional filters, orderBy `createdAt desc`.

createSpotlight({ itemType, itemId, title?, description?, publishAt })
- Access: admin only.
- Ops: `add` to `spotlights` with `{ itemType, itemId, title, description, publishedAt: publishAt, authorId: adminUid }`.

moderationAction(reportId, { action, notes? })
- Access: moderator/admin only.
- Ops:
  - Append log in `moderationLogs` `{ modId, actionType: action, targetType, targetId, timestamp: serverTimestamp(), notes }`.
  - Update `reports/{id}` status accordingly (`open` → `in_review`/`resolved`/`dismissed`).

## Auth

loginWithGoogle / loginWithEmail
- Firebase Auth SDK call; on first login create `users/{uid}` doc if missing.

getCurrentUser
- Return auth state (cached by client); fetch `users/{uid}` for role.

## Notes on Costs & Performance
- Counters via `increment` avoid CF; keep consistent via client-side optimistic + post-update read reconcile.
- Avoid `array-contains-any` with >10 tags; cap filters to ≤ 10.
- Avoid full-text search; use simple keyword arrays or client-side filtering on one page.
- Keep page sizes small: projects 24, comments 20, users 24.
- Prefer `get()` queries for feeds; reserve `onSnapshot` for one-off detail pages.
