# Phase 3 Handoff to Firestore

This document maps the mock API to Firestore collections, recommended indexes, and rule sketches.

## Collections
- users → `users`
- projects → `projects`
- comments → `projects/{projectId}/comments`
- challenges → `challenges`
- challenge responses → `challenges/{id}/responses`
- reports → `reports`
- spotlights → `spotlights`

## Document Shapes (Data Description)

`users/{uid}`
- `{ username, displayName, bio?, avatarUrl?, links?: string[], skills?: string[], role, createdAt, banned }`

`projects/{projectId}`
- `{ title, slug, description, authorId, authorSnapshot?, media[], tags[], likesCount, commentsCount, createdAt, updatedAt?, featured, repoUrl?, visibility }`

`projects/{projectId}/comments/{commentId}`
- `{ parentType: "project"|"challenge"|"comment", parentId, authorId, content, createdAt, likes, edited }`

`challenges/{id}`
- `{ title, prompt, authorId, tags[], createdAt, deadline, responsesCount, visibility }`

`challenges/{id}/responses/{responseId}`
- `{ challengeId, authorId, content, media[], createdAt, likesCount }`

`reports/{reportId}`
- `{ itemType, itemId, reporterId?, reason, details?, createdAt, status }`

`spotlights/{spotlightId}`
- `{ itemType: "project"|"user", itemId, title?, description?, publishedAt, authorId }`

## Index Recommendations
- projects
  - Composite: tags (array-contains) + createdAt desc (tag-scoped newest)
  - Composite: tags (array-contains) + likesCount desc (tag-scoped popular)
  - Single: featured (bool) + createdAt desc
- challenges
  - createdAt desc, deadline asc
- users
  - username (unique at app level), createdAt desc
- comments
  - parentId + createdAt asc (thread order)

## Security Rules Summary
- Read: public for `projects`, `challenges`, `spotlights`, and public `users` fields.
- Write:
  - `users/{uid}`: only owner can update own profile.
  - `projects`: create for authenticated users; update/delete by author or admin.
  - `comments`: create for authenticated; delete by author or moderator/admin.
  - `reports`: anyone can create; update by moderator/admin.
  - `spotlights`: admin only.

## Cloud Function Triggers
- onCreate(`projects/{id}/comments/{cid}`) → increment `projects/{id}.commentsCount`.
- onDelete(`projects/{id}/comments/{cid}`) → decrement `commentsCount`.
- onCreate(`projectLikes/{likeId}`) → increment `likesCount` (if using like docs); or perform transaction increments directly.
- onCreate(`challengeResponses/{rid}`) → increment `challenges/{id}.responsesCount`.
- onCreate(`reports/{id}`) → notify admins; optional auto-classification.
- onDelete(`projects/{id}`) → clean up media storage refs.

## Migration Strategy
1. Introduce Firestore adapter functions returning the same shapes as mock endpoints.
2. Feature-flag datasource (`NEXT_PUBLIC_DATA_SOURCE=mock|firestore`).
3. Swap adapters per domain (projects, comments, challenges) incrementally.
4. Keep optimistic updates; server increments reconcile via onSnapshot.

## Notes
- Use server timestamps for createdAt/updatedAt.
- Consider use of distributed counters for high-traffic likes.
- Store authorSnapshot as denormalized data for performance; maintain via Cloud Functions on user updates.
