'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { nanoid } from 'nanoid';
import { Upload, Loader2, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ensureUniqueSlug, slugify } from '@/src/lib/slug';
import { useCreateProject } from '@/src/hooks/useProjects';
import { getProjectsAdapter } from '@/src/lib/adapterFactory';
import { compressImage } from '@/src/lib/upload';
import {
  FEATURE_FLAGS,
  PROJECT_IMAGE_LIMIT,
  PROJECT_IMAGE_MAX_BYTES,
} from '@/src/config/constants';
import type { ProjectVisibility } from '@/src/types/project';
import type { ProjectMedia } from '@/src/types/media';

const tagsCatalog = ['AI/ML', 'Next.js', 'Firebase', 'Design', 'Web3', 'Mobile', 'Open Source', 'Productivity', 'Analytics'];

const projectSchema = z.object({
  title: z.string().min(4, 'Title must be at least 4 characters').max(120, 'Title must be under 120 characters'),
  slug: z
    .string()
    .min(4, 'Slug must have at least 4 characters')
    .max(80, 'Slug must be under 80 characters')
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens only'),
  summary: z.string().min(20, 'Summary must be at least 20 characters').max(240, 'Summary must be under 240 characters'),
  description: z.string().min(80, 'Give collaborators more context (min 80 characters)'),
  tags: z.array(z.string()).min(1, 'Add at least one tag').max(8, 'Eight tags max'),
  repoUrl: z.union([z.string().url('Must be a valid URL').max(200), z.literal('')]).optional(),
  demoUrl: z.union([z.string().url('Must be a valid URL').max(200), z.literal('')]).optional(),
  visibility: z.enum(['public', 'unlisted']),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

type UploadItem = {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
};

const defaultValues: ProjectFormValues = {
  title: '',
  slug: '',
  summary: '',
  description: '',
  tags: [],
  repoUrl: '',
  demoUrl: '',
  visibility: 'public',
};

export function ProjectForm() {
  const { user } = useAuth();
  const router = useRouter();
  const adapter = useMemo(() => getProjectsAdapter(), []);
  const createProjectMutation = useCreateProject();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
    watch,
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues,
  });

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [pending, setPending] = useState(false);
  const [slugCheckRunning, setSlugCheckRunning] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [activeTagQuery, setActiveTagQuery] = useState('');

  useEffect(() => {
    register('tags');
  }, [register]);

  useEffect(() => {
    return () => {
      uploadItems.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, [uploadItems]);

  const titleValue = watch('title');
  const slugValue = watch('slug');

  useEffect(() => {
    if (!slugManuallyEdited && titleValue) {
      setValue('slug', slugify(titleValue));
    }
  }, [titleValue, slugManuallyEdited, setValue]);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return;
    const slots = Math.max(PROJECT_IMAGE_LIMIT - uploadItems.length, 0);
    if (!slots) {
      toast({ title: 'Media limit reached', description: `Only ${PROJECT_IMAGE_LIMIT} images allowed.` });
      return;
    }
    const incoming = Array.from(fileList).slice(0, slots);
    const processed: UploadItem[] = [];

    for (const file of incoming) {
      if (!file.type.startsWith('image/')) {
        toast({ title: 'Only images supported', description: `${file.name} was skipped.` });
        continue;
      }
      try {
        const compressed = await compressImage(file, { maxBytes: PROJECT_IMAGE_MAX_BYTES });
        if (compressed.size > PROJECT_IMAGE_MAX_BYTES) {
          throw new Error('Image is still larger than 1MB after compression.');
        }
        const id = nanoid(8);
        processed.push({
          id,
          file: compressed,
          preview: URL.createObjectURL(compressed),
          progress: 0,
          status: 'pending',
        });
      } catch (err) {
        toast({
          title: 'Could not process image',
          description: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    if (processed.length) {
      setUploadItems((prev) => [...prev, ...processed]);
    }
  };

  const removeUpload = (id: string) => {
    setUploadItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      prev.find((item) => item.id === id && URL.revokeObjectURL(item.preview));
      return next;
    });
  };

  const tagSuggestions = useMemo(() => {
    if (!activeTagQuery) return tagsCatalog;
    return tagsCatalog.filter((tag) => tag.toLowerCase().includes(activeTagQuery.toLowerCase()));
  }, [activeTagQuery]);

  const handleAddTag = (tag: string) => {
    const current = watch('tags');
    if (current.includes(tag)) return;
    if (current.length >= 8) {
      toast({ title: 'Tag limit reached', description: 'You can add up to 8 tags.' });
      return;
    }
    setValue('tags', [...current, tag]);
    setActiveTagQuery('');
  };

  const handleRemoveTag = (tag: string) => {
    const current = watch('tags');
    setValue('tags', current.filter((t) => t !== tag));
  };

  const checkSlugAvailability = async (slug: string) => {
    setSlugCheckRunning(true);
    setSlugError(null);
    try {
      await ensureUniqueSlug(slug, adapter);
      setSlugError(null);
      return true;
    } catch (error) {
      setSlugError(error instanceof Error ? error.message : 'Slug already exists');
      return false;
    } finally {
      setSlugCheckRunning(false);
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'You need an account to publish a project.' });
      return;
    }
    setPending(true);

    try {
      if (!slugManuallyEdited) {
        setValue('slug', slugify(values.title));
      }
      const slugIsValid = await checkSlugAvailability(values.slug);
      if (!slugIsValid) {
        setPending(false);
        return;
      }

      const preparedFiles = uploadItems.map((item) => item.file);
      const projectId = `proj_${nanoid(10)}`;
      let media: ProjectMedia[] = [];

      if (preparedFiles.length) {
        setUploadItems((items) => items.map((item) => ({ ...item, status: 'uploading', progress: 5 })));
        media = await adapter.uploadProjectMedia(projectId, preparedFiles, {
          onProgress: ({ fileName, progress }) => {
            setUploadItems((items) =>
              items.map((item) =>
                item.file.name === fileName ? { ...item, progress, status: progress === 100 ? 'success' : 'uploading' } : item
              )
            );
          },
        });
      }

      const ownerName = user.displayName || user.email?.split('@')[0] || 'Creator';
      const ownerAvatar = user.photoURL || 'https://avatars.githubusercontent.com/u/1?v=4';
      const role = (user as any)?.role ?? (user.email?.endsWith('@youthforge.dev') ? 'admin' : 'member');

      const payload = {
        projectId,
        owner: { id: user.uid, displayName: ownerName, avatarUrl: ownerAvatar, role },
        title: values.title,
        slug: values.slug,
        summary: values.summary,
        description: values.description,
        tags: values.tags,
        repoUrl: values.repoUrl || undefined,
        demoUrl: values.demoUrl || undefined,
        visibility: values.visibility as ProjectVisibility,
        media,
      };

      const project = await createProjectMutation.mutateAsync(payload);
      toast({
        title: 'Project published',
        description: 'Your project is now live in the Phase 4 feed.',
      });
      router.push(`/projects/${project.slug}`);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Something went wrong',
        description: error instanceof Error ? error.message : 'Failed to save project',
      });
    } finally {
      setPending(false);
    }
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <header className="space-y-3">
        <p className="uppercase tracking-widest text-xs text-muted-foreground">Phase 4</p>
        <h1 className="text-4xl font-bold">Create a project</h1>
        <p className="text-muted-foreground">
          Share your build with the YouthForge community. Images are compressed to stay within the Firebase Spark budget
          and uploads fall back to the mock adapter while you configure your keys.
        </p>
      </header>

      {!FEATURE_FLAGS.useFirebaseAdapter && (
        <div className="rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 p-4 text-sm text-amber-200">
          <p className="font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Firebase adapter disabled
          </p>
          <p className="text-amber-100/80">Turn on NEXT_PUBLIC_USE_FIREBASE to push media to Storage.</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-10">
        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium">Title</span>
            <input
              {...register('title')}
              placeholder="e.g. Distributed design editor"
              className="glass-input w-full"
            />
            {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium flex items-center gap-2">
              Slug
              {slugCheckRunning && <Loader2 className="h-3 w-3 animate-spin" />}
              {!slugCheckRunning && !slugError && slugValue && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
            </span>
            <input
              {...register('slug')}
              onFocus={() => setSlugManuallyEdited(true)}
              onBlur={() => checkSlugAvailability(slugValue)}
              placeholder="distributed-design-editor"
              className="glass-input w-full"
            />
            {(errors.slug || slugError) && <p className="text-xs text-red-400">{errors.slug?.message || slugError}</p>}
          </label>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium">Summary</span>
            <textarea
              {...register('summary')}
              rows={3}
              className="glass-input w-full"
              placeholder="One or two sentences explaining what you built"
            />
            <p className="text-xs text-muted-foreground text-right">{watch('summary').length}/240</p>
            {errors.summary && <p className="text-xs text-red-400">{errors.summary.message}</p>}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Visibility</span>
            <select {...register('visibility')} className="glass-input w-full">
              <option value="public">Public</option>
              <option value="unlisted">Unlisted</option>
            </select>
            {errors.visibility && <p className="text-xs text-red-400">{errors.visibility.message}</p>}
          </label>
        </div>

        <label className="space-y-2">
          <span className="text-sm font-medium">Description (Markdown supported)</span>
          <textarea
            {...register('description')}
            rows={8}
            className="glass-input w-full"
            placeholder="Explain the problem, solution, stack, and roadmap..."
          />
          {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
        </label>

        <div className="space-y-4">
          <span className="text-sm font-medium">Tags</span>
          <div className="flex flex-wrap gap-2">
            {watch('tags').map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="glass-button-ghost text-xs"
              >
                {tag} ×
              </button>
            ))}
          </div>
          <input
            value={activeTagQuery}
            onChange={(event) => setActiveTagQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                if (activeTagQuery.trim()) {
                  handleAddTag(activeTagQuery.trim());
                }
              }
            }}
            placeholder="Search or add tags"
            className="glass-input w-full"
          />
          <div className="flex flex-wrap gap-2 text-xs">
            {tagSuggestions.map((tag) => (
              <button key={tag} type="button" className="glass-button-ghost" onClick={() => handleAddTag(tag)}>
                {tag}
              </button>
            ))}
          </div>
          {errors.tags && <p className="text-xs text-red-400">{errors.tags.message}</p>}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium">Repository URL</span>
            <input {...register('repoUrl')} placeholder="https://github.com/youthforge/project" className="glass-input w-full" />
            {errors.repoUrl && <p className="text-xs text-red-400">{errors.repoUrl.message}</p>}
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Live demo URL</span>
            <input {...register('demoUrl')} placeholder="https://app.youthforge.dev" className="glass-input w-full" />
            {errors.demoUrl && <p className="text-xs text-red-400">{errors.demoUrl.message}</p>}
          </label>
        </div>

        <div className="space-y-4">
          <span className="text-sm font-medium flex justify-between">
            Media ({uploadItems.length}/{PROJECT_IMAGE_LIMIT})
            <span className="text-xs text-muted-foreground">Max 1MB per image</span>
          </span>
          <label className="flex flex-col items-center justify-center gap-3 border border-dashed border-white/10 rounded-3xl p-8 cursor-pointer hover:border-white/30 transition">
            <Upload className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground text-center">
              Drag & drop images or click to browse
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              data-testid="project-media-input"
              onChange={(event) => handleFiles(event.target.files)}
              disabled={uploadItems.length >= PROJECT_IMAGE_LIMIT}
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            {uploadItems.map((item) => (
              <div key={item.id} className="relative rounded-2xl border border-white/10 p-4">
                <button
                  type="button"
                  onClick={() => removeUpload(item.id)}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-white"
                  aria-label="Remove image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <img src={item.preview} alt="Preview" className="h-40 w-full rounded-xl object-cover" />
                <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: `${item.progress}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1 capitalize">{item.status}</p>
                {item.error && <p className="text-xs text-red-400">{item.error}</p>}
              </div>
            ))}
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={pending || !isDirty}
          className="glass-button px-6 py-3 flex items-center gap-2"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving
            </>
          ) : (
            'Publish project'
          )}
        </motion.button>
      </form>
    </motion.section>
  );
}
