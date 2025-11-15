'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebaseClient';
import { useAuth } from './useAuth';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  skills?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export const useUserProfile = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.uid;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    const db = getFirebaseDb();
    const profileRef = doc(db, 'userProfiles', targetUserId);

    const unsubscribe = onSnapshot(
      profileRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          // If no profile exists, create a default one from auth data
          if (user && targetUserId === user.uid) {
            setProfile({
              uid: user.uid,
              displayName: user.displayName || user.email?.split('@')[0] || 'User',
              email: user.email || '',
              photoURL: user.photoURL || '',
              skills: [],
            });
          } else {
            setProfile(null);
          }
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('[useUserProfile] Error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [targetUserId, user]);

  return { profile, loading, error };
};
