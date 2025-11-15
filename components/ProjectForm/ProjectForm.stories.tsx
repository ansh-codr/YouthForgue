import React, { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, waitFor } from '@storybook/testing-library';
import { expect } from '@storybook/test';
import { ProjectForm } from '@/components/ProjectForm/ProjectForm';
import { mockAdapter } from '@/src/lib/mockAdapter';
import { overrideProjectsAdapter, resetProjectsAdapter } from '@/src/lib/adapterFactory';
import type { ProjectsAdapter } from '@/src/types/project';

const AdapterBoundary = ({ adapter, children }: { adapter?: ProjectsAdapter | null; children: React.ReactNode }) => {
  useEffect(() => {
    overrideProjectsAdapter(adapter ?? null);
    return () => {
      resetProjectsAdapter();
    };
  }, [adapter]);
  return <>{children}</>;
};

const slowUploadAdapter: ProjectsAdapter = {
  ...mockAdapter,
  uploadProjectMedia: async (projectId, files, options) => {
    files.forEach((file) => options?.onProgress?.({ fileName: file.name, progress: 35 }));
    await new Promise((resolve) => setTimeout(resolve, 4000));
    return mockAdapter.uploadProjectMedia(projectId, files, options);
  },
};

const meta: Meta<typeof ProjectForm> = {
  title: 'Project/ProjectForm',
  component: ProjectForm,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof ProjectForm>;

const fillRequiredFields = async (canvas: ReturnType<typeof within>) => {
  await userEvent.type(canvas.getByPlaceholderText(/distributed design editor/i), 'Storybook Flow Project');
  await userEvent.type(canvas.getByPlaceholderText(/one or two sentences/i), 'Story to verify validation, uploads, and success flows.');
  await userEvent.type(canvas.getByPlaceholderText(/explain the problem/i), 'This description clears the 80 character requirement for the Storybook preview and proves success.');
  await userEvent.click(canvas.getByRole('button', { name: 'AI/ML' }));
};

export const Empty: Story = {
  render: () => (
    <AdapterBoundary>
      <ProjectForm />
    </AdapterBoundary>
  ),
};

export const ValidationErrors: Story = {
  render: () => (
    <AdapterBoundary>
      <ProjectForm />
    </AdapterBoundary>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /publish project/i }));
    await waitFor(() => expect(canvas.getAllByText(/must/i).length).toBeGreaterThan(0));
  },
};

export const Uploading: Story = {
  render: () => (
    <AdapterBoundary adapter={slowUploadAdapter}>
      <ProjectForm />
    </AdapterBoundary>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillRequiredFields(canvas);
    const fileInput = canvas.getByTestId('project-media-input') as HTMLInputElement;
    const file = new File(['storybook'], 'story-upload.png', { type: 'image/png' });
    await userEvent.upload(fileInput, file);
    await userEvent.click(canvas.getByRole('button', { name: /publish project/i }));
    await waitFor(() => expect(canvas.getAllByText(/uploading/i).length).toBeGreaterThan(0));
  },
};

export const Success: Story = {
  render: () => (
    <AdapterBoundary>
      <ProjectForm />
    </AdapterBoundary>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillRequiredFields(canvas);
    await userEvent.click(canvas.getByRole('button', { name: /publish project/i }));
    await waitFor(() => expect(canvas.getByText(/Project published/i)).toBeInTheDocument());
  },
};
