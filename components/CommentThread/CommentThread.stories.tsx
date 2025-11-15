import type { Meta, StoryObj } from '@storybook/react';
import { CommentThread } from '@/components/CommentThread/CommentThread';
import { makeComments } from '@/storybook/fixtures/projectRecords';
import { buildCommentsPage } from '@/storybook/mocks/useCommentsStorybook';
import type { ProjectComment } from '@/src/types/project';

const meta: Meta<typeof CommentThread> = {
  title: 'Project/CommentThread',
  component: CommentThread,
  args: {
    projectId: 'proj_story_main',
  },
};

export default meta;

type Story = StoryObj<typeof CommentThread>;

export const Empty: Story = {
  parameters: {
    commentsState: {
      commentsPages: [buildCommentsPage([])],
      hasNextPage: false,
    },
  },
};

export const WithItems: Story = {
  parameters: {
    commentsState: {
      commentsPages: [buildCommentsPage(makeComments(3))],
      hasNextPage: true,
      fetchNextPage: () => undefined,
    },
  },
};

const optimistic: ProjectComment = {
  id: 'optimistic-story-comment',
  projectId: 'proj_story_main',
  body: 'Sending feedback with optimistic placeholder while the adapter resolves…',
  author: {
    id: 'storybook-user',
    displayName: 'Story Booker',
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
  },
  createdAt: new Date().toISOString(),
};

export const OptimisticSubmission: Story = {
  parameters: {
    commentsState: {
      commentsPages: [buildCommentsPage([optimistic, ...makeComments(2)])],
      submitting: true,
    },
  },
};
