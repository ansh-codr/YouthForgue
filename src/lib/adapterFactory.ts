import { FEATURE_FLAGS } from '@/src/config/constants';
import { firebaseAdapter } from '@/src/lib/firebaseAdapter';
import { mockAdapter } from '@/src/lib/mockAdapter';
import type { ProjectsAdapter } from '@/src/types/project';

let cachedAdapter: ProjectsAdapter | null = null;

export const getProjectsAdapter = (): ProjectsAdapter => {
  if (cachedAdapter) {
    return cachedAdapter;
  }
  cachedAdapter = FEATURE_FLAGS.useFirebaseAdapter ? firebaseAdapter : mockAdapter;
  return cachedAdapter;
};

export const overrideProjectsAdapter = (adapter: ProjectsAdapter | null) => {
  cachedAdapter = adapter;
};

export const resetProjectsAdapter = () => {
  cachedAdapter = null;
};
