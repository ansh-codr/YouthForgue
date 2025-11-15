# Phase 2 → Phase 3 Handoff Notes

This document guides replacing the mock store with Firestore + Cloud Functions.

## Replace Mock Store Calls
- File: `lib/mockStore.ts`
  - `likeProject(projectId)` → Firestore transaction increment on `projects/{id}.likeCount`.
  - `addComment(projectId, body, author, parentId?)` → add document in `projects/{id}/comments` subcollection. Also increment `commentCount` on project.
  - `createChallenge(input)` → add to `challenges` collection.
  - `respondToChallenge(challengeId)` → increment counter on `challenges/{id}.responsesCount`.
  - `sendContactMessage(developerId, message)` → add to `messages` collection or send via Cloud Function (email provider).

## Data Model Mapping
- Collection `projects`
  - Fields: `title, excerpt, tags[], likeCount, commentCount, author{ id,name,avatar }, media[], isFeatured, createdAt`
  - Subcollection `comments`
    - Fields: `author, body, parentId?, likeCount, createdAt`
- Collection `developers`
  - Fields: `name, headline, skills[], avatar, location, github, linkedin, activeProjectsCount`
- Collection `challenges`
  - Fields: `title, promptSnippet, creator, tags[], responsesCount, deadline, createdAt`
- Collection `tags`
  - Fields: `label, color, createdAt`

## Real-time Listeners
- Components needing real-time:
  - `ProjectCard` (like count), `CommentThread` (comments)
  - Replace hook selectors with `onSnapshot` subscriptions in their respective hooks (`useProject`, `useProjects`, `useChallenges`).

## Where to add listeners
- `hooks/useProjects.ts` → subscribe to `projects` collection.
- `hooks/useProject.ts` (within file) → subscribe to `projects/{id}` and `comments` subcollection.
- `hooks/useChallenges.ts` → subscribe to `challenges`.

## Cloud Functions Suggestions
- Increment counters on write:
  - onCreate(`projects/{id}/comments/{cid}`) → increment `commentCount`.
  - onCreate(`challengeResponses/{id}`) → increment `responsesCount`.
- Moderation pipeline:
  - onCreate(`reports/{id}`) → queue for review, auto-flag spam with basic heuristics.

## New UI Integrations (Phase 2 additions)
- RichEditor `onSubmit` → create document in `posts` or `projects` (consider draft -> publish workflow with status field).
- ChatWidget → per-user thread in `chats/{userId}/messages`; bot replies via HTTP-triggered CF (Dialogflow or custom bot) writing to same thread.
- Developer contact → write to `messages/{developerId}/inbox` (CF can forward to email or app notifications).
- Challenge respond → write to `challengeParticipations` with `challengeId`, `userId`, and `createdAt`; CF increments `challenges/{id}.responsesCount`.

## Security Rules Sketch
- Allow read-all for public content.
- Allow write only for authenticated users; validate ownership for profile edits.
- Validate sizes and MIME types on uploads via Cloud Storage rules.

## Migration Strategy
- Step 1: Introduce Firestore service module returning same shapes as mock actions.
- Step 2: Feature-flag data source (mock vs. firestore) via environment variable.
- Step 3: Swap hooks one by one; keep optimistic UI for parity.
