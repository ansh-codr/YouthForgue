'use client';

import { useProjectsFirebase } from './firebase/useProjectsFirebase';
import { useMemo } from 'react';

export function useProjects() {
  const firebaseData = useProjectsFirebase();
  
  return {
    projects: firebaseData.projects,
    loading: firebaseData.loading,
    error: firebaseData.error,
    likeProject: firebaseData.likeProject,
    addComment: firebaseData.addComment,
    createProject: firebaseData.createProject,
  };
}

export function useProject(id: string) {
  const firebaseData = useProjectsFirebase();
  const firebaseProject = useMemo(
    () => firebaseData.projects.find(p => p.id === id),
    [firebaseData.projects, id]
  );
  
  return {
    project: firebaseProject,
    loading: firebaseData.loading,
    error: firebaseData.error,
    likeProject: firebaseData.likeProject,
  };
}
