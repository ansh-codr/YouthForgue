/**
 * Cloudinary Image Upload Utilities
 * 
 * This module provides utilities for uploading images to Cloudinary.
 * Cloudinary is used for all image storage instead of Firebase Storage.
 */

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  [key: string]: any;
}

interface UploadOptions {
  folder?: string;
  transformation?: string;
  tags?: string[];
}

/**
 * Upload an image to Cloudinary
 * @param file - The file to upload
 * @param options - Upload options (folder, transformation, tags)
 * @returns The secure URL of the uploaded image
 */
export async function uploadImageToCloudinary(
  file: File,
  options: UploadOptions = {}
): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary configuration is missing. Please add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to your .env.local file'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  // Add optional parameters
  if (options.folder) {
    formData.append('folder', options.folder);
  }

  if (options.tags && options.tags.length > 0) {
    formData.append('tags', options.tags.join(','));
  }

  if (options.transformation) {
    formData.append('transformation', options.transformation);
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to upload image to Cloudinary');
    }

    const data: CloudinaryUploadResponse = await response.json();
    return data.secure_url;
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    throw new Error(error.message || 'Failed to upload image');
  }
}

/**
 * Upload a profile photo to Cloudinary
 * @param file - The image file
 * @param userId - The user ID for organizing uploads
 * @returns The secure URL of the uploaded image
 */
export async function uploadProfilePhoto(file: File, userId: string): Promise<string> {
  return uploadImageToCloudinary(file, {
    folder: `youthforge/profile-photos/${userId}`,
    tags: ['profile', 'user', userId],
    transformation: 'c_fill,g_face,h_400,w_400', // Crop to 400x400, focus on face
  });
}

/**
 * Upload a project image to Cloudinary
 * @param file - The image file
 * @param projectId - The project ID for organizing uploads
 * @returns The secure URL of the uploaded image
 */
export async function uploadProjectImage(file: File, projectId: string): Promise<string> {
  return uploadImageToCloudinary(file, {
    folder: `youthforge/project-media/${projectId}`,
    tags: ['project', projectId],
    transformation: 'c_limit,w_1920,h_1080,q_auto', // Max 1920x1080, auto quality
  });
}

/**
 * Validate image file before upload
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in MB (default: 5MB)
 * @returns true if valid, throws error if invalid
 */
export function validateImageFile(file: File, maxSizeMB: number = 5): boolean {
  // Check file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select an image file');
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`Image size should be less than ${maxSizeMB}MB`);
  }

  // Check supported formats
  const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!supportedFormats.includes(file.type)) {
    throw new Error('Supported formats: JPEG, PNG, GIF, WebP');
  }

  return true;
}

/**
 * Generate Cloudinary transformation URL
 * @param imageUrl - Original Cloudinary URL
 * @param transformation - Transformation string (e.g., "w_300,h_300,c_fill")
 * @returns Transformed image URL
 */
export function getTransformedImageUrl(imageUrl: string, transformation: string): string {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }

  const parts = imageUrl.split('/upload/');
  if (parts.length !== 2) {
    return imageUrl;
  }

  return `${parts[0]}/upload/${transformation}/${parts[1]}`;
}

/**
 * Get optimized thumbnail URL from Cloudinary image
 * @param imageUrl - Original Cloudinary URL
 * @param size - Thumbnail size (default: 200)
 * @returns Optimized thumbnail URL
 */
export function getThumbnailUrl(imageUrl: string, size: number = 200): string {
  return getTransformedImageUrl(imageUrl, `c_fill,w_${size},h_${size},q_auto,f_auto`);
}
