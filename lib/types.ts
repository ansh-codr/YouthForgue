// Shared TypeScript interfaces for YouthForge Phase 2

export interface Author {
  id: string;
  name: string;
  avatar: string;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  alt?: string;
  previewUrl?: string;
}

export interface Project {
  id: string;
  title: string;
  excerpt: string;
  description?: string;
  author: Author;
  tags: string[];
  media: MediaItem[];
  likeCount: number;
  commentCount: number;
  repoLink?: string;
  deploymentUrl?: string;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Challenge {
  id: string;
  title: string;
  promptSnippet: string;
  creator: Author;
  tags: string[];
  responsesCount: number;
  deadline?: string; // ISO date
  createdAt: string;
}

export interface DeveloperProfile {
  id: string;
  name: string;
  headline: string;
  skills: string[];
  avatar: string;
  location?: string;
  github?: string;
  linkedin?: string;
  activeProjectsCount: number;
}

export interface Comment {
  id: string;
  projectId: string;
  author: Author;
  body: string;
  parentId?: string;
  likeCount: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  createdAt: number;
}

export interface SpotlightItem {
  id: string;
  type: 'project' | 'developer';
  label: string;
}

export interface TagMeta {
  id: string;
  label: string;
  color?: string;
  createdAt: string;
}

export interface StoreState {
  projects: Project[];
  challenges: Challenge[];
  developers: DeveloperProfile[];
  comments: Comment[];
  tags: TagMeta[];
  chatbotMessages: ChatMessage[];
  // actions declared in store file
}
