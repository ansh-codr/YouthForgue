# Netlify Deployment Troubleshooting

## Current Configuration Status ✅

Your repository is now configured with:
- ✅ `netlify.toml` - Next.js plugin configuration
- ✅ `.nvmrc` - Node 18 version specified
- ✅ `package.json` - Engines field added
- ✅ Firebase browser-only guard
- ✅ Dynamic route configuration
- ✅ `.env.example` - Environment variable template

## Next Steps: Get Netlify Build Logs

### How to Get the Build Log

1. Go to your Netlify dashboard
2. Click on your site
3. Go to **Deploys** tab
4. Click on the failed deploy
5. Scroll down to see the build log
6. Copy the **entire error section** (the red text with the error)

### What to Look For

Copy the section that includes:
- The command that failed
- The error message (usually in red)
- The stack trace (if any)
- Any "Module not found" or "Cannot resolve" messages

Example of what to copy:
```
Build command from Netlify app                    
────────────────────────────────────────────────────────────────
$ npm run build
...
Error: Cannot find module 'xyz'
    at Module._resolveFilename (node:internal/modules/cjs/loader:...)
```

## Common Issues and Quick Fixes

### Issue 1: "Publish directory not found"
**If you see:** `Your publish directory was not found at: /opt/build/repo/out`

**Fix in Netlify UI:**
1. Site Settings → Build & Deploy → Build settings
2. Click "Edit settings"
3. **Clear the "Publish directory" field completely**
4. Save
5. Trigger a new deploy

### Issue 2: Missing Environment Variables
**If you see:** Firebase errors, API errors, or undefined variable errors

**Fix in Netlify UI:**
1. Site Settings → Build & Deploy → Environment
2. Add these variables:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_USE_FIREBASE=true
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app
```

### Issue 3: Node Version Mismatch
**If you see:** ESM errors, "ERR_REQUIRE_ESM", or version conflicts

**Fix:** Already handled with `.nvmrc` and `package.json` engines field

### Issue 4: Module Not Found
**If you see:** `Cannot find module 'X'` or `Module not found: Error: Can't resolve 'Y'`

**Check:**
1. Is the file/package in your repo? (`git ls-files | grep <filename>`)
2. Is it in `package.json` dependencies?
3. Did you commit it?

### Issue 5: Build Timeout
**If you see:** Build exceeded time limit

**Fix in Netlify UI:**
1. Go to Site Settings → Build & Deploy → Build settings
2. Increase timeout (if available on your plan)
3. Or optimize build by removing unnecessary build steps

## Manual Verification Checklist

Run these commands locally to verify everything works:

```bash
# 1. Clean install
rm -rf node_modules package-lock.json
npm install

# 2. Type check
npm run typecheck

# 3. Build
npm run build

# 4. Check output
ls -la .next/

# 5. Test production build
npm start
```

If any of these fail locally, they'll fail on Netlify.

## Netlify Plugin Status

The `@netlify/plugin-nextjs` should be automatically detected. To verify:

1. Go to your Netlify dashboard
2. Site Settings → Build & Deploy → Build plugins
3. You should see "Essential Next.js" plugin listed

If not listed:
1. Click "Add plugin"
2. Search for "Essential Next.js"
3. Install it

## Still Having Issues?

**Copy and paste the following information:**

1. The exact error from Netlify build log (the red text)
2. The build command that ran
3. Any "Module not found" or path errors

**Example format:**
```
Build command: npm run build
Error: [paste exact error here]
Stack trace: [paste if available]
```

This will help diagnose the exact issue!

## Quick Test Deploy

After making the UI changes (clearing publish directory), trigger a new deploy:

```bash
# Commit current changes
git add -A
git commit -m "Add Node version config for Netlify"
git push origin main
```

Then watch the Netlify deploy dashboard for the new build log.
