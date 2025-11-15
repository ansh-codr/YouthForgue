import { nanoid } from 'nanoid';
import type {
  CommentPage,
  CreateCommentInput,
  CreateProjectInput,
  ProjectComment,
  ProjectFeedQuery,
  ProjectFeedResponse,
  ProjectRecord,
  ProjectSort,
  ProjectsAdapter,
  ToggleLikeResult,
  UpdateProjectInput,
} from '@/src/types/project';
import type { ProjectMedia } from '@/src/types/media';
import {
  COMMENT_PAGE_SIZE,
  MODERATION_LOG_LIMIT,
  PROJECT_IMAGE_LIMIT,
  PROJECT_PAGE_SIZE,
} from '@/src/config/constants';

const projectStore = new Map<string, ProjectRecord>();
const slugIndex = new Map<string, string>();
const commentsStore = new Map<string, ProjectComment[]>();
const likesStore = new Map<string, Set<string>>();
const projectListeners = new Map<string, Set<(project: ProjectRecord | null) => void>>();
const slugListeners = new Map<string, Set<(project: ProjectRecord | null) => void>>();
const commentListeners = new Map<string, Map<(page: CommentPage) => void, string | undefined>>();

const nowIso = () => new Date().toISOString();

const seedProjects = () => {
  if (projectStore.size > 0) return;
  const seeds: Array<Partial<ProjectRecord> & Pick<ProjectRecord, 'title' | 'summary' | 'description' | 'tags' | 'owner'>> = [
    {
      title: 'AI-Powered Study Assistant',
      summary: 'Personalized study plans using ML.',
      description: 'A mock description for the AI study project.',
      tags: ['AI/ML', 'Next.js', 'Firebase'],
      owner: { id: 'd1', displayName: 'Sarah Chen', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop' },
    },
    {
      title: 'Real-time Collaboration Editor',
      summary: 'Collaborative document editing with CRDT-like syncing.',
      description: 'Real-time editor sample project.',
      tags: ['Collaboration', 'React', 'WebSockets'],
      owner: { id: 'd2', displayName: 'Marcus Johnson', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop' },
    },
    {
      title: 'Mobile Health Tracker',
      summary: 'Cross-platform lifestyle tracker.',
      description: 'Health tracker sample project.',
      tags: ['Mobile', 'Flutter'],
      owner: { id: 'd3', displayName: 'Priya Patel', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop' },
    },
  ];

  seeds.forEach(seed => {
    const id = `proj_${nanoid(10)}`;
    const slug = seed.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const project: ProjectRecord = {
      id,
      slug,
      title: seed.title,
      summary: seed.summary,
      description: seed.description,
      tags: seed.tags,
      repoUrl: 'https://github.com/youthforge/demo',
      demoUrl: 'https://demo.youthforge.dev',
      visibility: 'public',
      isFeatured: true,
      owner: seed.owner,
      media: [
        {
          id: `media_${nanoid(6)}`,
          kind: 'image',
          alt: `${seed.title} preview`,
          storagePath: `projects/${id}/media/sample.jpg`,
          downloadUrl: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=1200&auto=format&fit=crop',
          width: 1600,
          height: 900,
          size: 350000,
          contentType: 'image/jpeg',
          createdAt: nowIso(),
        },
      ],
      likesCount: Math.floor(Math.random() * 50) + 5,
      commentsCount: 1,
      likedByViewer: false,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      moderationLogs: [],
    };

    projectStore.set(id, project);
    slugIndex.set(slug, id);
    commentsStore.set(id, [
      {
        id: `c_${nanoid(8)}`,
        projectId: id,
        body: 'Excited to follow this build! 🚀',
        author: seed.owner,
        createdAt: nowIso(),
      },
    ]);
    likesStore.set(id, new Set());
  });
};

seedProjects();

function getProjectId(value: string): string | null {
  if (projectStore.has(value)) return value;
  const id = slugIndex.get(value);
  return id ?? null;
}

function emitProject(projectId: string) {
  const project = projectStore.get(projectId) ?? null;
  projectListeners.get(projectId)?.forEach(listener => listener(project));
  const slug = Array.from(slugIndex.entries()).find(([, id]) => id === projectId)?.[0];
  if (slug) {
    slugListeners.get(slug)?.forEach(listener => listener(project));
  }
}

function buildCommentPage(projectId: string, cursor?: string): CommentPage {
  const comments = [...(commentsStore.get(projectId) ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  let startIndex = 0;
  if (cursor) {
    const cursorIndex = comments.findIndex(c => c.createdAt === cursor || c.id === cursor);
    startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0;
  }
  const pageComments = comments.slice(startIndex, startIndex + COMMENT_PAGE_SIZE);
  const nextCursor = pageComments.length === COMMENT_PAGE_SIZE ? pageComments[pageComments.length - 1]?.createdAt : undefined;
  return { comments: pageComments, nextCursor };
}

function emitComments(projectId: string) {
  const listeners = commentListeners.get(projectId);
  if (!listeners) return;
  listeners.forEach((cursor, listener) => {
    listener(buildCommentPage(projectId, cursor));
  });
}

function paginateProjects(query: ProjectFeedQuery): ProjectFeedResponse {
  const limit = query.limit ?? PROJECT_PAGE_SIZE;
  let projects = Array.from(projectStore.values()).filter(p => p.visibility !== 'deleted');

  if (query.slug) {
    projects = projects.filter(p => p.slug === query.slug);
  }
  if (query.featuredOnly || query.sort === 'featured') {
    projects = projects.filter(p => p.isFeatured);
  }
  if (query.tag) {
    const tag = query.tag;
    projects = projects.filter(p => p.tags.includes(tag));
  }

  const sortBy: Record<ProjectSort, (a: ProjectRecord, b: ProjectRecord) => number> = {
    new: (a, b) => b.createdAt.localeCompare(a.createdAt),
    popular: (a, b) => b.likesCount - a.likesCount,
    featured: (a, b) => Number(b.isFeatured) - Number(a.isFeatured),
  };

  const sorter = sortBy[query.sort ?? 'new'];
  projects.sort(sorter);

  if (query.cursor) {
    const cursorIndex = projects.findIndex(p => p.id === query.cursor);
    if (cursorIndex >= 0) {
      projects = projects.slice(cursorIndex + 1);
    }
  }

  const page = projects.slice(0, limit);
  const nextCursor = page.length === limit ? page[page.length - 1]!.id : undefined;
  return { projects: page, nextCursor };
}

function createMediaRecord(file: File): ProjectMedia {
  const url = typeof window !== 'undefined' ? URL.createObjectURL(file) : `mock://${file.name}`;
  return {
    id: `media_${nanoid(8)}`,
    kind: 'image',
    alt: file.name,
    storagePath: `mock/${file.name}`,
    downloadUrl: url,
    width: 0,
    height: 0,
    size: file.size,
    contentType: file.type || 'image/jpeg',
    createdAt: nowIso(),
  };
}

function upsertProject(record: ProjectRecord) {
  projectStore.set(record.id, record);
  slugIndex.set(record.slug, record.id);
  emitProject(record.id);
}

export const mockAdapter: ProjectsAdapter = {
  async createProject(input: CreateProjectInput): Promise<ProjectRecord> {
    const id = input.projectId ?? `proj_${nanoid(12)}`;
    const slug = input.slug;
    const now = nowIso();

    if (slugIndex.has(slug)) {
      throw new Error('Slug already exists');
    }

    if (input.media.length > PROJECT_IMAGE_LIMIT) {
      throw new Error(`Projects support up to ${PROJECT_IMAGE_LIMIT} images.`);
    }

    const record: ProjectRecord = {
      id,
      slug,
      title: input.title,
      summary: input.summary,
      description: input.description,
      tags: input.tags,
      repoUrl: input.repoUrl,
      demoUrl: input.demoUrl,
      visibility: input.visibility,
      isFeatured: input.isFeatured ?? false,
      owner: input.owner,
      media: input.media,
      likesCount: 0,
      commentsCount: 0,
      likedByViewer: false,
      createdAt: now,
      updatedAt: now,
      moderationLogs: (input.moderationLogs ?? []).slice(0, MODERATION_LOG_LIMIT),
    };

    upsertProject(record);
    commentsStore.set(id, []);
    likesStore.set(id, new Set());
    return record;
  },

  async updateProject(input: UpdateProjectInput): Promise<ProjectRecord> {
    const project = projectStore.get(input.projectId);
    if (!project) throw new Error('Project not found');

    const updates: ProjectRecord = {
      ...project,
      ...input,
      slug: input.slug ?? project.slug,
      title: input.title ?? project.title,
      summary: input.summary ?? project.summary,
      description: input.description ?? project.description,
      tags: input.tags ?? project.tags,
      repoUrl: input.repoUrl ?? project.repoUrl,
      demoUrl: input.demoUrl ?? project.demoUrl,
      media: input.media ?? project.media,
      visibility: input.visibility ?? project.visibility,
      updatedAt: nowIso(),
      moderationLogs: input.moderationLogs ? input.moderationLogs.slice(0, MODERATION_LOG_LIMIT) : project.moderationLogs,
    };

    if (updates.slug !== project.slug) {
      if (slugIndex.has(updates.slug)) {
        throw new Error('Slug already exists');
      }
      slugIndex.delete(project.slug);
      slugIndex.set(updates.slug, updates.id);
    }

    upsertProject(updates);
    return updates;
  },

  async deleteProject(projectId: string): Promise<void> {
    const project = projectStore.get(projectId);
    if (!project) throw new Error('Project not found');
    project.visibility = 'deleted';
    project.deletedAt = nowIso();
    project.updatedAt = project.deletedAt;
    project.moderationLogs = [
      {
        id: `mod_${nanoid(8)}`,
        actorId: 'system',
        action: 'soft-delete' as const,
        reason: 'Soft delete from mock adapter',
        createdAt: project.deletedAt,
      },
      ...(project.moderationLogs ?? []),
    ].slice(0, MODERATION_LOG_LIMIT);
    upsertProject(project);
  },

  async uploadProjectMedia(
    projectId: string,
    files: File[],
    options?: {
      onProgress?: (payload: { fileName: string; progress: number }) => void;
    }
  ): Promise<ProjectMedia[]> {
    const safeFiles = files.slice(0, PROJECT_IMAGE_LIMIT);
    return safeFiles.map((file, index) => {
      options?.onProgress?.({ fileName: file.name, progress: 100 });
      return createMediaRecord(file instanceof File ? file : new File([file], `upload-${index}`));
    });
  },

  async fetchProjectById(idOrSlug: string): Promise<ProjectRecord | null> {
    const id = getProjectId(idOrSlug);
    if (!id) return null;
    return projectStore.get(id) ?? null;
  },

  listenProject(idOrSlug: string, cb: (project: ProjectRecord | null) => void): () => void {
    const id = getProjectId(idOrSlug);
    const key = id ?? idOrSlug;
    const map = id ? projectListeners : slugListeners;
    const listeners = map.get(key) ?? new Set();
    listeners.add(cb);
    map.set(key, listeners);

    Promise.resolve().then(() => cb(id ? projectStore.get(id) ?? null : projectStore.get(slugIndex.get(idOrSlug) ?? '') ?? null));

    return () => {
      const current = map.get(key);
      if (!current) return;
      current.delete(cb);
      if (current.size === 0) {
        map.delete(key);
      }
    };
  },

  async fetchProjects(query: ProjectFeedQuery): Promise<ProjectFeedResponse> {
    return paginateProjects(query);
  },

  async createComment(projectId: string, input: CreateCommentInput): Promise<ProjectComment> {
    const project = projectStore.get(projectId);
    if (!project) throw new Error('Project not found');

    const newComment: ProjectComment = {
      id: `comment_${nanoid(10)}`,
      projectId,
      body: input.body,
      author: input.author,
      parentId: input.parentId,
      createdAt: nowIso(),
    };

    const comments = commentsStore.get(projectId) ?? [];
    commentsStore.set(projectId, [newComment, ...comments]);
    project.commentsCount += 1;
    upsertProject(project);
    emitComments(projectId);
    return newComment;
  },

  listenComments(projectId: string, cb: (page: CommentPage) => void, cursor?: string): () => void {
    const listeners = commentListeners.get(projectId) ?? new Map();
    listeners.set(cb, cursor);
    commentListeners.set(projectId, listeners);
    Promise.resolve().then(() => cb(buildCommentPage(projectId, cursor)));

    return () => {
      const current = commentListeners.get(projectId);
      if (!current) return;
      current.delete(cb);
      if (current.size === 0) commentListeners.delete(projectId);
    };
  },

  async toggleLike(projectId: string, userId: string): Promise<ToggleLikeResult> {
    const project = projectStore.get(projectId);
    if (!project) throw new Error('Project not found');
    const likes = likesStore.get(projectId) ?? new Set<string>();
    const hasLiked = likes.has(userId);
    if (hasLiked) {
      likes.delete(userId);
      project.likesCount = Math.max(0, project.likesCount - 1);
    } else {
      likes.add(userId);
      project.likesCount += 1;
    }
    likesStore.set(projectId, likes);
    upsertProject(project);
    return { liked: !hasLiked, likesCount: project.likesCount };
  },
};
