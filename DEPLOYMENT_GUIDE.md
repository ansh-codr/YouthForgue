# 🚀 Deployment Guide - YouthForge to Netlify

## Prerequisites

- ✅ GitHub account
- ✅ Netlify account (sign up at https://netlify.com)
- ✅ Firebase project configured
- ✅ Cloudinary account configured

---

## Step 1: Push to GitHub

### 1.1 Initialize Git Repository (if not already done)

```bash
cd youth
git init
git add .
git commit -m "Initial commit - YouthForge platform"
```

### 1.2 Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `YouthForge` (or your preferred name)
3. Description: "Youth creator platform for collaboration"
4. **Keep it Public or Private** (your choice)
5. **DO NOT** initialize with README (you already have files)
6. Click "Create repository"

### 1.3 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/YouthForge.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## Step 2: Deploy to Netlify

### 2.1 Connect to Netlify

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"GitHub"**
4. Authorize Netlify to access your GitHub
5. Select your **YouthForge** repository

### 2.2 Configure Build Settings

Netlify should auto-detect Next.js, but verify:

- **Build command**: `npm run build`
- **Publish directory**: `out`
- **Node version**: 18 (automatically detected)

Click **"Deploy site"**

---

## Step 3: Configure Environment Variables

### 3.1 Add Environment Variables in Netlify

1. In Netlify dashboard, go to **Site settings** → **Environment variables**
2. Click **"Add a variable"** and add each of these:

#### Firebase Configuration:
```
NEXT_PUBLIC_FB_API_KEY = AIzaSyCeJ440MsvYVQbUQY6jzIZ7jhyfNsQhcpE
NEXT_PUBLIC_FB_AUTH_DOMAIN = youthforge-802e6.firebaseapp.com
NEXT_PUBLIC_FB_PROJECT_ID = youthforge-802e6
NEXT_PUBLIC_FB_STORAGE_BUCKET = youthforge-802e6.appspot.com
NEXT_PUBLIC_FB_APP_ID = 1:463749575901:web:30536f16f78c8443455734
NEXT_PUBLIC_FB_MESSAGING_SENDER_ID = 463749575901
NEXT_PUBLIC_FB_MEASUREMENT_ID = G-3PT163YGK8
```

#### Cloudinary Configuration:
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = dvr3xqdk7
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET = YouthForge
```

#### Data Source:
```
NEXT_PUBLIC_DATA_SOURCE = firebase
```

### 3.2 Redeploy

After adding environment variables:
1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**

---

## Step 4: Configure Firebase for Production

### 4.1 Add Netlify Domain to Firebase

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: **youthforge-802e6**
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"**
5. Add your Netlify domain (e.g., `your-site-name.netlify.app`)
6. Save

### 4.2 Update Firestore Security Rules (if needed)

Ensure your Firestore rules are production-ready:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    match /userProfiles/{userId} {
      allow read: if true;
      allow create: if isOwner(userId);
      allow update: if isOwner(userId);
    }
    
    match /projects/{projectId} {
      allow read: if true;
      allow create: if isSignedIn();
      allow update: if isOwner(resource.data.author.id);
      allow delete: if isOwner(resource.data.author.id);
    }
    
    match /challenges/{challengeId} {
      allow read: if true;
      allow create: if isSignedIn();
      allow update: if isOwner(resource.data.createdBy.id);
    }
  }
}
```

---

## Step 5: Custom Domain (Optional)

### 5.1 Add Custom Domain in Netlify

1. Go to **Domain settings** → **Add custom domain**
2. Enter your domain (e.g., `youthforge.com`)
3. Follow Netlify's DNS instructions

### 5.2 Update Firebase

Add your custom domain to Firebase authorized domains (same as Step 4.1)

---

## Step 6: Verify Deployment

### 6.1 Test Core Features

Visit your Netlify URL and test:

- ✅ Home page loads
- ✅ Sign up / Login works
- ✅ Create project works
- ✅ Image upload works (Cloudinary)
- ✅ Profile editing works
- ✅ Theme toggle works (dark/light mode)
- ✅ GitHub repo links work
- ✅ Live demo links work (if added)

### 6.2 Check Browser Console

Open browser DevTools (F12) and check for:
- No errors in Console tab
- Network tab shows successful API calls
- Firebase connection successful

---

## Troubleshooting

### Issue: "Firebase not initialized"
**Solution**: Check environment variables in Netlify are correct

### Issue: "CORS error with Cloudinary"
**Solution**: Verify Cloudinary upload preset is set to "Unsigned"

### Issue: "Images not loading"
**Solution**: Check image URLs in Firestore and Cloudinary dashboard

### Issue: "Authentication redirects fail"
**Solution**: Add Netlify domain to Firebase authorized domains

### Issue: "Build fails"
**Solution**: Check build logs in Netlify, ensure all dependencies in `package.json`

---

## Continuous Deployment

✅ **Automatic deploys enabled!**

Every time you push to GitHub `main` branch:
1. Netlify automatically detects changes
2. Runs build command
3. Deploys new version
4. Your site updates automatically

### Manual Deploy

To deploy manually:
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

---

## Monitoring & Analytics

### Netlify Analytics (Optional)
- Enable in Netlify dashboard
- $9/month for detailed analytics

### Firebase Analytics (Free)
- Already configured via `NEXT_PUBLIC_FB_MEASUREMENT_ID`
- View in Firebase Console → Analytics

---

## Performance Optimization

### Recommended Settings in Netlify:

1. **Asset Optimization**
   - Go to Site settings → Build & deploy → Post processing
   - Enable: ✅ Bundle CSS, ✅ Minify CSS/JS, ✅ Compress images

2. **Prerendering** (already configured in `netlify.toml`)
   - SPA fallback enabled
   - All routes accessible

3. **CDN** (automatic)
   - Netlify's global CDN enabled by default
   - Fast worldwide delivery

---

## Cost Breakdown (Free Tier)

### Netlify
- ✅ 100GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Automatic HTTPS
- ✅ CDN included

### Firebase (Spark Plan)
- ✅ Firestore: 50K reads/day, 20K writes/day
- ✅ Authentication: Unlimited
- ✅ Hosting: Not needed (using Netlify)

### Cloudinary
- ✅ 25GB storage
- ✅ 25GB bandwidth/month
- ✅ Unlimited transformations

**Total Cost**: $0/month (within free tiers)

---

## Next Steps After Deployment

1. ✅ Share your site URL with friends/testers
2. ✅ Monitor Firebase usage in console
3. ✅ Check Netlify deploy logs for any warnings
4. ✅ Set up custom domain (optional)
5. ✅ Add Google Analytics (optional)
6. ✅ Configure email notifications in Netlify

---

## Support & Resources

- **Netlify Docs**: https://docs.netlify.com
- **Firebase Docs**: https://firebase.google.com/docs
- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Next.js Docs**: https://nextjs.org/docs

---

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Build for production
npm run build

# Check for errors
npm run typecheck

# Deploy to GitHub
git add .
git commit -m "Update"
git push origin main
```

---

**🎉 Congratulations! Your YouthForge platform is now live!**

Your site will be available at: `https://your-site-name.netlify.app`
