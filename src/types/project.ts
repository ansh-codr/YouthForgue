import type { ProjectMedia } from './media';

export type ProjectVisibility = 'public' | 'unlisted' | 'deleted';
export type ProjectSort = 'new' | 'popular' | 'featured';

export interface ProjectOwner {
  id: string;
  displayName: string;
  avatarUrl?: string;
  role?: 'admin' | 'member';
}

export interface ModerationLogEntry {
  id: string;
  actorId: string;
  action: 'feature' | 'unfeature' | 'soft-delete' | 'restore' | 'note';
  reason?: string;
  createdAt: string;
}

export interface ProjectRecord {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  tags: string[];
  repoUrl?: string;
  demoUrl?: string;
  visibility: ProjectVisibility;
  isFeatured: boolean;
  owner: ProjectOwner;
  media: ProjectMedia[];
  likesCount: number;
  commentsCount: number;
  likedByViewer?: boolean;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
  moderationLogs?: ModerationLogEntry[];
}

export interface ProjectComment {
  id: string;
  projectId: string;
  body: string;
  author: ProjectOwner;
  createdAt: string;
  updatedAt?: string;
  parentId?: string;
}

export interface CommentPage {
  comments: ProjectComment[];
  nextCursor?: string;
}

export interface ProjectFeedQuery {
  cursor?: string;
  limit?: number;
  featuredOnly?: boolean;
  tag?: string;
  sort?: ProjectSort;
  slug?: string;
}

export interface ProjectFeedResponse {
  projects: ProjectRecord[];
  nextCursor?: string;
}

export interface CreateProjectInput {
  projectId?: string;
  owner: ProjectOwner;
  title: string;
  slug: string;
  summary: string;
  description: string;
  tags: string[];
  repoUrl?: string;
  demoUrl?: string;
  visibility: ProjectVisibility;
  media: ProjectMedia[];
  isFeatured?: boolean;
  moderationLogs?: ModerationLogEntry[];
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {
  projectId: string;
}

export interface CreateCommentInput {
  body: string;
  parentId?: string;
  author: ProjectOwner;
}

export interface ToggleLikeResult {
  liked: boolean;
  likesCount: number;
}

export interface ProjectsAdapter {
  createProject(input: CreateProjectInput): Promise<ProjectRecord>;
  updateProject(input: UpdateProjectInput): Promise<ProjectRecord>;
  deleteProject(projectId: string): Promise<void>;
  uploadProjectMedia(
    projectId: string,
    files: File[],
    options?: {
      onProgress?: (payload: { fileName: string; progress: number }) => void;
    }
  ): Promise<ProjectMedia[]>;
  fetchProjectById(idOrSlug: string): Promise<ProjectRecord | null>;
  listenProject(idOrSlug: string, cb: (project: ProjectRecord | null) => void): () => void;
  fetchProjects(query: ProjectFeedQuery): Promise<ProjectFeedResponse>;
  createComment(projectId: string, input: CreateCommentInput): Promise<ProjectComment>;
  listenComments(projectId: string, cb: (page: CommentPage) => void, cursor?: string): () => void;
  toggleLike(projectId: string, userId: string): Promise<ToggleLikeResult>;
}
