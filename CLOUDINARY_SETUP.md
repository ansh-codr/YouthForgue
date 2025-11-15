# Cloudinary Setup Guide

This project uses **Cloudinary** for all image storage instead of Firebase Storage. This reduces Firebase costs and provides better image optimization features.

## Why Cloudinary?

- ✅ **Free tier**: 25 GB storage, 25 GB bandwidth/month
- ✅ **Automatic optimization**: Auto-format, auto-quality
- ✅ **Image transformations**: Resize, crop, filters on-the-fly
- ✅ **CDN delivery**: Fast global image delivery
- ✅ **No Firebase Storage costs**

## Setup Steps

### 1. Create Cloudinary Account

1. Go to: https://console.cloudinary.com/app/
2. Sign up for a free account (no credit card required)
3. You'll be redirected to the dashboard

### 2. Get Your Credentials

From the Cloudinary Dashboard:

1. **Cloud Name**: Found at the top of your dashboard
   - Example: `dxyz1234`
   
2. **Upload Preset**: Create an unsigned upload preset
   - Go to: Settings → Upload → Add upload preset
   - Click "Add upload preset"
   - Set **Signing Mode** to: **Unsigned**
   - Set **Folder** to: `youthforge` (optional, for organization)
   - Set **Access Mode** to: **Public**
   - Click **Save**
   - Copy the **Preset name** (e.g., `youthforge_uploads`)

### 3. Add to Environment Variables

Update your `.env.local` file:

```bash
# Cloudinary Configuration (for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_here
```

**Example:**
```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxyz1234
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=youthforge_uploads
```

### 4. Restart Development Server

```bash
npm run dev
```

## Image Upload Features

### Profile Photos
- **Location**: `youthforge/profile-photos/{userId}/`
- **Transformation**: Auto-cropped to 400x400, face-focused
- **Format**: Auto-optimized (WebP when supported)
- **Size limit**: 5MB

### Project Images
- **Location**: `youthforge/project-media/{projectId}/`
- **Transformation**: Max 1920x1080, auto-quality
- **Format**: Auto-optimized
- **Size limit**: 10MB (can be adjusted)

## Usage in Code

### Upload Profile Photo
```typescript
import { uploadProfilePhoto } from '@/lib/cloudinary';

const photoUrl = await uploadProfilePhoto(file, userId);
```

### Upload Project Image
```typescript
import { uploadProjectImage } from '@/lib/cloudinary';

const imageUrl = await uploadProjectImage(file, projectId);
```

### Validate Image
```typescript
import { validateImageFile } from '@/lib/cloudinary';

try {
  validateImageFile(file, 5); // 5MB limit
  // File is valid
} catch (error) {
  // Show error message
}
```

### Get Thumbnail
```typescript
import { getThumbnailUrl } from '@/lib/cloudinary';

const thumbnailUrl = getThumbnailUrl(originalUrl, 200); // 200x200px
```

## Cloudinary Dashboard Features

### View Uploads
- Media Library: https://console.cloudinary.com/console/media_library
- See all uploaded images organized by folder

### Usage Stats
- Dashboard: https://console.cloudinary.com/console
- Monitor storage and bandwidth usage

### Image Transformations
Cloudinary automatically optimizes images:
- **Format**: Converts to WebP for browsers that support it
- **Quality**: Adjusts quality based on content
- **Compression**: Reduces file size without visible quality loss
- **Responsive**: Delivers right size for device

## Free Tier Limits

- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25 credits/month
- **Admin API**: 500 calls/hour

Perfect for a youth creator platform! 🚀

## Troubleshooting

### "Cloudinary configuration is missing"
- Check `.env.local` has both `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
- Restart dev server after adding env variables

### "Upload failed"
- Verify upload preset is set to **Unsigned**
- Check file size is under limit
- Verify file is a valid image format

### Images not loading
- Check Cloudinary Media Library to see if upload succeeded
- Verify the returned URL is accessible
- Check browser console for CORS errors (shouldn't happen with Cloudinary)

## Migration from Firebase Storage

All new uploads automatically go to Cloudinary. Old Firebase Storage images (if any) will continue to work, but new uploads use Cloudinary.

## Additional Resources

- Cloudinary Docs: https://cloudinary.com/documentation
- Upload Presets: https://cloudinary.com/documentation/upload_presets
- Image Transformations: https://cloudinary.com/documentation/image_transformations

---

**Current Status**: ✅ Integrated - Profile photo uploads working with Cloudinary
