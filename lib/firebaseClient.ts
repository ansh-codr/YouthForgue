import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAnalytics, type Analytics } from 'firebase/analytics';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? process.env.NEXT_PUBLIC_FB_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FB_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? process.env.NEXT_PUBLIC_FB_APP_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? process.env.NEXT_PUBLIC_FB_MESSAGING_SENDER_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? process.env.NEXT_PUBLIC_FB_MEASUREMENT_ID,
};

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length && process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  console.warn(
    '[firebaseClient] Missing Firebase config values:',
    missingKeys.join(', ')
  );
}

let cachedApp: FirebaseApp | null = null;

export const getFirebaseApp = (): FirebaseApp => {
  // Guard against server-side/build-time initialization
  if (typeof window === 'undefined') {
    throw new Error('[firebaseClient] Firebase can only be initialized in the browser');
  }

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
export const getFirebaseStorage = (): FirebaseStorage => getStorage(getFirebaseApp());

// Analytics is only available in browser environment
export const getFirebaseAnalytics = (): Analytics | null => {
  if (typeof window === 'undefined') return null;
  return getAnalytics(getFirebaseApp());
};
