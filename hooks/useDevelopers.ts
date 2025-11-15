'use client';

import { useDevelopersFirebase } from './firebase/useDevelopersFirebase';

export function useDevelopers() {
  const { developers, loading, error } = useDevelopersFirebase();
  
  return { 
    developers, 
    loading,
    error,
  };
}
