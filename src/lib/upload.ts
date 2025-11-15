import imageCompression from 'browser-image-compression';
import { nanoid } from 'nanoid';
import { ref, uploadBytesResumable, getDownloadURL, type FirebaseStorage } from 'firebase/storage';
import { getFirebaseStorage } from '@/lib/firebaseClient';
import {
  DEFAULT_IMAGE_MAX_DIMENSION,
  PROJECT_IMAGE_MAX_BYTES,
  PROJECT_MEDIA_STORAGE_ROOT,
  UPLOAD_MAX_RETRIES,
  UPLOAD_RETRY_BACKOFF_MS,
} from '@/src/config/constants';

export interface UploadProgressPayload {
  fileName: string;
  progress: number;
  attempt: number;
}

export interface UploadOptions {
  maxBytes?: number;
  maxDimension?: number;
  storage?: FirebaseStorage;
  retries?: number;
  onProgress?: (payload: UploadProgressPayload) => void;
  pathPrefix?: string;
}

export interface UploadResult {
  storagePath: string;
  downloadUrl: string;
  size: number;
  width: number;
  height: number;
  contentType: string;
}

const isBrowser = typeof window !== 'undefined';

async function getImageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  if (!isBrowser) return { width: 0, height: 0 };
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

export async function compressImage(
  file: File,
  opts: { maxBytes?: number; maxDimension?: number } = {}
): Promise<File> {
  const maxSizeMB = (opts.maxBytes ?? PROJECT_IMAGE_MAX_BYTES) / (1024 * 1024);
  const maxWidthOrHeight = opts.maxDimension ?? DEFAULT_IMAGE_MAX_DIMENSION;

  try {
    return await imageCompression(file, {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker: true,
      maxIteration: 10,
    });
  } catch (err) {
    if (!isBrowser) {
      return file;
    }
    // Fallback to manual canvas compression
    if (typeof createImageBitmap === 'undefined') {
      return file;
    }
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxWidthOrHeight / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(Math.round(bitmap.width * scale), 1);
    canvas.height = Math.max(Math.round(bitmap.height * scale), 1);
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob: Blob | null = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.82));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
  }
}

async function uploadOnce(
  storage: FirebaseStorage,
  path: string,
  file: Blob,
  fileName: string,
  onProgress?: UploadOptions['onProgress'],
  attempt = 1,
): Promise<UploadResult> {
  const fileRef = ref(storage, path);
  const metadata = { contentType: file.type || 'application/octet-stream' };
  const uploadTask = uploadBytesResumable(fileRef, file, metadata);

  const result = await new Promise<UploadResult>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      snapshot => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        onProgress?.({ fileName, progress, attempt });
      },
      reject,
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        const { width, height } = await getImageDimensions(file);
        resolve({
          storagePath: path,
          downloadUrl,
          size: file.size,
          width,
          height,
          contentType: metadata.contentType,
        });
      }
    );
  });

  return result;
}

export async function uploadProjectMediaFile(
  projectId: string,
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const compressed = await compressImage(file, {
    maxBytes: options.maxBytes,
    maxDimension: options.maxDimension,
  });

  const storage = options.storage ?? getFirebaseStorage();
  const retries = options.retries ?? UPLOAD_MAX_RETRIES;
  const sanitizedName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
  const storagePath = `${options.pathPrefix ?? PROJECT_MEDIA_STORAGE_ROOT}/${projectId}/media/${Date.now()}-${nanoid(6)}-${sanitizedName}`;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      return await uploadOnce(storage, storagePath, compressed, file.name, options.onProgress, attempt);
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, UPLOAD_RETRY_BACKOFF_MS * attempt));
    }
  }

  throw new Error('uploadProjectMediaFile exhausted retries');
}
