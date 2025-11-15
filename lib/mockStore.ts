import { create } from 'zustand';
import { sleep } from './sleep';
import type { StoreState, Project, Challenge, DeveloperProfile, Comment, ChatMessage, Author } from './types';
const rid = () => Math.random().toString(36).slice(2, 10);

// Initial mock data (can import from existing mockData later)
const nowIso = () => new Date().toISOString();

const initialProjects: Project[] = [
  {
    id: 'p1',
    title: 'AI-Powered Study Assistant',
    excerpt: 'Personalized study plans using ML.',
    author: { id: 'd1', name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop' },
    tags: ['Python', 'TensorFlow', 'React'],
    media: [{ id: 'm1', type: 'image', url: 'https://images.unsplash.com/photo-1516321318423-f06f70504ab5?w=500&h=300&fit=crop' }],
    likeCount: 12,
    commentCount: 2,
    repoLink: 'https://github.com/example/study-assistant',
    isFeatured: true,
    createdAt: nowIso(),
    description: 'Full description placeholder.',
  },
];

const initialChallenges: Challenge[] = [
  {
    id: 'c1',
    title: 'Build a Carbon Footprint Calculator',
    promptSnippet: 'Help users calculate personal carbon footprint.',
    creator: { id: 'd2', name: 'Marcus Johnson', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop' },
    tags: ['Python', 'Web Dev'],
    responsesCount: 5,
    deadline: '2025-01-15',
    createdAt: nowIso(),
  },
];

const initialDevelopers: DeveloperProfile[] = [
  {
    id: 'd1',
    name: 'Sarah Chen',
    headline: 'Full Stack Developer & AI Enthusiast',
    skills: ['React', 'Python', 'TensorFlow'],
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop',
    location: 'San Francisco, CA',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    activeProjectsCount: 3,
  },
];

const initialComments: Comment[] = [
  {
    id: 'cm1',
    projectId: 'p1',
    author: initialDevelopers[0],
    body: 'Excited to see this grow!',
    likeCount: 2,
    createdAt: nowIso(),
  },
];

const initialTags = [
  { id: 't-react', label: 'React', color: '#61dafb', createdAt: nowIso() },
  { id: 't-ai', label: 'AI', color: '#8b5cf6', createdAt: nowIso() },
];

interface YouthForgeStore extends StoreState {
  likeProject: (projectId: string, userId?: string) => Promise<void>;
  addComment: (projectId: string, body: string, author: Author, parentId?: string) => Promise<Comment>;
  createChallenge: (input: Omit<Challenge, 'id' | 'responsesCount' | 'createdAt'>) => Promise<Challenge>;
  respondToChallenge: (challengeId: string) => Promise<void>;
  sendContactMessage: (developerId: string, message: string) => Promise<{ ok: boolean }>; // mock
  getProjectById: (id: string) => Project | undefined;
  pushChatMessage: (text: string, sender: 'user' | 'bot') => Promise<ChatMessage>;
}

export const useYouthForgeStore = create<YouthForgeStore>((set, get) => ({
  projects: initialProjects,
  challenges: initialChallenges,
  developers: initialDevelopers,
  comments: initialComments,
  tags: initialTags,
  chatbotMessages: [
    { id: rid(), sender: 'bot', text: 'Hi! I am the YouthForge helper. Ask me something.', createdAt: Date.now() },
  ],

  likeProject: async (projectId, userId) => {
    // optimistic update (userId is optional for mock mode)
    set(state => ({
      projects: state.projects.map(p => p.id === projectId ? { ...p, likeCount: p.likeCount + 1 } : p),
    }));
    await sleep(300);
  },

  addComment: async (projectId, body, author, parentId) => {
    const newComment: Comment = {
      id: rid(),
      projectId,
      author,
      body,
      parentId,
      likeCount: 0,
      createdAt: nowIso(),
    };
    // optimistic
    set(state => ({ comments: [...state.comments, newComment], projects: state.projects.map(p => p.id === projectId ? { ...p, commentCount: p.commentCount + 1 } : p) }));
    await sleep(250);
    return newComment;
  },

  createChallenge: async (input) => {
    const newChallenge: Challenge = {
      id: rid(),
      responsesCount: 0,
      createdAt: nowIso(),
      ...input,
    };
    set(state => ({ challenges: [newChallenge, ...state.challenges] }));
    await sleep(400);
    return newChallenge;
  },

  respondToChallenge: async (challengeId) => {
    set(state => ({ challenges: state.challenges.map(c => c.id === challengeId ? { ...c, responsesCount: c.responsesCount + 1 } : c) }));
    await sleep(300);
  },

  sendContactMessage: async (developerId, message) => {
    // For now just simulate latency
    await sleep(500);
    console.info('Mock contact message to', developerId, message);
    return { ok: true };
  },

  getProjectById: (id) => get().projects.find(p => p.id === id),

  pushChatMessage: async (text, sender) => {
  const msg: ChatMessage = { id: rid(), text, sender, createdAt: Date.now() };
    set(state => ({ chatbotMessages: [...state.chatbotMessages, msg] }));
    await sleep(150);
    // simple scripted bot echo
    if (sender === 'user') {
  const botReply: ChatMessage = { id: rid(), sender: 'bot', text: 'You said: ' + text, createdAt: Date.now() };
      set(state => ({ chatbotMessages: [...get().chatbotMessages, botReply] }));
    }
    return msg;
  },
}));
