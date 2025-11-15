'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getProjectsAdapter } from '@/src/lib/adapterFactory';
import type { ProjectRecord } from '@/src/types/project';
import { projectQueryKeys, syncProjectDetailInCache } from './useProjects';

export const useProject = (idOrSlug?: string) => {
  const adapter = getProjectsAdapter();
  const queryClient = useQueryClient();

  const query = useQuery<ProjectRecord | null>({
    queryKey: projectQueryKeys.detail(idOrSlug || 'unknown'),
    queryFn: () => (idOrSlug ? adapter.fetchProjectById(idOrSlug) : Promise.resolve(null)),
    enabled: Boolean(idOrSlug),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (query.data) {
      syncProjectDetailInCache(queryClient, query.data);
    }
  }, [query.data, queryClient]);

  useEffect(() => {
    if (!idOrSlug) return undefined;
    const unsubscribe = adapter.listenProject(idOrSlug, (project) => {
      queryClient.setQueryData(projectQueryKeys.detail(idOrSlug), project);
      if (project) {
        syncProjectDetailInCache(queryClient, project);
      }
    });
    return unsubscribe;
  }, [adapter, idOrSlug, queryClient]);

  return query;
};
