'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { getFirebaseDb, getFirebaseAuth } from '@/lib/firebaseClient';
import { doc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { uploadProfilePhoto, validateImageFile } from '@/lib/cloudinary';
import Image from 'next/image';

interface ProfileEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ProfileEditModal({ open, onOpenChange, onSuccess }: ProfileEditModalProps) {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    location: '',
    website: '',
    github: '',
    linkedin: '',
    skills: '',
  });

  // Load existing profile data when modal opens
  useEffect(() => {
    if (open && profile) {
      setFormData({
        displayName: profile.displayName || user?.displayName || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        github: profile.github || '',
        linkedin: profile.linkedin || '',
        skills: profile.skills?.join(', ') || '',
      });
      setPhotoPreview(user?.photoURL || null);
    } else if (open && user) {
      setFormData(prev => ({
        ...prev,
        displayName: user.displayName || '',
      }));
      setPhotoPreview(user?.photoURL || null);
    }
  }, [open, profile, user]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        validateImageFile(file, 5); // 5MB limit
        
        setPhotoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } catch (error: any) {
        toast.error(error.message);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(user?.photoURL || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile || !user) return null;

    setUploading(true);
    try {
      // Upload to Cloudinary
      const downloadURL = await uploadProfilePhoto(photoFile, user.uid);
      
      // Update Firebase Auth profile
      const auth = getFirebaseAuth();
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: downloadURL });
      }
      
      return downloadURL;
    } catch (error: any) {
      console.error('Photo upload error:', error);
      toast.error(error.message || 'Failed to upload photo');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Upload photo first if there's a new one
      let photoURL = user.photoURL;
      if (photoFile) {
        const uploadedURL = await uploadPhoto();
        if (uploadedURL) {
          photoURL = uploadedURL;
        }
      }

      const db = getFirebaseDb();
      const userProfileRef = doc(db, 'userProfiles', user.uid);

      const profileData = {
        uid: user.uid,
        displayName: formData.displayName || user.displayName || '',
        email: user.email || '',
        photoURL: photoURL || '',
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        github: formData.github,
        linkedin: formData.linkedin,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(userProfileRef, profileData, { merge: true });

      // Update Firebase Auth display name if changed
      if (formData.displayName && formData.displayName !== user.displayName) {
        const auth = getFirebaseAuth();
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { displayName: formData.displayName });
        }
      }

      toast.success('Profile updated successfully! 🎉');
      onOpenChange(false);
      onSuccess?.();
      
      // Reset photo state
      setPhotoFile(null);
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl glass-card border-white/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
            Edit Profile
          </DialogTitle>
          <DialogDescription>
            Update your profile information and showcase your skills
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Profile Photo Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Profile Photo</Label>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center text-white text-2xl font-bold border-2 border-white/20">
                {photoPreview ? (
                  <Image
                    src={photoPreview}
                    alt="Profile preview"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  formData.displayName.charAt(0).toUpperCase() || 'U'
                )}
                {photoFile && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-0 right-0 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                    disabled={loading}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="glass-button-ghost"
                  disabled={loading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {photoFile ? 'Change Photo' : 'Upload Photo'}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  JPG, PNG or GIF. Max 5MB.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-sm font-medium">
              Display Name
            </Label>
            <Input
              id="displayName"
              type="text"
              placeholder="Your name"
              value={formData.displayName}
              onChange={(e) => handleChange('displayName', e.target.value)}
              className="glass-input"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-medium">
              Bio
            </Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              className="glass-input min-h-[100px]"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">
                Location
              </Label>
              <Input
                id="location"
                type="text"
                placeholder="City, Country"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="glass-input"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm font-medium">
                Website
              </Label>
              <Input
                id="website"
                type="url"
                placeholder="https://yourwebsite.com"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                className="glass-input"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="github" className="text-sm font-medium">
                GitHub Username
              </Label>
              <Input
                id="github"
                type="text"
                placeholder="yourusername"
                value={formData.github}
                onChange={(e) => handleChange('github', e.target.value)}
                className="glass-input"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin" className="text-sm font-medium">
                LinkedIn Username
              </Label>
              <Input
                id="linkedin"
                type="text"
                placeholder="yourusername"
                value={formData.linkedin}
                onChange={(e) => handleChange('linkedin', e.target.value)}
                className="glass-input"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills" className="text-sm font-medium">
              Skills (comma-separated)
            </Label>
            <Input
              id="skills"
              type="text"
              placeholder="React, TypeScript, Node.js, Python"
              value={formData.skills}
              onChange={(e) => handleChange('skills', e.target.value)}
              className="glass-input"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Separate skills with commas
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1 glass-button"
              disabled={loading || uploading}
            >
              {(loading || uploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {uploading ? 'Uploading...' : loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button 
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="glass-button-ghost"
              disabled={loading || uploading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
