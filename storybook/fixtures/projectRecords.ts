import type { ProjectMedia } from '@/src/types/media';
import type { ProjectComment, ProjectRecord } from '@/src/types/project';

const baseMedia = (overrides: Partial<ProjectMedia> = {}): ProjectMedia => ({
  id: overrides.id ?? 'media_story_1',
  kind: 'image',
  alt: overrides.alt ?? 'Storybook preview',
  storagePath: overrides.storagePath ?? 'projects/story/media/cover.jpg',
  downloadUrl: overrides.downloadUrl ?? 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
  width: overrides.width ?? 1600,
  height: overrides.height ?? 900,
  size: overrides.size ?? 420000,
  contentType: overrides.contentType ?? 'image/jpeg',
  createdAt: overrides.createdAt ?? new Date('2024-10-01').toISOString(),
  variants: overrides.variants,
  blurDataUrl: overrides.blurDataUrl,
});

const baseProject = (overrides: Partial<ProjectRecord> = {}): ProjectRecord => ({
  id: overrides.id ?? 'proj_story_main',
  slug: overrides.slug ?? 'storybook-sample-project',
  title: overrides.title ?? 'Storybook Sample Project',
  summary:
    overrides.summary ?? 'Demonstrates YouthForge project presentation with cover media and badges for Storybook.',
  description:
    overrides.description ??
    'This mock project exists purely within Storybook fixtures. Use it to showcase the ProjectCard, ProjectForm, and ImageGallery components.',
  tags: overrides.tags ?? ['Next.js', 'Firebase', 'AI/ML', 'Design'],
  repoUrl: overrides.repoUrl ?? 'https://github.com/youthforge/storybook',
  demoUrl: overrides.demoUrl ?? 'https://demo.youthforge.dev/story',
  visibility: overrides.visibility ?? 'public',
  isFeatured: overrides.isFeatured ?? false,
  owner: overrides.owner ?? {
    id: 'owner_story',
    displayName: 'Avery Nox',
    avatarUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=200&h=200&fit=crop',
    role: 'member',
  },
  media: overrides.media ?? [baseMedia()],
  likesCount: overrides.likesCount ?? 42,
  commentsCount: overrides.commentsCount ?? 6,
  likedByViewer: overrides.likedByViewer ?? false,
  createdAt: overrides.createdAt ?? new Date('2024-10-02').toISOString(),
  updatedAt: overrides.updatedAt,
  deletedAt: overrides.deletedAt,
  moderationLogs: overrides.moderationLogs,
});

export const makeProjectRecord = (overrides: Partial<ProjectRecord> = {}): ProjectRecord => baseProject(overrides);
export const makeMediaCollection = (count: number): ProjectMedia[] =>
  Array.from({ length: count }, (_, index) =>
    baseMedia({
      id: `media_story_${index + 1}`,
      downloadUrl: `https://picsum.photos/seed/story-${index + 1}/1200/800`,
      alt: `Storybook image ${index + 1}`,
    }),
  );

export const makeComments = (count: number, overrides: Partial<ProjectComment> = {}): ProjectComment[] =>
  Array.from({ length: count }, (_, index) => ({
    id: overrides.id ?? `comment_story_${index}`,
    projectId: overrides.projectId ?? 'proj_story_main',
    body:
      overrides.body ??
      `Comment #${index + 1} from Storybook showing optimistic + persisted states for youth collaboration threads.`,
    author:
      overrides.author ?? {
        id: `author_${index}`,
        displayName: `Reviewer ${index + 1}`,
        avatarUrl: `https://i.pravatar.cc/150?img=${index + 10}`,
      },
    createdAt: new Date(Date.now() - index * 36_000).toISOString(),
    updatedAt: undefined,
    parentId: undefined,
  }));
