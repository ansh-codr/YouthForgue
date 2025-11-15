import React, { type ReactNode } from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProjectFeed, useCreateProject, projectQueryKeys } from '@/src/hooks/useProjects';
import { useProject } from '@/src/hooks/useProject';
import type { CreateProjectInput, ProjectRecord } from '@/src/types/project';

const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { queryClient, wrapper };
};

describe('project creation flow', () => {
  test('create → cache sync → feed → detail stays consistent', async () => {
    const { wrapper, queryClient } = createTestWrapper();

    const feedHook = renderHook(() => useProjectFeed(), { wrapper });
    await waitFor(() => expect(feedHook.result.current.projects.length).toBeGreaterThan(0));

    const createHook = renderHook(() => useCreateProject(), { wrapper });
    const detailHook = renderHook(
      ({ idOrSlug }: { idOrSlug?: string }) => useProject(idOrSlug),
      { initialProps: { idOrSlug: undefined as string | undefined }, wrapper }
    );

    const slug = `flow-test-${Date.now()}`;
    const createPayload: CreateProjectInput = {
      owner: {
        id: 'author_flow',
        displayName: 'Flow Tester',
        avatarUrl: 'https://example.com/avatar.png',
      },
      title: 'Flow Test Project',
      slug,
      summary: 'Ensures project creation syncs caches',
      description: 'This project exists only inside the React Query cache tests.',
      tags: ['Testing', 'React Query'],
      repoUrl: 'https://github.com/example/repo',
      demoUrl: 'https://demo.example.dev',
      visibility: 'public',
      media: [
        {
          id: `media-${slug}`,
          kind: 'image',
          storagePath: `projects/${slug}/cover.jpg`,
          downloadUrl: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=1200',
          width: 1200,
          height: 675,
          size: 120000,
          contentType: 'image/jpeg',
          createdAt: new Date().toISOString(),
        },
      ],
      isFeatured: false,
    };

    let createdProject: ProjectRecord | undefined;
    await act(async () => {
      createdProject = await createHook.result.current.mutateAsync(createPayload);
    });

    const createdId = createdProject!.id;

    await waitFor(() => expect(feedHook.result.current.projects.some(p => p.id === createdId)).toBe(true));

    detailHook.rerender({ idOrSlug: slug });
    await waitFor(() => expect(detailHook.result.current.data?.slug).toBe(slug));

    expect(queryClient.getQueryData(projectQueryKeys.detail(createdId))).toMatchObject({
      id: createdId,
      slug,
      title: createPayload.title,
    });
    expect(queryClient.getQueryData(projectQueryKeys.detail(slug))).toMatchObject({ id: createdId });
  });
});
