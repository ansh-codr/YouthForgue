# Firestore Projects Schema

> Canonical document shapes for the Firebase adapter. All timestamps use ISO strings to simplify hydration in React Query caches.

## Collections

### `projects`
| Field | Type | Notes |
| --- | --- | --- |
| `title` | string | 4–120 chars |
| `slug` | string | unique, lowercase, 4–80 chars |
| `summary` | string | ≤240 chars |
| `description` | string | Markdown supported |
| `tags` | string[] | 1–8 tags |
| `repoUrl` | string? | optional HTTPS |
| `demoUrl` | string? | optional HTTPS |
| `visibility` | `public \| unlisted \| deleted` | soft delete flips visibility |
| `isFeatured` | boolean | toggled by moderation log |
| `owner` | object | `{ id, displayName, avatarUrl, role }` |
| `media` | `ProjectMedia[]` | see below |
| `likesCount` | number | incremental counter |
| `commentsCount` | number | incremental counter |
| `likedByViewer` | boolean? | set per-session via cache reconciliation |
| `createdAt` | string | ISO timestamp |
| `updatedAt` | string? | ISO timestamp |
| `deletedAt` | string? | set when visibility === 'deleted' |
| `moderationLogs` | `ModerationLogEntry[]` | capped to 50 entries |

#### Media Shape
```json
{
  "id": "media_XYZ",
  "kind": "image",
  "alt": "Hero render",
  "storagePath": "projects/proj_123/media/hero.jpg",
  "downloadUrl": "https://firebasestorage.googleapis.com/...",
  "width": 1600,
  "height": 900,
  "size": 352000,
  "contentType": "image/jpeg",
  "variants": [
    { "url": "https://.../hero@2x.jpg", "width": 3200, "height": 1800, "size": 902000, "contentType": "image/jpeg" }
  ],
  "createdAt": "2024-11-14T17:02:03.123Z"
}
```

### `projects/{projectId}/comments`
Documents are keyed by `comment_${nanoid}` to make ordering deterministic.
| Field | Type | Notes |
| --- | --- | --- |
| `body` | string | 2–1500 chars |
| `author` | object | inherits `ProjectOwner` fields |
| `parentId` | string? | reserved for threads |
| `createdAt` | string | server timestamp |
| `updatedAt` | string? | optional |

#### Example Comment Payload
```json
{
  "id": "comment_ab12cd34",
  "projectId": "proj_beta",
  "body": "Love the realtime edits!",
  "author": {
    "id": "uid_93k",
    "displayName": "Maya Alvarado",
    "avatarUrl": "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=96&h=96&fit=crop",
    "role": "member"
  },
  "createdAt": "2025-11-14T22:15:10.437Z"
}
```

### `projects/{projectId}/likes`
A lightweight map storing `uid → true`. Aggregated counts live on the parent document to avoid fan-out reads. Toggle flow keeps `likesCount` consistent and evicts stale listeners.

### `reports` (optional)
Used for moderation, referencing `REPORTS_COLLECTION` constant. Stores `projectId`, `reporterId`, `reason`, `createdAt`.

## Example Project Document
```json
{
  "title": "Multiplayer Whiteboard",
  "slug": "multiplayer-whiteboard",
  "summary": "CRDT-backed canvas for synchronous critiques.",
  "description": "### Stack\n- Next.js 13\n- Firebase\n- React Query\n\nFeatures live cursors and offline replay.",
  "tags": ["Next.js", "Firebase", "Realtime"],
  "repoUrl": "https://github.com/youthforge/whiteboard",
  "demoUrl": "https://demo.youthforge.dev/whiteboard",
  "visibility": "public",
  "isFeatured": true,
  "owner": {
    "id": "uid_story",
    "displayName": "Jordan Patel",
    "avatarUrl": "https://avatars.githubusercontent.com/u/4101091?v=4",
    "role": "admin"
  },
  "media": [
    {
      "id": "media_hero",
      "kind": "image",
      "storagePath": "projects/proj_whiteboard/media/hero.jpg",
      "downloadUrl": "https://firebasestorage.googleapis.com/v0/b/youthforge.appspot.com/o/projects%2Fproj_whiteboard%2Fmedia%2Fhero.jpg?...",
      "width": 1920,
      "height": 1080,
      "size": 420531,
      "contentType": "image/jpeg",
      "createdAt": "2025-11-12T19:00:02.100Z"
    }
  ],
  "likesCount": 87,
  "commentsCount": 14,
  "likedByViewer": false,
  "createdAt": "2025-11-10T16:12:00.000Z",
  "updatedAt": "2025-11-13T08:22:11.421Z",
  "moderationLogs": [
    {
      "id": "mod_abc123",
      "actorId": "uid_admin",
      "action": "feature",
      "reason": "Phase-4 spotlight",
      "createdAt": "2025-11-13T09:00:00.000Z"
    }
  ]
}
```
