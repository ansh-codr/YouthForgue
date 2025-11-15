import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectCard } from './index';
import { Project } from '@/lib/types';

const mockProject: Project = {
  id: 'test',
  title: 'Test Project',
  excerpt: 'Excerpt',
  author: { id: 'a', name: 'Author', avatar: '' },
  tags: ['React', 'TS'],
  media: [],
  likeCount: 0,
  commentCount: 0,
  createdAt: new Date().toISOString(),
  description: 'desc',
};

test('renders project card and like button increments', async () => {
  const user = userEvent.setup();
  render(<ProjectCard project={mockProject} />);
  const likeBtn = screen.getByRole('button', { name: /like project/i });
  expect(likeBtn).toBeInTheDocument();
  await user.click(likeBtn);
  // optimistic like increments immediately
  expect(likeBtn.textContent).toMatch(/1/);
});
