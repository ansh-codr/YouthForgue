export const PROJECT_PAGE_SIZE = 12;
export const PROJECT_FEED_CACHE_TTL_MS = 30_000;
export const PROJECT_IMAGE_LIMIT = 5;
export const PROJECT_IMAGE_MAX_BYTES = 1_000_000; // 1MB
export const AVATAR_MAX_BYTES = 200_000; // 200KB cap per requirements
export const LIKE_COOLDOWN_MS = 1_000;
export const COMMENT_PAGE_SIZE = 20;
export const COMMENT_LISTENER_LIMIT = 50;
export const PROJECT_LIKE_RECONCILIATION_DELAY_MS = 1_500;
export const UPLOAD_MAX_RETRIES = 3;
export const UPLOAD_RETRY_BACKOFF_MS = 700;
export const DEFAULT_IMAGE_MAX_DIMENSION = 1920;
export const DEFAULT_IMAGE_MIN_DIMENSION = 320;
export const PROJECT_MEDIA_STORAGE_ROOT = 'projects';
export const REPORTS_COLLECTION = 'projectReports';
export const MODERATION_LOG_LIMIT = 50;

export const FEATURE_FLAGS = {
  useFirebaseAdapter: process.env.NEXT_PUBLIC_USE_FIREBASE === 'true',
};

export const FIREBASE_ENV_VARS = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? process.env.NEXT_PUBLIC_FB_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FB_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? process.env.NEXT_PUBLIC_FB_APP_ID,
};

export const ADAPTER_KEYS = {
  firebase: 'firebase',
  mock: 'mock',
} as const;

export const PROJECT_SORT_OPTIONS = ['new', 'popular', 'featured'] as const;

export const FIRESTORE_TIMESTAMP_FIELDS = ['createdAt', 'updatedAt', 'deletedAt'];
