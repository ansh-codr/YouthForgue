import type { Meta, StoryObj } from '@storybook/react';
import { ImageGallery } from '@/components/ImageGallery/ImageGallery';
import { makeMediaCollection } from '@/storybook/fixtures/projectRecords';

const meta: Meta<typeof ImageGallery> = {
  title: 'Project/ImageGallery',
  component: ImageGallery,
};

export default meta;

type Story = StoryObj<typeof ImageGallery>;

export const Grid: Story = {
  args: {
    media: makeMediaCollection(4),
  },
};

export const SingleImage: Story = {
  args: {
    media: makeMediaCollection(1),
  },
};

export const ManyImages: Story = {
  args: {
    media: makeMediaCollection(8),
  },
};
