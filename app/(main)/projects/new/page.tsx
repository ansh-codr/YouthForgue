'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Plus, X, Upload, Image as ImageIcon, ExternalLink, Github } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { uploadProjectImage, validateImageFile } from '@/lib/cloudinary';
import { toast } from 'sonner';

export default function NewProjectPage() {
  const { user } = useAuth();
  const { createProject } = useProjects();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    description: '',
    repoLink: '',
    deploymentUrl: '',
    tags: '',
    isFeatured: false,
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please sign in to create a project');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a project title');
      return;
    }

    if (!formData.excerpt.trim()) {
      toast.error('Please enter a short description');
      return;
    }

    if (!formData.repoLink.trim()) {
      toast.error('GitHub repository link is required');
      return;
    }

    // Validate GitHub URL
    const githubUrlPattern = /^https:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+/;
    if (!githubUrlPattern.test(formData.repoLink)) {
      toast.error('Please enter a valid GitHub repository URL');
      return;
    }

    setLoading(true);
    setUploading(true);
    
    try {
      // Create project first to get ID
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean);

      const tempProjectId = `temp_${Date.now()}`;
      
      // Upload images to Cloudinary
      const uploadedImageUrls: string[] = [];
      if (imageFiles.length > 0) {
        toast.info('Uploading images...');
        for (const file of imageFiles) {
          try {
            const url = await uploadProjectImage(file, tempProjectId);
            uploadedImageUrls.push(url);
          } catch (err) {
            console.error('Failed to upload image:', err);
          }
        }
      }

      const media = uploadedImageUrls.map((url, idx) => ({
        id: `img_${idx}`,
        type: 'image' as const,
        url,
        alt: `${formData.title} - Image ${idx + 1}`,
      }));

      const result = await createProject({
        title: formData.title,
        excerpt: formData.excerpt,
        description: formData.description || formData.excerpt,
        author: {
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Anonymous',
          avatar: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=random`,
        },
        tags: tags.length > 0 ? tags : ['General'],
        media,
        repoLink: formData.repoLink,
        deploymentUrl: formData.deploymentUrl || undefined,
        isFeatured: formData.isFeatured,
      });

      if (result && 'success' in result && result.success) {
        toast.success('Project created successfully! 🎉');
        router.push('/projects');
      } else if (result && 'error' in result) {
        const errorMsg = typeof result.error === 'string' ? result.error : 'Failed to create project';
        toast.error(errorMsg);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create project');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate total images (max 5)
    if (imageFiles.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    files.forEach(file => {
      try {
        validateImageFile(file, 10); // 10MB limit
        validFiles.push(file);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === files.length) {
            setImagePreviews(prev => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      } catch (error: any) {
        toast.error(`${file.name}: ${error.message}`);
      }
    });

    setImageFiles(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen">
        {/* Background */}
        <div className="fixed inset-0 -z-50">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-background to-background" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-30" />
        </div>

        {/* Header */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-white/10">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-accent hover:text-accent-secondary transition-colors mb-6"
            >
              <ArrowLeft size={20} />
              Back to Projects
            </Link>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Create New Project</h1>
              <p className="text-lg text-muted-foreground">
                Share your amazing work with the YouthForge community
              </p>
            </motion.div>
          </div>
        </section>

        {/* Form */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              onSubmit={handleSubmit}
              className="glass-card space-y-6"
            >
              {/* Project Images */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <ImageIcon className="inline mr-2 h-4 w-4" />
                  Project Images <span className="text-muted-foreground text-xs">(Max 5)</span>
                </label>
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={loading || imageFiles.length >= 5}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading || imageFiles.length >= 5}
                    className="glass-button-ghost w-full py-8 border-2 border-dashed border-white/20 hover:border-accent/50 transition-colors"
                  >
                    <Upload className="mx-auto h-8 w-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {imageFiles.length >= 5 ? 'Maximum images reached' : 'Click to upload images'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </button>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imagePreviews.map((preview, idx) => (
                        <div key={idx} className="relative group">
                          <div className="relative aspect-video rounded-lg overflow-hidden glass">
                            <Image
                              src={preview}
                              alt={`Preview ${idx + 1}`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            disabled={loading}
                          >
                            <X size={16} className="text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Project Title <span className="text-red-400">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="My Awesome Project"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="glass-input w-full"
                  disabled={loading}
                  maxLength={100}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.title.length}/100 characters
                </p>
              </div>

              {/* Excerpt */}
              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium mb-2">
                  Short Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="excerpt"
                  placeholder="A brief overview of your project (shown in cards)"
                  value={formData.excerpt}
                  onChange={(e) => handleChange('excerpt', e.target.value)}
                  className="glass-input w-full min-h-[80px]"
                  disabled={loading}
                  maxLength={200}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.excerpt.length}/200 characters
                </p>
              </div>

              {/* Full Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Full Description
                </label>
                <textarea
                  id="description"
                  placeholder="Tell us more about your project, features, tech stack, challenges you faced..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="glass-input w-full min-h-[200px]"
                  disabled={loading}
                />
              </div>

              {/* GitHub Repository Link - MANDATORY */}
              <div>
                <label htmlFor="repoLink" className="block text-sm font-medium mb-2">
                  <Github className="inline mr-2 h-4 w-4" />
                  GitHub Repository URL <span className="text-red-400">*</span>
                </label>
                <input
                  id="repoLink"
                  type="url"
                  placeholder="https://github.com/username/project-name"
                  value={formData.repoLink}
                  onChange={(e) => handleChange('repoLink', e.target.value)}
                  className="glass-input w-full"
                  disabled={loading}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Link to your GitHub repository (required)
                </p>
              </div>

              {/* Deployment URL - OPTIONAL */}
              <div>
                <label htmlFor="deploymentUrl" className="block text-sm font-medium mb-2">
                  <ExternalLink className="inline mr-2 h-4 w-4" />
                  Live Demo URL <span className="text-muted-foreground text-xs">(Optional)</span>
                </label>
                <input
                  id="deploymentUrl"
                  type="url"
                  placeholder="https://your-project.vercel.app"
                  value={formData.deploymentUrl}
                  onChange={(e) => handleChange('deploymentUrl', e.target.value)}
                  className="glass-input w-full"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Link to your deployed project (Vercel, Netlify, etc.)
                </p>
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium mb-2">
                  Tags
                </label>
                <input
                  id="tags"
                  type="text"
                  placeholder="React, TypeScript, Firebase, AI (comma-separated)"
                  value={formData.tags}
                  onChange={(e) => handleChange('tags', e.target.value)}
                  className="glass-input w-full"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Add relevant technologies and topics (comma-separated)
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => router.push('/projects')}
                  className="glass-button-ghost flex-1"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="glass-button flex-1"
                  disabled={loading || uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading Images...
                    </>
                  ) : loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Project
                    </>
                  )}
                </button>
              </div>
            </motion.form>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 glass-card border-accent/20"
            >
              <h3 className="font-bold text-lg mb-4">💡 Tips for a Great Project</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>Add 1-5 high-quality screenshots of your project in action</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>Use a clear, descriptive title that captures attention</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>GitHub repository link is mandatory - make your code accessible</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>Add a live demo URL if your project is deployed</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>Write a compelling description explaining the problem and solution</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>Add relevant tags to help others discover your work</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </section>
      </div>
    </AuthGuard>
  );
}
