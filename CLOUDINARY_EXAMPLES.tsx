/**
 * Example: Adding Image Upload to Project Creation Form
 * 
 * This shows how to add Cloudinary image upload to your project creation page
 */

import { useState } from 'react';
import { uploadProjectImage, validateImageFile } from '@/lib/cloudinary';
import { toast } from 'sonner';

export function ProjectCreateFormExample() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Validate file (size, format)
      validateImageFile(file, 10); // 10MB limit for project images
      
      setImageFile(file);
      
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Upload image when form submits
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setUploading(true);
      
      // First create the project to get an ID
      const projectId = 'project_123'; // This comes from Firestore after creating the project
      
      // Upload image if present
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadProjectImage(imageFile, projectId);
        toast.success('Image uploaded! ✅');
      }
      
      // Save project with image URL to Firestore
      // ... your Firestore save code here
      
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Image Upload Field */}
      <div>
        <label>Project Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={uploading}
        />
        
        {/* Image Preview */}
        {imagePreview && (
          <img 
            src={imagePreview} 
            alt="Preview" 
            style={{ width: 200, height: 200, objectFit: 'cover' }}
          />
        )}
      </div>

      <button type="submit" disabled={uploading}>
        {uploading ? 'Uploading...' : 'Create Project'}
      </button>
    </form>
  );
}

/**
 * Example: Multiple Image Upload for Project Gallery
 */

export function ProjectGalleryUploadExample() {
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleMultipleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate each file
    const validFiles = files.filter(file => {
      try {
        validateImageFile(file, 10);
        return true;
      } catch (error: any) {
        toast.error(`${file.name}: ${error.message}`);
        return false;
      }
    });

    setImages(prev => [...prev, ...validFiles]);
  };

  const uploadAllImages = async (projectId: string) => {
    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      // Upload images sequentially (or use Promise.all for parallel)
      for (const image of images) {
        const url = await uploadProjectImage(image, projectId);
        uploadedUrls.push(url);
      }

      toast.success(`${uploadedUrls.length} images uploaded! ✅`);
      return uploadedUrls;
      
    } catch (error: any) {
      toast.error('Failed to upload some images');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleMultipleImages}
        disabled={uploading}
      />
      
      <div>
        {images.map((img, idx) => (
          <div key={idx}>
            <span>{img.name}</span>
            <button onClick={() => setImages(images.filter((_, i) => i !== idx))}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <button onClick={() => uploadAllImages('project_123')} disabled={uploading}>
        {uploading ? 'Uploading...' : `Upload ${images.length} Images`}
      </button>
    </div>
  );
}

/**
 * Example: Image URL Transformation
 * 
 * Get different sizes/formats from the same uploaded image
 */

import { getThumbnailUrl, getTransformedImageUrl } from '@/lib/cloudinary';

export function ImageTransformationExample() {
  const originalUrl = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';

  // Get thumbnail (200x200)
  const thumbnail = getThumbnailUrl(originalUrl, 200);

  // Get medium size (800x600)
  const medium = getTransformedImageUrl(originalUrl, 'c_limit,w_800,h_600,q_auto');

  // Get square crop (500x500)
  const square = getTransformedImageUrl(originalUrl, 'c_fill,w_500,h_500,q_auto');

  // Get with blur effect
  const blurred = getTransformedImageUrl(originalUrl, 'e_blur:400');

  return (
    <div>
      <img src={thumbnail} alt="Thumbnail" />
      <img src={medium} alt="Medium" />
      <img src={square} alt="Square" />
      <img src={blurred} alt="Blurred" />
    </div>
  );
}

/**
 * Quick Integration Checklist
 * 
 * 1. ✅ Add Cloudinary credentials to .env.local
 * 2. ✅ Import utilities: import { uploadProjectImage, validateImageFile } from '@/lib/cloudinary'
 * 3. ✅ Add file input: <input type="file" accept="image/*" onChange={handleImageChange} />
 * 4. ✅ Validate file: validateImageFile(file, maxSizeMB)
 * 5. ✅ Upload on submit: const url = await uploadProjectImage(file, projectId)
 * 6. ✅ Save URL to Firestore
 * 7. ✅ Display image: <img src={url} alt="..." />
 * 
 * That's it! 🚀
 */
