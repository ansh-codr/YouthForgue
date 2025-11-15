import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectCard } from './index';
import type { ProjectRecord } from '@/src/types/project';

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user' },
  }),
}));

jest.mock('@/src/lib/adapterFactory', () => ({
  getProjectsAdapter: () => ({
    toggleLike: () => Promise.resolve({ liked: true, likesCount: 1 }),
  }),
}));

const renderWithClient = (ui: React.ReactElement) => {
  const client = new QueryClient();
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

const mockProject: ProjectRecord = {
  id: 'test',
  slug: 'test-project',
  title: 'Test Project',
  summary: 'Excerpt',
  description: 'desc',
  tags: ['React', 'TS'],
  repoUrl: undefined,
  demoUrl: undefined,
  visibility: 'public',
  isFeatured: false,
  owner: { id: 'a', displayName: 'Author', avatarUrl: '' },
  media: [],
  likesCount: 0,
  commentsCount: 0,
  likedByViewer: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  moderationLogs: [],
};

test('renders project card and like button increments', async () => {
  const user = userEvent.setup();
  renderWithClient(<ProjectCard project={mockProject} />);
  const likeBtn = screen.getByRole('button', { name: /like project/i });
  expect(likeBtn).toBeInTheDocument();
  await user.click(likeBtn);
  // optimistic like increments immediately
  expect(likeBtn.textContent).toMatch(/1/);
});
