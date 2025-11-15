# Netlify Dynamic Route Fix

## Problem
Netlify build was failing with the error:
```
Page '/projects/[slugOrId]' is missing 'generateStaticParams()' so it cannot be used with 'output: export' config.
```

## Root Cause
The app was configured with `output: 'export'` in `next.config.js`, which generates a fully static site. Static exports in Next.js **cannot handle dynamic routes** (like `/projects/[slugOrId]`) without pre-generating all possible paths at build time.

## Solution Implemented

### 1. Removed Static Export Configuration
**File: `next.config.js`**
- Removed `output: 'export'` line
- This allows Netlify to use its native Next.js runtime, which fully supports dynamic routes

### 2. Split Page into Server + Client Components
**Files Created:**
- `app/(main)/projects/[slugOrId]/page.tsx` - Server component (wrapper)
- `app/(main)/projects/[slugOrId]/ProjectDetailClient.tsx` - Client component (all logic)

**Why:** This pattern allows the route to be server-rendered on Netlify while keeping all React hooks and client-side functionality in the client component.

### 3. Verified Build
- Build now succeeds ✅
- Route shows as `λ (Server)` indicating it's dynamically rendered
- Netlify can handle this route natively without static export

## How Netlify Handles This

When you deploy to Netlify **without** `output: 'export'`:
- Netlify detects Next.js and uses the **Next.js Runtime**
- Dynamic routes (like `[slugOrId]`) are handled server-side on Netlify's edge functions
- Each request to `/projects/some-id` triggers server rendering
- Client-side navigation still works via Next.js router

## Key Differences

| Config | Type | Pros | Cons |
|--------|------|------|------|
| `output: 'export'` | Fully static HTML | Fast, cheap hosting | No dynamic routes, no server features |
| **No export config** (our fix) | **Netlify Next.js Runtime** | **Dynamic routes work, server features available** | **Requires Netlify Functions (included in free tier)** |

## Deployment Notes

1. **No special Netlify configuration needed** - `netlify.toml` handles everything
2. **Build command:** `npm run build` (default)
3. **Publish directory:** Must be EMPTY (not `/out`) - let the Next.js plugin manage it
4. **Dynamic routes now work:** `/projects/abc123`, `/projects/my-cool-project-slug`, etc.

### Critical: Netlify UI Configuration

⚠️ **If you see error:** "Your publish directory was not found at: /opt/build/repo/out"

**Fix:**
1. Go to Netlify: Site Settings → Build & Deploy → Continuous Deployment → Build settings
2. Click "Edit settings"
3. **Clear the "Publish directory" field** (remove `/out`)
4. Save and redeploy

The `netlify.toml` file in the repo configures the correct settings automatically.

## Testing

Local build verification:
```bash
npm run build
# Should see: λ /projects/[slugOrId]
```

The `λ` symbol indicates the route is server-rendered, which is exactly what Netlify needs for dynamic routes.

## Alternative Solutions (Not Recommended)

If you **must** use static export:
1. Pre-generate all project paths in `generateStaticParams()`
2. Implement client-side routing with 404 fallback
3. Use a different hosting solution that supports static-only

**Our solution is better** because it leverages Netlify's native Next.js support without sacrificing dynamic routing capabilities.
