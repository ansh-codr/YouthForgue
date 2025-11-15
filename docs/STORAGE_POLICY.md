# Storage & Upload Policy

## Buckets & Paths
- **Default bucket**: `gs://${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'youthforge.appspot.com'}`
- **Root Prefix**: `projects/`
  - `projects/{projectId}/media/{timestamp}-{nanoid}-{originalName}` for gallery assets
  - `projects/{projectId}/avatars/{filename}` reserved for future owner overrides
- **Mock adapter** mirrors this shape locally so download URLs remain interchangeable between Firebase and Storybook/test runs.

## Limits
| Item | Limit | Enforcement |
| --- | --- | --- |
| Project images | 5 per project (`PROJECT_IMAGE_LIMIT`) | Client blocks selection beyond limit |
| File size | 1 MB per image (`PROJECT_IMAGE_MAX_BYTES`) | Compression before upload + post-check |
| Total retries | 3 attempts (`UPLOAD_MAX_RETRIES`) | Exponential backoff (`UPLOAD_RETRY_BACKOFF_MS`) |
| Image dimensions | 1920px max edge (`DEFAULT_IMAGE_MAX_DIMENSION`) | `browser-image-compression` + canvas fallback |

## Client Enforcement
1. **Compression** – `compressImage` converts oversized assets using web worker or canvas fallback; rejects non-image MIME types.
2. **Slugged Filenames** – Sanitized to lowercase alphanumerics to keep deterministic storage paths.
3. **Progress Hooks** – Upload UI updates progress bars via `uploadProjectMedia` `onProgress` callback and sets statuses (`pending` → `uploading` → `success`).
4. **Cleanup** – Local preview object URLs revoked on unmount to prevent memory leaks during repeated edits.
5. **Adapter Flag** – `FEATURE_FLAGS.useFirebaseAdapter` gates access to Firebase-specific APIs. When false, mock adapter short-circuits uploads while still respecting limits for UX parity.

## Security & Access
- Firebase Storage rules tie project media writes to authenticated users with matching `owner.id`.
- Public read access served via signed download URLs stored on the document—no direct bucket exposure in the client.
- When a project is soft-deleted, uploads stay in bucket but references can be garbage-collected by a scheduled task (`projects/{projectId}/media/**`).

## Monitoring
- Upload operations emit structured console logs (dev only) and progress percentages for future telemetry.
- Remaining quota tracked via periodic `StorageUsageWidget` (Phase 5) but placeholder hooks exist for attaching analytics events on success/failure.
