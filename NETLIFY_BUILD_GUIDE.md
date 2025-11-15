# Netlify Build Configuration Guide

## Problem Fixed
✅ **"Failed during stage 'building site': Build script returned non-zero exit code: 2"**

## Root Cause
The build was failing during Next.js's "Collecting page data" phase because:
1. Firebase client was trying to initialize during server-side/build-time rendering
2. Dynamic routes weren't properly configured to skip static generation
3. Missing environment variables during build process

## Solutions Implemented

### 1. Firebase Client-Side Guard
**File: `lib/firebaseClient.ts`**

Added a guard to prevent Firebase from initializing during build-time:

```typescript
export const getFirebaseApp = (): FirebaseApp => {
  // Guard against server-side/build-time initialization
  if (typeof window === 'undefined') {
    throw new Error('[firebaseClient] Firebase can only be initialized in the browser');
  }
  // ... rest of initialization
};
```

**Why:** Firebase SDK requires browser APIs (localStorage, IndexedDB) that don't exist during server-side or build-time rendering.

### 2. Force Dynamic Rendering
**File: `app/(main)/projects/[slugOrId]/page.tsx`**

```typescript
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
```

**Why:** This tells Next.js to skip the "Collecting page data" phase for this route and render it dynamically at request time instead.

### 3. Metadata Base URL
**File: `app/layout.tsx`**

Added `metadataBase` to fix Open Graph warnings:

```typescript
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://youthforge.netlify.app'),
  // ... rest of metadata
};
```

## Netlify Environment Variables Setup

### Required Variables
Go to: **Netlify Dashboard → Site Settings → Build & Deploy → Environment Variables**

Add these variables:

```bash
# Firebase (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Feature Flags
NEXT_PUBLIC_USE_FIREBASE=true

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app

# Cloudinary (Optional - only if using image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### How to Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click gear icon → Project Settings
4. Scroll to "Your apps" → Select your web app
5. Copy the config values from `firebaseConfig` object

## Build Settings

Netlify should auto-detect these, but verify:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Testing Locally

Before deploying, test the build locally:

```bash
# Install dependencies
npm install

# Set environment variables (create .env.local)
cp .env.example .env.local
# Edit .env.local with your Firebase credentials

# Run build
npm run build

# If successful, test production build
npm start
```

## Common Build Errors & Fixes

### Error: "Firebase can only be initialized in the browser"
**Status:** ✅ Fixed
**Cause:** Firebase being called during server-side rendering
**Solution:** Already implemented - Firebase guard prevents server-side initialization

### Error: "Missing environment variables"
**Fix:** Add all required variables to Netlify environment settings

### Error: "Module not found"
**Fix:** Ensure `package.json` includes all dependencies and run `npm install`

### Error: "Page is missing generateStaticParams"
**Status:** ✅ Fixed
**Fix:** Added `dynamic = 'force-dynamic'` to skip static generation

## Deployment Checklist

- [ ] All environment variables set in Netlify
- [ ] Firebase project configured and credentials obtained
- [ ] `NEXT_PUBLIC_USE_FIREBASE=true` set in Netlify
- [ ] Build succeeds locally with `npm run build`
- [ ] Dynamic route works at `/projects/[slugOrId]`
- [ ] Git changes committed and pushed to main

## Verification Steps

After deployment:

1. **Check Build Log** - Should see "Build succeeded" in Netlify
2. **Test Dynamic Route** - Visit `/projects/test-project` - should load without 404
3. **Check Browser Console** - No Firebase initialization errors
4. **Test Authentication** - Login flow should work
5. **Test Project Creation** - Create/view projects should work

## Architecture Notes

### Why Not Use `output: 'export'`?

We removed `output: 'export'` because:
- Static export doesn't support dynamic routes (`/projects/[slugOrId]`)
- Can't use server-side features or API routes
- Requires pre-generating all possible paths at build time

### Why Use Netlify's Next.js Runtime?

- Native support for dynamic routes
- Server-side rendering at edge
- API routes work out of the box
- Environment variables available at runtime
- Better performance with edge caching

## Troubleshooting

If build still fails:

1. **Check Netlify Build Log** - Copy the exact error message
2. **Verify Environment Variables** - Go to Netlify settings and confirm all vars are set
3. **Test Locally** - Run `npm run build` locally to reproduce the error
4. **Check Firebase Config** - Ensure Firebase project is active and credentials are correct

## Additional Resources

- [Netlify Next.js Documentation](https://docs.netlify.com/frameworks/next-js/overview/)
- [Next.js Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [Firebase Web Setup](https://firebase.google.com/docs/web/setup)
