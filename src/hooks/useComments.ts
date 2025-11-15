'use client';

import { useEffect } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { COMMENT_PAGE_SIZE } from '@/src/config/constants';
import { getProjectsAdapter } from '@/src/lib/adapterFactory';
import { projectQueryKeys, updateProjectDetailEntries } from '@/src/hooks/useProjects';
import type { CommentPage, CreateCommentInput, ProjectComment } from '@/src/types/project';

const commentsKey = (projectId: string) => ['project', projectId, 'comments'] as const;

const fetchCommentsPage = async (projectId: string, cursor?: string) => {
  const adapter = getProjectsAdapter();
  return new Promise<CommentPage>((resolve) => {
    const unsubscribe = adapter.listenComments(projectId, (page) => {
      resolve(page);
      unsubscribe();
    }, cursor);
  });
};

export const useComments = (projectId?: string) => {
  const adapter = getProjectsAdapter();
  const queryClient = useQueryClient();

  const query = useInfiniteQuery<CommentPage, Error, InfiniteData<CommentPage>, ReturnType<typeof commentsKey>, string | undefined>({
    queryKey: commentsKey(projectId || 'unknown'),
    queryFn: ({ pageParam }) => (projectId ? fetchCommentsPage(projectId, pageParam) : Promise.resolve({ comments: [], nextCursor: undefined })),
    enabled: Boolean(projectId),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
  });

  useEffect(() => {
    if (!projectId) return undefined;
    const unsubscribe = adapter.listenComments(projectId, (page) => {
      queryClient.setQueryData<InfiniteData<CommentPage> | undefined>(commentsKey(projectId), (data) => {
        if (!data) {
          return { pages: [page], pageParams: [undefined] };
        }
        const newPages = [...data.pages];
        newPages[0] = page;
        return { ...data, pages: newPages };
      });
    });
    return unsubscribe;
  }, [adapter, projectId, queryClient]);

  const mutation = useMutation<ProjectComment, Error, CreateCommentInput, { previous?: InfiniteData<CommentPage> }>({
    mutationFn: (input) => {
      if (!projectId) throw new Error('Missing projectId');
      return adapter.createComment(projectId, input);
    },
    onMutate: async (input) => {
      if (!projectId) {
        return { previous: undefined };
      }
      await queryClient.cancelQueries({ queryKey: commentsKey(projectId) });
      const previous = queryClient.getQueryData<InfiniteData<CommentPage>>(commentsKey(projectId));
      const optimistic: ProjectComment = {
        id: `optimistic-${Date.now()}`,
        projectId,
        body: input.body,
        author: input.author,
        parentId: input.parentId,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<InfiniteData<CommentPage>>(commentsKey(projectId), (data) => {
        if (!data) {
          return { pages: [{ comments: [optimistic], nextCursor: undefined }], pageParams: [undefined] };
        }
        const pages = [...data.pages];
        const firstPage = pages[0] ?? { comments: [], nextCursor: undefined };
        pages[0] = {
          ...firstPage,
          comments: [optimistic, ...firstPage.comments].slice(0, COMMENT_PAGE_SIZE),
        };
        return { ...data, pages };
      });

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (!projectId) return;
      if (context?.previous) {
        queryClient.setQueryData<InfiniteData<CommentPage>>(commentsKey(projectId), context.previous);
      }
    },
    onSuccess: () => {
      if (!projectId) return;
      updateProjectDetailEntries(queryClient, projectId, (project) => ({
        ...project,
        commentsCount: (project.commentsCount ?? 0) + 1,
      }));
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.lists() });
    },
    onSettled: () => {
      if (!projectId) return;
      queryClient.invalidateQueries({ queryKey: commentsKey(projectId) });
    },
  });

  return {
    commentsPages: query.data?.pages ?? [],
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetching: query.isFetching,
    submitComment: mutation.mutateAsync,
    submitting: mutation.isPending,
  };
};
