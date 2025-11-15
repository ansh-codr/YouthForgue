'use client';

import { useMemo, useCallback } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData, type QueryClient } from '@tanstack/react-query';
import { PROJECT_PAGE_SIZE } from '@/src/config/constants';
import { getProjectsAdapter } from '@/src/lib/adapterFactory';
import type {
  CreateProjectInput,
  ProjectFeedResponse,
  ProjectFeedQuery,
  ProjectRecord,
  ToggleLikeResult,
  UpdateProjectInput,
} from '@/src/types/project';

export const projectQueryKeys = {
  all: ['projects'] as const,
  lists: () => [...projectQueryKeys.all, 'list'] as const,
  list: (filters: Partial<ProjectFeedQuery>) => [...projectQueryKeys.lists(), filters] as const,
  detail: (idOrSlug: string) => [...projectQueryKeys.all, 'detail', idOrSlug] as const,
};

const syncDetailKey = (queryClient: QueryClient, key: ReturnType<typeof projectQueryKeys.detail>, project: ProjectRecord | null) => {
  queryClient.setQueryData<ProjectRecord | null>(key, project);
};

const isDetailKey = (key: readonly unknown[]): key is ReturnType<typeof projectQueryKeys.detail> =>
  Array.isArray(key) && key[0] === projectQueryKeys.all[0] && key[1] === 'detail';

export const syncProjectDetailInCache = (queryClient: QueryClient, project: ProjectRecord) => {
  syncDetailKey(queryClient, projectQueryKeys.detail(project.id), project);
  syncDetailKey(queryClient, projectQueryKeys.detail(project.slug), project);
};

export const updateProjectDetailEntries = (
  queryClient: QueryClient,
  projectId: string,
  updater: (project: ProjectRecord) => ProjectRecord
) => {
  const matches = queryClient.getQueriesData<ProjectRecord | null>({ queryKey: projectQueryKeys.all });
  matches.forEach(([key, data]) => {
    if (!Array.isArray(key) || !isDetailKey(key) || !data || data.id !== projectId) {
      return;
    }
    const updated = updater(data);
    syncDetailKey(queryClient, key, updated);
    if (updated.slug && key[2] !== updated.slug) {
      syncDetailKey(queryClient, projectQueryKeys.detail(updated.slug), updated);
    }
  });
};

export interface UseProjectsOptions extends Partial<ProjectFeedQuery> {}

export const useProjects = (options: UseProjectsOptions = {}) => {
  const adapter = getProjectsAdapter();
  const normalizedOptions = useMemo(
    () => ({ ...options }),
    [options.cursor, options.limit, options.featuredOnly, options.sort, options.tag, options.slug]
  );

  return useInfiniteQuery<ProjectFeedResponse, Error, InfiniteData<ProjectFeedResponse>, ReturnType<typeof projectQueryKeys.list>, string | undefined>({
    queryKey: projectQueryKeys.list(normalizedOptions),
    queryFn: async ({ pageParam }) => {
      const response = await adapter.fetchProjects({
        ...normalizedOptions,
        cursor: pageParam,
        limit: normalizedOptions.limit ?? PROJECT_PAGE_SIZE,
      });
      return response;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    refetchOnWindowFocus: false,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const adapter = getProjectsAdapter();
  return useMutation<ProjectRecord, Error, CreateProjectInput>({
    mutationFn: (values) => adapter.createProject(values),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.lists() });
      syncProjectDetailInCache(queryClient, project);
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  const adapter = getProjectsAdapter();
  return useMutation<ProjectRecord, Error, UpdateProjectInput>({
    mutationFn: (payload) => adapter.updateProject(payload),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.lists() });
      syncProjectDetailInCache(queryClient, project);
    },
  });
};

export const useToggleLike = (projectId: string) => {
  const queryClient = useQueryClient();
  const adapter = getProjectsAdapter();
  return useMutation<ToggleLikeResult, Error, { userId: string }>({
    mutationFn: ({ userId }) => adapter.toggleLike(projectId, userId),
    onSuccess: (result) => {
      updateProjectDetailEntries(queryClient, projectId, (project) => ({
        ...project,
        likesCount: result.likesCount,
        likedByViewer: result.liked,
      }));
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.lists() });
    },
  });
};

export const useProjectFeed = (options: UseProjectsOptions = {}) => {
  const query = useProjects(options);
  const projects = useMemo(() => {
    if (!query.data) return [] as ProjectRecord[];
    return query.data.pages.flatMap((page) => page.projects);
  }, [query.data]);
  const refresh = useCallback(() => query.refetch(), [query]);
  return {
    ...query,
    projects,
    refresh,
  };
};
