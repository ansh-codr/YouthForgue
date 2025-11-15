import React, { type ReactNode } from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useToggleLike, projectQueryKeys } from '@/src/hooks/useProjects';
import { useComments } from '@/src/hooks/useComments';
import { getProjectsAdapter } from '@/src/lib/adapterFactory';
import { mockAdapter } from '@/src/lib/mockAdapter';
import type { ProjectRecord, ProjectComment } from '@/src/types/project';

const createWrapper = () => {
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

describe('cache consistency for likes and comments', () => {
  test('toggle like reconciles all detail cache entries', async () => {
    const adapter = getProjectsAdapter();
    const { projects } = await adapter.fetchProjects({ limit: 1 });
    const sourceProject = projects[0]!;
    const { queryClient, wrapper } = createWrapper();

    const cachedProject: ProjectRecord = JSON.parse(JSON.stringify(sourceProject));
    queryClient.setQueryData(projectQueryKeys.detail(cachedProject.id), cachedProject);
    queryClient.setQueryData(projectQueryKeys.detail(cachedProject.slug), cachedProject);

    const likeHook = renderHook(() => useToggleLike(cachedProject.id), { wrapper });

    await act(async () => {
      await likeHook.result.current.mutateAsync({ userId: 'cache-user' });
    });

    const byId = queryClient.getQueryData<ProjectRecord>(projectQueryKeys.detail(cachedProject.id));
    const bySlug = queryClient.getQueryData<ProjectRecord>(projectQueryKeys.detail(cachedProject.slug));

    expect(byId?.likesCount).toBe(cachedProject.likesCount + 1);
    expect(byId?.likedByViewer).toBe(true);
    expect(bySlug).toEqual(byId);
  });

  test('comment submission uses optimistic update and reconciles detail counts', async () => {
    const adapter = getProjectsAdapter();
    const { projects } = await adapter.fetchProjects({ limit: 1 });
    const sourceProject = projects[0]!;
    const { queryClient, wrapper } = createWrapper();

    const cachedProject: ProjectRecord = JSON.parse(JSON.stringify(sourceProject));
    queryClient.setQueryData(projectQueryKeys.detail(cachedProject.id), cachedProject);
    queryClient.setQueryData(projectQueryKeys.detail(cachedProject.slug), cachedProject);

    const commentsHook = renderHook(() => useComments(cachedProject.id), { wrapper });
    await waitFor(() => expect(commentsHook.result.current.commentsPages.length).toBeGreaterThan(0));

    const originalCreateComment = mockAdapter.createComment.bind(mockAdapter);
    let releaseComment: (() => Promise<void>) | undefined;
    const createCommentSpy = jest.spyOn(mockAdapter, 'createComment').mockImplementation((projectId, input) => {
      return new Promise<ProjectComment>((resolve, reject) => {
        releaseComment = async () => {
          try {
            const result = await originalCreateComment(projectId, input);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        };
      });
    });

    const commentPayload = {
      body: 'Cache test comment',
      author: {
        id: 'commenter_cache',
        displayName: 'Cache Tester',
      },
    };

    let submitPromise: Promise<ProjectComment> | undefined;
    act(() => {
      submitPromise = commentsHook.result.current.submitComment(commentPayload);
    });

    await waitFor(() => {
      const optimistic = commentsHook.result.current.commentsPages[0]?.comments[0];
      return Boolean(optimistic && optimistic.body === commentPayload.body && optimistic.id.startsWith('optimistic-'));
    });

    expect(releaseComment).toBeDefined();
    if (!releaseComment) {
      throw new Error('createComment was not intercepted');
    }

    await act(async () => {
      await releaseComment?.();
    });

    expect(submitPromise).toBeDefined();
    if (!submitPromise) {
      throw new Error('submitComment did not return a promise');
    }

    await act(async () => {
      await submitPromise;
    });

    await waitFor(() => {
      const detail = queryClient.getQueryData<ProjectRecord>(projectQueryKeys.detail(cachedProject.id));
      return detail?.commentsCount === (cachedProject.commentsCount ?? 0) + 1;
    });

    expect(commentsHook.result.current.commentsPages[0]?.comments[0].id.startsWith('comment_')).toBe(true);

    createCommentSpy.mockRestore();
  });
});
