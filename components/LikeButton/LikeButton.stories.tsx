import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { LikeButton } from '@/components/LikeButton/LikeButton';

const meta: Meta<typeof LikeButton> = {
  title: 'Project/LikeButton',
  component: LikeButton,
  args: {
    projectId: 'proj_story_like',
    initialCount: 12,
    initialLiked: false,
  },
};

export default meta;

type Story = StoryObj<typeof LikeButton>;

export const Idle: Story = {};

export const Liked: Story = {
  args: {
    initialLiked: true,
    initialCount: 128,
  },
};

export const Animating: Story = {
  args: {
    projectId: 'proj_story_anim',
    initialCount: 5,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = await canvas.findByRole('button', { name: /like project/i });
    await userEvent.click(button);
  },
};
