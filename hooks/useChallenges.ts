'use client';

import { useChallengesFirebase } from './firebase/useChallengesFirebase';

export function useChallenges() {
  const { challenges, loading, error, createChallenge } = useChallengesFirebase();
  
  return { 
    challenges, 
    loading,
    error,
    createChallenge,
  };
}
