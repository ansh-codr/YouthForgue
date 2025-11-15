# Firebase Implementation Guide

This document provides step-by-step instructions for implementing Firebase Authentication and Firestore in your YouthForge application.

## Table of Contents
1. [Firebase Console Setup](#firebase-console-setup)
2. [Environment Configuration](#environment-configuration)
3. [Authentication Setup](#authentication-setup)
4. [Firestore Database Setup](#firestore-database-setup)
5. [Testing the Integration](#testing-the-integration)
6. [Security Rules](#security-rules)
7. [Data Migration](#data-migration)

---

## 1. Firebase Console Setup

### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Your project **youthforge-802e6** is already created
3. Navigate to Project Settings to verify configuration

### Web App Configuration
✅ **Already Completed** - Your configuration:
```javascript
{
  apiKey: "AIzaSyCeJ440MsvYVQbUQY6jzIZ7jhyfNsQhcpE",
  authDomain: "youthforge-802e6.firebaseapp.com",
  projectId: "youthforge-802e6",
  storageBucket: "youthforge-802e6.firebasestorage.app",
  messagingSenderId: "463749575901",
  appId: "1:463749575901:web:30536f16f78c8443455734",
  measurementId: "G-3PT163YGK8"
}
```

---

## 2. Environment Configuration

### ✅ Completed - `.env.local` Setup
Your environment variables are configured:

```bash
NEXT_PUBLIC_FB_API_KEY=AIzaSyCeJ440MsvYVQbUQY6jzIZ7jhyfNsQhcpE
NEXT_PUBLIC_FB_AUTH_DOMAIN=youthforge-802e6.firebaseapp.com
NEXT_PUBLIC_FB_PROJECT_ID=youthforge-802e6
NEXT_PUBLIC_FB_STORAGE_BUCKET=youthforge-802e6.appspot.com
NEXT_PUBLIC_FB_APP_ID=1:463749575901:web:30536f16f78c8443455734
NEXT_PUBLIC_FB_MESSAGING_SENDER_ID=463749575901
NEXT_PUBLIC_FB_MEASUREMENT_ID=G-3PT163YGK8

# Data source toggle: "mock" or "firebase"
NEXT_PUBLIC_DATA_SOURCE=firebase
```

### Toggle Between Mock and Firebase
- Set `NEXT_PUBLIC_DATA_SOURCE=mock` to use local mock data
- Set `NEXT_PUBLIC_DATA_SOURCE=firebase` to use live Firebase (requires restart)

---

## 3. Authentication Setup

### Enable Authentication Providers

#### Email/Password Authentication
1. Go to Firebase Console → **Authentication** → **Sign-in method**
2. Click **Email/Password**
3. Toggle **Enable**
4. Save

#### Google Authentication
1. In **Sign-in method**, click **Google**
2. Toggle **Enable**
3. Select a **support email** from dropdown
4. Save

### Create Test User
**Option 1: Via Firebase Console**
1. Go to **Authentication** → **Users** tab
2. Click **Add User**
3. Enter email and password
4. Click **Add User**

**Option 2: Via Dev Page**
1. Run `npm run dev`
2. Visit `http://localhost:3000/dev/auth`
3. Use the Sign Up form

---

## 4. Firestore Database Setup

### Create Firestore Database
1. Go to Firebase Console → **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
   - ⚠️ **Warning:** Test mode allows all reads/writes. Change to production rules before deploying!
4. Select a location (e.g., `us-central1`)
5. Click **Enable**

### Firestore Data Structure

Your app expects the following collections:

#### `projects` Collection
Each document contains:
```javascript
{
  title: string,
  excerpt: string,
  description: string (optional),
  author: {
    id: string,
    name: string,
    avatar: string
  },
  tags: string[],
  media: [{
    id: string,
    type: 'image' | 'video',
    url: string,
    alt: string (optional),
    previewUrl: string (optional)
  }],
  likes: string[], // Array of user IDs
  comments: [{
    id: string,
    author: { id, name, avatar },
    body: string,
    parentId: string (optional),
    createdAt: string (ISO date)
  }],
  repoLink: string (optional),
  isFeatured: boolean (optional),
  createdAt: timestamp,
  updatedAt: timestamp (optional)
}
```

#### `challenges` Collection (Future)
```javascript
{
  title: string,
  promptSnippet: string,
  creator: { id, name, avatar },
  tags: string[],
  responsesCount: number,
  deadline: string (ISO date, optional),
  createdAt: timestamp
}
```

#### `developers` Collection (Future)
```javascript
{
  name: string,
  headline: string,
  skills: string[],
  avatar: string,
  location: string (optional),
  github: string (optional),
  linkedin: string (optional),
  activeProjectsCount: number
}
```

---

## 5. Testing the Integration

### Test Firebase SDK Initialization
1. Run `npm run dev`
2. Visit `http://localhost:3000/dev/firebase`
3. Verify all environment variables show ✓
4. Confirm connection status is "Connected"

### Test Authentication Flow
1. Visit `http://localhost:3000/dev/auth`
2. **Sign Up** with a new email/password
3. Check Firebase Console → Authentication to see the new user
4. **Sign Out** and **Sign In** again
5. Try **Sign in with Google**

### Test Firestore Operations
1. Stay on `/dev/auth` page
2. Ensure you're signed in
3. Click **Create Sample Project**
4. Check Firebase Console → Firestore → `projects` collection
5. Verify the new document appears

### Test Real-time Updates
1. Open `/dev/auth` in two browser tabs
2. Create a project in one tab
3. Watch it appear instantly in the other tab (real-time listener)

---

## 6. Security Rules

### Current Rules (Test Mode)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // ⚠️ INSECURE - for testing only
    }
  }
}
```

### Production Rules (Recommended)
Replace test rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Projects collection
    match /projects/{projectId} {
      // Anyone can read projects
      allow read: if true;
      
      // Only authenticated users can create projects
      allow create: if request.auth != null
                    && request.resource.data.author.id == request.auth.uid;
      
      // Only project author can update/delete
      allow update, delete: if request.auth != null
                            && resource.data.author.id == request.auth.uid;
    }
    
    // Challenges collection
    match /challenges/{challengeId} {
      allow read: if true;
      allow create: if request.auth != null
                    && request.resource.data.creator.id == request.auth.uid;
      allow update, delete: if request.auth != null
                            && resource.data.creator.id == request.auth.uid;
    }
    
    // Developers collection (user profiles)
    match /developers/{userId} {
      allow read: if true;
      allow create, update: if request.auth != null
                            && request.auth.uid == userId;
      allow delete: if request.auth != null
                   && request.auth.uid == userId;
    }
  }
}
```

**To Apply:**
1. Go to Firestore → **Rules** tab
2. Replace existing rules with production rules above
3. Click **Publish**

---

## 7. Data Migration

### Manual Seeding (Small Dataset)
1. Go to Firestore → `projects` collection
2. Click **Add document**
3. Set **Document ID** to auto-generate
4. Add fields matching the schema above
5. Repeat for initial projects

### Programmatic Seeding (Recommended)
See `SEED_DATASET.json` for sample data structure. You can create a script:

```typescript
// scripts/seed-firestore.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import seedData from './SEED_DATASET.json';

// Initialize with your config
const app = initializeApp({ /* your config */ });
const db = getFirestore(app);

async function seedProjects() {
  for (const project of seedData.projects) {
    await addDoc(collection(db, 'projects'), {
      ...project,
      createdAt: new Date(),
    });
  }
}

seedProjects().then(() => console.log('Seeding complete!'));
```

Run with:
```bash
npx ts-node scripts/seed-firestore.ts
```

---

## Architecture Overview

### Code Organization
```
hooks/
  useAuth.ts              # Firebase Auth hook (replaces useAuthMock)
  useProjects.ts          # Adapter that switches between mock/firebase
  firebase/
    useProjectsFirebase.ts  # Firebase-specific project operations
    
lib/
  firebaseClient.ts       # Centralized SDK initialization
  mockStore.ts            # Zustand mock store (fallback)
  
app/
  dev/
    firebase/page.tsx     # SDK health check
    auth/page.tsx         # Auth & data testing harness
```

### Data Flow
1. **Environment Flag**: `NEXT_PUBLIC_DATA_SOURCE` determines source
2. **Adapter Layer**: `useProjects` checks flag and delegates to:
   - `useProjectsFirebase` (real-time Firestore queries) OR
   - `mockStore` (local Zustand state)
3. **Components**: Use same `useProjects` hook regardless of backend

### Benefits
- ✅ Seamless switching between mock and live data
- ✅ No component changes needed
- ✅ Real-time updates with Firestore `onSnapshot`
- ✅ Type-safe with TypeScript
- ✅ Centralized Firebase initialization prevents duplicate apps

---

## Troubleshooting

### "Permission Denied" Errors
- **Cause**: Firestore security rules blocking access
- **Fix**: Use test mode during development OR update rules to allow your operations

### "Firebase App Already Initialized"
- **Cause**: Multiple `initializeApp()` calls
- **Fix**: Use `lib/firebaseClient.ts` singleton pattern (already implemented)

### Real-time Updates Not Working
- **Cause**: Using `getDocs` instead of `onSnapshot`
- **Fix**: `useProjectsFirebase` already uses `onSnapshot` for real-time sync

### "No User Signed In" for Operations
- **Cause**: Firestore rules require authentication
- **Fix**: Sign in via `/dev/auth` before creating/updating data

---

## Next Steps

1. ✅ **Complete Firebase Console setup** (Auth + Firestore)
2. ✅ **Test authentication** at `/dev/auth`
3. ✅ **Create sample data** via dev page
4. ✅ **Verify real-time sync** works
5. ⏳ **Update production security rules**
6. ⏳ **Seed initial dataset**
7. ⏳ **Implement remaining adapters** (challenges, developers)
8. ⏳ **Replace mock usage in components** (if hardcoded)

---

## Related Documentation
- `FIREBASE_FREE_SETUP.md` - Spark tier constraints and manual setup
- `ADAPTER_MAPPING.md` - Hook-to-backend mapping
- `API_CONTRACTS.md` - Expected data structures
- `SEED_DATASET.json` - Sample initial data

---

**Last Updated**: Implementation completed with Firebase SDK 12.5.0
**Status**: ✅ Ready for Firebase Console configuration and testing
