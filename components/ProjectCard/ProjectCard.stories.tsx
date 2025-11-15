import type { Meta, StoryObj } from '@storybook/react';
import { ProjectCard } from '@/components/ProjectCard';
import { makeMediaCollection, makeProjectRecord } from '@/storybook/fixtures/projectRecords';

const meta: Meta<typeof ProjectCard> = {
  title: 'Project/ProjectCard',
  component: ProjectCard,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof ProjectCard>;

export const Featured: Story = {
  args: {
    project: makeProjectRecord({
      isFeatured: true,
      media: makeMediaCollection(1),
      summary: 'Highlighted project with hero media and Featured badge.',
    }),
  },
};

export const NoImages: Story = {
  args: {
    project: makeProjectRecord({
      media: [],
      summary: 'Demonstrates fallback layout when media is unavailable.',
    }),
  },
};

export const ManyTags: Story = {
  args: {
    project: makeProjectRecord({
      tags: ['Next.js', 'Firebase', 'AI', 'Design', 'Tooling', 'Analytics', 'DevOps', 'Cloud', 'Mobile'],
      media: makeMediaCollection(1),
    }),
  },
};

export const LikedByViewer: Story = {
  args: {
    project: makeProjectRecord({
      likedByViewer: true,
      likesCount: 128,
      commentsCount: 23,
      title: 'Cached likes instantly reflect liking state',
    }),
  },
};
