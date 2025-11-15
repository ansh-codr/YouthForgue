import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAnalytics, type Analytics } from 'firebase/analytics';

// Centralized Firebase client initialization. Guards against duplicate apps and
// surfaces missing environment variables immediately during development.
// NOTE: Firebase Storage is NOT used - all images are stored in Cloudinary
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FB_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET,
  appId: process.env.NEXT_PUBLIC_FB_APP_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FB_MESSAGING_SENDER_ID,
  measurementId: process.env.NEXT_PUBLIC_FB_MEASUREMENT_ID,
};

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length && process.env.NODE_ENV !== 'production') {
  console.warn(
    '[firebaseClient] Missing Firebase config values:',
    missingKeys.join(', ')
  );
}

let cachedApp: FirebaseApp | null = null;

export const getFirebaseApp = (): FirebaseApp => {
  if (cachedApp) {
    return cachedApp;
  }

  if (!getApps().length) {
    cachedApp = initializeApp(firebaseConfig);
  } else {
    cachedApp = getApp();
  }

  return cachedApp;
};

export const getFirebaseAuth = (): Auth => getAuth(getFirebaseApp());
export const getFirebaseDb = (): Firestore => getFirestore(getFirebaseApp());

// Analytics is only available in browser environment
export const getFirebaseAnalytics = (): Analytics | null => {
  if (typeof window === 'undefined') return null;
  return getAnalytics(getFirebaseApp());
};
