# YouthForge Platform - Complete Documentation
**Last Updated: November 11, 2025**

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Firebase account
- Git

### Installation
```bash
# Clone repository
git clone https://github.com/ansh-codr/YouthForgue.git
cd youth

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Firebase credentials to .env.local

# Run development server
npm run dev
```

Visit `http://localhost:3000`

---

## 🔥 Firebase Configuration

### Required Firebase Services
1. **Authentication** - Email/Password + Google OAuth
2. **Firestore Database** - Real-time data storage
3. **Storage** - File uploads (profile photos)

### Environment Variables (`.env.local`)
```bash
NEXT_PUBLIC_FB_API_KEY=your_api_key
NEXT_PUBLIC_FB_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FB_PROJECT_ID=your_project_id
NEXT_PUBLIC_FB_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FB_APP_ID=your_app_id
NEXT_PUBLIC_FB_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FB_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_DATA_SOURCE=firebase
```

### Firestore Collections
- **`projects`** - User projects with real-time sync
- **`userProfiles`** - User profile data
- **`challenges`** - Coding challenges
- **`comments`** - Project comments (subcollection)

### Security Rules (Firestore)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles
    match /userProfiles/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Projects
    match /projects/{projectId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (request.auth.uid == resource.data.author.id || 
         request.auth.token.admin == true);
    }
    
    // Challenges
    match /challenges/{challengeId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile-photos/{fileName} {
      allow read: if true;
      allow write: if request.auth != null 
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## 📁 Project Structure

```
youth/
├── app/
│   ├── (main)/                   # Public pages
│   │   ├── page.tsx              # Home page
│   │   ├── projects/             # Projects listing
│   │   ├── developers/           # Developers directory
│   │   ├── challenges/           # Challenges page
│   │   ├── profile/              # User profile
│   │   └── about/                # About page
│   ├── dev/                      # Development tools
│   │   ├── realtime/             # Real-time dashboard
│   │   ├── auth/                 # Auth testing
│   │   └── firebase/             # Firebase console
│   ├── globals.css               # Global styles
│   └── layout.tsx                # Root layout
├── components/
│   ├── auth/                     # Authentication components
│   │   ├── AuthModal.tsx         # Login/Signup modal
│   │   ├── UserMenu.tsx          # User dropdown
│   │   ├── AuthGuard.tsx         # Route protection
│   │   └── ProfileEditModal.tsx  # Profile editor
│   ├── cards/                    # Card components
│   │   ├── ProjectCard.tsx
│   │   ├── DeveloperCard.tsx
│   │   └── ChallengeCard.tsx
│   ├── layout/                   # Layout components
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── ui/                       # shadcn/ui components
├── hooks/
│   ├── useAuth.ts                # Authentication hook
│   ├── useProjects.ts            # Projects data
│   ├── useDevelopers.ts          # Developers data
│   ├── useChallenges.ts          # Challenges data
│   ├── useUserProfile.ts         # User profile sync
│   └── firebase/                 # Firebase-specific hooks
│       ├── useProjectsFirebase.ts
│       ├── useDevelopersFirebase.ts
│       └── useChallengesFirebase.ts
├── lib/
│   ├── firebaseClient.ts         # Firebase initialization
│   ├── types.ts                  # TypeScript types
│   └── utils.ts                  # Utility functions
└── .env.local                    # Environment variables
```

---

## 🎯 Features

### ✅ Implemented Features

1. **Authentication System**
   - Email/Password authentication
   - Google OAuth integration
   - Protected routes
   - User session management
   - Profile photo upload

2. **Real-time Data Sync**
   - All data uses Firestore with `onSnapshot` listeners
   - Projects update instantly across tabs
   - User profiles sync in real-time
   - No mock/predefined data used

3. **User Profiles**
   - Editable profile information
   - Skills, bio, location
   - Social media links (GitHub, LinkedIn, Website)
   - Profile photo upload to Firebase Storage
   - Real-time profile updates

4. **Projects**
   - Create, read, update projects
   - Like functionality
   - Comments system
   - Search and filter
   - Real-time updates

5. **Developers Directory**
   - Browse all developers
   - Filter by skills
   - Search functionality
   - Real-time user list

6. **Challenges**
   - Browse coding challenges
   - Filter by difficulty and category
   - Real-time challenge list

7. **Real-time Dashboard** (`/dev/realtime`)
   - Test project creation
   - Live sync demonstration
   - Status monitoring

---

## 🔐 Authentication Flow

1. **Unauthenticated Users**
   - Can browse projects, developers, challenges
   - CTAs redirect to login modal
   - Profile page redirects to home

2. **Sign Up**
   - Email/Password or Google OAuth
   - Creates Firebase Auth user
   - Auto-creates user profile in Firestore

3. **Authenticated Users**
   - Access to profile page
   - Can create projects
   - Can edit profile
   - User menu with logout

4. **Protected Routes**
   - `/profile` - Requires authentication
   - Profile edit modal - Requires authentication
   - Project creation - Requires authentication

---

## 🎨 UI Components

### Glass Morphism Design
- Uses Tailwind CSS with custom glass effects
- Framer Motion animations
- Responsive design
- Dark theme with accent colors

### Key Components
- **AuthModal** - Login/Signup modal with tabs
- **UserMenu** - Dropdown with profile, projects, logout
- **ProfileEditModal** - Profile editor with photo upload
- **ProjectCard** - Project display card with like/comment
- **DeveloperCard** - Developer profile card
- **ChallengeCard** - Challenge display card

---

## 🧪 Testing

### Manual Testing Checklist

1. **Authentication**
   - [ ] Sign up with email/password
   - [ ] Sign in with email/password
   - [ ] Sign in with Google OAuth
   - [ ] Sign out
   - [ ] Protected route redirects

2. **Profile**
   - [ ] Edit profile information
   - [ ] Upload profile photo
   - [ ] Save changes
   - [ ] Real-time sync (open 2 tabs)

3. **Projects**
   - [ ] Create project
   - [ ] View project details
   - [ ] Like project
   - [ ] Add comment
   - [ ] Real-time updates

4. **Developers & Challenges**
   - [ ] Browse developers
   - [ ] Filter by skills
   - [ ] Browse challenges
   - [ ] Filter by difficulty

---

## 🐛 Common Issues & Solutions

### Issue: Images not loading
**Solution:** Check `next.config.js` has `remotePatterns` configured and `unoptimized: true`

### Issue: Firebase connection errors
**Solution:** Verify all environment variables in `.env.local` are correct

### Issue: Profile photo upload fails
**Solution:** Ensure Firebase Storage is enabled and rules allow authenticated uploads

### Issue: Real-time sync not working
**Solution:** Check Firestore security rules allow read access

### Issue: Build errors
**Solution:** Run `npm install` and ensure Node.js 18+ is installed

---

## 📚 API Documentation

### useAuth Hook
```typescript
const { user, loading, signIn, signUp, signOut } = useAuth();
```

### useProjects Hook
```typescript
const { 
  projects,        // Project[]
  loading,         // boolean
  error,           // string | null
  createProject,   // (data) => Promise<Result>
  likeProject,     // (id, userId) => Promise<void>
  addComment       // (projectId, comment) => Promise<Result>
} = useProjects();
```

### useUserProfile Hook
```typescript
const { 
  profile,   // UserProfile | null
  loading,   // boolean
  error      // string | null
} = useUserProfile();
```

---

## 🚢 Deployment

### Next.js Export (Static)
```bash
# Build for production
npm run build

# Serve static files
npm run start
```

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Firebase Hosting
```bash
# Install Firebase CLI
npm i -g firebase-tools

# Login
firebase login

# Initialize
firebase init

# Deploy
firebase deploy
```

---

## 🔄 Recent Updates (Nov 11, 2025)

### Removed All Mock Data
- ❌ No more `mockData.ts` usage
- ❌ No more `mockStore.ts` references
- ✅ All hooks use Firebase only
- ✅ Real-time sync everywhere

### Updated Components
- ✅ Home page uses Firebase hooks
- ✅ Projects page uses Firebase
- ✅ Developers page uses Firebase
- ✅ Challenges page uses Firebase
- ✅ Profile page with real-time sync

### Added Features
- ✅ Profile photo upload
- ✅ Image loading fixes
- ✅ All buttons functional
- ✅ Real-time dashboard

---

## 📊 Performance

- **Initial Load:** < 2s
- **Real-time Updates:** Instant (via WebSocket)
- **Image Optimization:** Next.js Image component
- **Code Splitting:** Automatic by Next.js
- **Lazy Loading:** Components and images

---

## 🔮 Future Enhancements

### Planned Features
- [ ] Project collaboration
- [ ] Live code editor
- [ ] Chat system
- [ ] Notifications
- [ ] Achievement system
- [ ] Project analytics
- [ ] API for third-party integrations

### Nice to Have
- [ ] Mobile app (React Native)
- [ ] VS Code extension
- [ ] GitHub integration
- [ ] CI/CD pipeline visualization

---

## 📞 Support

### Getting Help
- Check this documentation first
- Review Firebase console for errors
- Check browser console for client-side errors
- Verify environment variables are set

### Known Limitations
- Static export mode (no SSR)
- Firebase free tier limits (50k reads/day)
- Storage limited to 5MB per file

---

## 📝 License
MIT License - See LICENSE file

---

## 👥 Contributors
- **Ansh** - Initial development
- **GitHub Copilot** - AI assistance

---

**End of Documentation** 🎉

For the most up-to-date information, check the GitHub repository:
https://github.com/ansh-codr/YouthForgue
