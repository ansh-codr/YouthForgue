# FIREBASE_FREE_SETUP.md

Free-tier (Spark) Firebase integration plan for YouthForge (desktop-first). This guide covers only DEV and STAGING environments under Spark constraints. Production is outlined but **NOT** provisioned until upgrade decisions are made.

## Guiding Principles (Spark Constraints)
- No Cloud Functions, scheduled jobs, or paid add-ons.
- Minimize Firestore read/write/delete counts (Spark daily quotas: ~50K reads, ~20K writes, ~20K deletes – subject to current Firebase published limits; stay well below).
- Prefer one-time queries + client caching over broad real-time listeners.
- Real-time listeners only on: single project detail document, its limited comments subcollection (page size ≤ 20), minimal admin report queue.
- Use atomic `FieldValue.increment` in client for counters (likes, comments) instead of server triggers/functions.
- Avoid large media: **images only**, strict size limits (avatars ≤ 200KB, project images ≤ 1MB), videos as external embeds (YouTube/Vimeo links).

## Project Naming & Regions
Recommended region for Firestore / Auth / Storage: `us-central` (broad availability, lowest latency for most users, Spark friendly). If majority EU users later: add `eur3` project for production.

Environment names:
- Dev: `youthforge-dev`
- Staging: `youthforge-staging`
- Future Production (not created yet): `youthforge-prod`

## Step-by-Step: Create DEV Firebase Project
1. Go to https://console.firebase.google.com → "Add project".
2. Name: `youthforge-dev`. Disable Google Analytics (optional) to reduce ancillary configuration.
3. Wait for provisioning.
4. In Project Settings → General → Add App: choose **Web**.
   - App nickname: `youthforge-dev-web`
   - Hosting not required; skip.
5. Copy config values (apiKey, authDomain, projectId, storageBucket, appId, measurementId) — will map to env vars.

### Getting Your Firebase Config Values (DEV)
After creating the Web App:
1. Still in Project Settings → General → Your apps → Select the web app you just added.
2. You will see a code snippet like:
   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "youthforge-dev.firebaseapp.com",
     projectId: "youthforge-dev",
     storageBucket: "youthforge-dev.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abcdef123456",
     measurementId: "G-XXXXXXX" // optional (Analytics)
   };
   ```
3. Map each value directly:
   - `apiKey` → `NEXT_PUBLIC_FB_API_KEY`
   - `authDomain` → `NEXT_PUBLIC_FB_AUTH_DOMAIN`
   - `projectId` → `NEXT_PUBLIC_FB_PROJECT_ID`
   - `storageBucket` → `NEXT_PUBLIC_FB_STORAGE_BUCKET`
   - `appId` → `NEXT_PUBLIC_FB_APP_ID`
   - (Ignore `measurementId` for now if Analytics disabled)
4. NEVER commit raw values; put them into `.env.local` only.
5. Repeat the same process for STAGING (will have different values).

### Enable Authentication (DEV)
1. Console → Authentication → Get Started.
2. Sign-in method: enable **Email/Password** (no email link; plain password). Optionally disable email verification to reduce complexity early.
3. Enable **Google** provider; set support email.
4. Disable/avoid anonymous sign-in.

### Firestore Setup (DEV)
1. Firestore Database → Create database.
2. Mode: **Production mode** (rules locked by default). Location: `us-central`.
3. Create required collections manually only when first documents are added (no pre-creation needed): `users`, `projects`, `challenges`, `reports`, `spotlights`, `moderationLogs`.
4. Subcollections will be created implicitly: `projects/{id}/comments`, `challenges/{id}/responses`, `projects/{id}/likes` (if using like docs), `challenges/{id}/responses/{responseId}/likes` (optional future).

### Firestore Data Model (Manual Entry Guide)
| Collection | Doc ID (recommended) | Required Fields (min) | Optional / Later Fields | Notes (Spark considerations) |
|------------|----------------------|-----------------------|-------------------------|------------------------------|
| `users` | Firebase `uid` | `displayName` (string), `username` (string unique), `createdAt` (timestamp), `role` ("user" default) | `avatarUrl`, `bio`, `tags` (array), `location` | Keep doc lean; fetch frequently. |
| `projects` | Generated slug or `rid()` | `ownerId` (uid), `title`, `slug`, `createdAt`, `tags` (array), `likesCount` (number, 0), `commentsCount` (number, 0), `visibility` ("public") | `summary`, `imageUrl`, `updatedAt` | Denormalize counters (avoid counting subcollection each time). |
| `challenges` | Generated id | `ownerId`, `title`, `createdAt`, `tags` (array), `respondCount` (0) | `description`, `status` | Counter strategy same as projects. |
| `reports` | Auto id | `targetType` ("project"|"user"|"comment"), `targetId`, `reason`, `createdAt`, `status` ("open"), `reporterId` | `resolvedBy`, `resolvedAt`, `notes` | Low volume; no real-time listener. |
| `spotlights` | Auto id or semantic | `projectId`, `createdAt`, `order` (number) | `expiresAt` | Small collection; can be cached. |
| `moderationLogs` | Auto id | `actorId`, `action`, `targetType`, `targetId`, `createdAt` | `details` | Append-only; write-light. |

Subcollections:
- `projects/{projectId}/comments`: each doc: `authorId`, `body`, `createdAt`, (optional `editedAt`). Keep ≤20 per page.
- `projects/{projectId}/likes`: (OPTIONAL approach) each doc: `userId`, `createdAt`. If used, ALSO increment `likesCount` on parent to avoid counting docs.
- `challenges/{challengeId}/responses`: each doc: `responderId`, `body`, `createdAt`, `likesCount` (0).

### Create Your First Documents (Manual Console Walkthrough)
Goal: Add one user, one project, one comment manually to validate rules & UI.
1. Go to Firestore → Data tab.
2. Click "Start collection" → Collection ID: `users`.
    - Document ID: paste your authenticated user's UID (after signing in locally once).
    - Fields:
       - `displayName` (string): "Dev Admin"
       - `username` (string): "devadmin"
       - `createdAt` (timestamp): set to server timestamp or now.
       - `role` (string): "admin" (for first admin)
3. Add collection `projects`:
    - Document ID: "first-project" (example slug)
    - Fields:
       - `ownerId` (string): same UID as above.
       - `title` (string): "First Project"
       - `slug` (string): "first-project"
       - `createdAt` (timestamp)
       - `tags` (array): ["demo", "getting-started"]
       - `likesCount` (number): 0
       - `commentsCount` (number): 0
       - `visibility` (string): "public"
4. Create a subcollection under this project:
    - Select doc `projects/first-project` → "Add collection" → ID: `comments`.
    - Add document (auto id):
       - `authorId` (string): same UID
       - `body` (string): "Excited to launch!"
       - `createdAt` (timestamp)
5. (Optional) Add a second user to test non-admin restrictions.

### Sample Minimum Seed JSON (Single Project)
```json
{
   "users": [{
      "_docId": "<UID1>",
      "displayName": "Dev Admin",
      "username": "devadmin",
      "createdAt": { "_serverTimestamp": true },
      "role": "admin"
   }],
   "projects": [{
      "_docId": "first-project",
      "ownerId": "<UID1>",
      "title": "First Project",
      "slug": "first-project",
      "createdAt": { "_serverTimestamp": true },
      "tags": ["demo", "getting-started"],
      "likesCount": 0,
      "commentsCount": 0,
      "visibility": "public"
   }],
   "subcollections": [{
      "path": "projects/first-project/comments",
      "docs": [{
         "authorId": "<UID1>",
         "body": "Excited to launch!",
         "createdAt": { "_serverTimestamp": true }
      }]
   }]
}
```
Notes:
- `_serverTimestamp` placeholder means: set via console to server time or replaced by adapter using `serverTimestamp()`.
- For larger seed see `SEED_DATASET.json` (optimize sizes for Spark).

### Storage Setup (DEV)
1. Storage → Get Started → Location: `us-central`.
2. Create folders (optional naming convention):
   - `avatars/`
   - `projectMedia/`
3. Enforce size and MIME (see STORAGE_POLICY.md later): only `image/png`, `image/jpeg`, `image/webp`.

### Index Preparation (DEV)
Add composite indexes early to avoid query failures:
1. Firestore → Indexes → Composite → Add index:
   - Collection: `projects`
   - Fields: `tags` (array contains), `createdAt` (descending)
2. Another composite:
   - Collection: `projects`
   - Fields: `tags` (array contains), `likesCount` (descending)
3. Single-field indexes: ensure `slug` and `username` (unique constraints handled at app level by checking existence before write).

### Security Rules (DEV) — Copy/Paste for Spark
Where to paste:
- Firestore → Rules tab → replace content → Publish
- Storage → Rules tab → replace content → Publish

Firestore rules (public read of projects/challenges; authenticated writes; admin moderation):
```
rules_version = '2';
service cloud.firestore {
   match /databases/{database}/documents {
      function isSignedIn() { return request.auth != null; }
      function isAdmin() {
         return isSignedIn() &&
            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin','moderator'];
      }

      match /users/{uid} {
         allow read: if isSignedIn();
         allow create: if isSignedIn() && request.auth.uid == uid;
         allow update, delete: if isSignedIn() && request.auth.uid == uid;
      }

      match /projects/{projectId} {
         allow read: if true;  // public projects
         allow create: if isSignedIn();
         allow update: if isSignedIn() && (request.resource.data.ownerId == request.auth.uid || isAdmin());
         allow delete: if isAdmin();
      }

      match /projects/{projectId}/comments/{commentId} {
         allow read: if true;
         allow create: if isSignedIn();
         allow update, delete: if isSignedIn() && (resource.data.authorId == request.auth.uid || isAdmin());
      }

      match /challenges/{challengeId} {
         allow read: if true;
         allow create: if isSignedIn();
         allow update, delete: if isSignedIn() && (request.resource.data.ownerId == request.auth.uid || isAdmin());
      }

      match /challenges/{challengeId}/responses/{responseId} {
         allow read: if true;
         allow create: if isSignedIn();
         allow update, delete: if isSignedIn() && (resource.data.responderId == request.auth.uid || isAdmin());
      }

      match /reports/{id} {
         allow read: if isAdmin();
         allow create: if isSignedIn();
         allow update, delete: if isAdmin();
      }

      match /spotlights/{id} {
         allow read: if true;
         allow write: if isAdmin();
      }

      match /moderationLogs/{id} {
         allow read, write: if isAdmin();
      }
   }
}
```

Storage rules (images only; size limits; Spark-safe):
```
rules_version = '2';
service firebase.storage {
   match /b/{bucket}/o {
      function isSignedIn() { return request.auth != null; }
      function isImage() { return request.resource.contentType.matches('image/.*'); }
      function maxSizeMB(mb) { return request.resource.size < mb * 1024 * 1024; }

      match /avatars/{uid}/{fileName} {
         allow read: if true;
         allow write: if isSignedIn() && request.auth.uid == uid && isImage() && maxSizeMB(0.2);
      }

      match /projectMedia/{projectId}/{fileName} {
         allow read: if true;
         allow write: if isSignedIn() && isImage() && maxSizeMB(1);
      }

      // deny everything else by default
      match /{allPaths=**} {
         allow read, write: if false;
      }
   }
}
```

## Step-by-Step: Create STAGING Firebase Project
Replicate DEV steps with name `youthforge-staging`:
1. Add web app `youthforge-staging-web`.
2. Enable same auth providers.
3. Use `us-central` location.
4. Import a **smaller** seed (subset) to reduce daily quota impact.
5. Keep identical security rules (copy & adjust if necessary). Use separate environment variables.

## Production (Planning Only)
- Name: `youthforge-prod` (NOT YET CREATED).
- Region: pick based on user distribution; start with `us-central` or move to multi-region when upgrading plan.
- Add Monitoring: enable usage charts and consider App Check once scale increases.

## Manual Role Assignment (Spark-Friendly)
1. After admin user signs in (Google), go to `users` collection.
2. Open doc `users/{uid}` → add field: `role: "admin"`.
3. For moderators: `role: "moderator"`.
4. Keep roles minimal; no separate roles collection to avoid extra reads.

## Environment Variables (.env.local)
Add EXACTLY these 10 variables for the frontend:
```
NEXT_PUBLIC_FB_API_KEY=your_api_key
NEXT_PUBLIC_FB_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FB_PROJECT_ID=your_project_id
NEXT_PUBLIC_FB_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FB_APP_ID=your_app_id
NEXT_PUBLIC_DATA_SOURCE=firebase
NEXT_PUBLIC_PAGE_SIZE_PROJECTS=24
NEXT_PUBLIC_PAGE_SIZE_COMMENTS=20
NEXT_PUBLIC_ENABLE_RT_PROJECT=true
NEXT_PUBLIC_WRITE_COOLDOWN_MS=800
```
**Purposes:**
- `FB_*` values: Firebase initialization config.
- `DATA_SOURCE`: adapter switch (`mock` | `firebase`).
- `PAGE_SIZE_PROJECTS`: pagination size for project feeds.
- `PAGE_SIZE_COMMENTS`: max comment batch size per page.
- `ENABLE_RT_PROJECT`: gate real-time listener usage (detail page only).
- `WRITE_COOLDOWN_MS`: client-side throttle for consecutive writes (likes/comments) to stay under quotas.

### Mapping Config Snippet To .env.local (Example)
Firebase gives you (copy — do NOT commit):
```js
const firebaseConfig = {
   apiKey: "AIzaSyAAbCDEF...",
   authDomain: "youthforge-dev.firebaseapp.com",
   projectId: "youthforge-dev",
   storageBucket: "youthforge-dev.appspot.com",
   messagingSenderId: "1234567890",
   appId: "1:1234567890:web:abc123def456"
};
```
Translate to:
```
NEXT_PUBLIC_FB_API_KEY=AIzaSyAAbCDEF...
NEXT_PUBLIC_FB_AUTH_DOMAIN=youthforge-dev.firebaseapp.com
NEXT_PUBLIC_FB_PROJECT_ID=youthforge-dev
NEXT_PUBLIC_FB_STORAGE_BUCKET=youthforge-dev.appspot.com
NEXT_PUBLIC_FB_APP_ID=1:1234567890:web:abc123def456
NEXT_PUBLIC_DATA_SOURCE=firebase
NEXT_PUBLIC_PAGE_SIZE_PROJECTS=24
NEXT_PUBLIC_PAGE_SIZE_COMMENTS=20
NEXT_PUBLIC_ENABLE_RT_PROJECT=true
NEXT_PUBLIC_WRITE_COOLDOWN_MS=800
```
Validation:
- Restart dev server after adding `.env.local`.
- Check in browser console: `process.env.NEXT_PUBLIC_FB_PROJECT_ID` (via a test component) resolves correctly.
- If undefined, ensure file name is `.env.local` and not committed.

## Quota-Safe Usage Patterns
- Pagination only (no infinite scope listeners) for feeds.
- Limit comment real-time to active page; detach listener on unmount.
- Aggregate likes via a lightweight subcollection `projects/{id}/likes` and update `likesCount` directly (read likes docs only when toggling).
- Avoid storing heavy arrays (e.g., `likedBy`) to prevent large doc reads.

## Initial Data Seeding (DEV/STAGING)
Use manual console entry or import JSON (later in SEED_DATA_PLAN.md). Keep dev small (≤ 50 docs) to validate indexes/rules.

## Verification Checklist (After Setup)
1. Auth providers visible and enabled.
2. Firestore created with no documents; rules deny all until changed.
3. After rule update: public `GET` of projects returns data; private project hidden.
4. Role field applied manually lets admin update a report status.
5. Storage rejects oversized avatar upload (client pre-check + rules fallback).
6. Visit `/dev/firebase` locally to ensure the SDK initialises and all env vars register as present.

## Common Pitfalls (Avoid)
- Overusing `onSnapshot` on large collections (will burn read quota).
- Storing user likes in an array field (array grows → large doc read cost).
- Mixing staging and dev environment keys locally (always separate `.env.local` variants).
- Using video uploads (exceed storage; use embed URLs instead).

## Decommission / Reset Steps
For major test resets:
1. Export current data (Firestore console export not in Spark → manually delete collections or script via CLI with caution).
2. Re-import minimal seed.
3. Re-run manual test checklist.

---
This setup ensures a Spark-safe baseline with minimal ongoing costs and straightforward migration path if upgrading later.
