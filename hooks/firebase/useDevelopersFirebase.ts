'use client';

import { useState, useEffect } from 'react';
import { getFirebaseDb } from '@/lib/firebaseClient';
import { collection, query, onSnapshot, where, orderBy } from 'firebase/firestore';

export interface Developer {
  id: string;
  uid: string;
  name: string;
  title?: string;
  avatar?: string;
  skills: string[];
  bio?: string;
  location?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  projects: number;
  followers: number;
  createdAt: string;
}

export function useDevelopersFirebase() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getFirebaseDb();
    const profilesRef = collection(db, 'userProfiles');
    
    // Only get profiles that have at least one skill (indicating they've filled out their profile)
    const q = query(profilesRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const devsData = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            // Only include profiles with skills
            if (!data.skills || data.skills.length === 0) return null;
            
            return {
              id: doc.id,
              uid: data.uid || doc.id,
              name: data.displayName || data.name || 'Anonymous',
              title: data.title || data.bio?.substring(0, 50) || 'Developer',
              avatar: data.photoURL || data.avatar || '',
              skills: data.skills || [],
              bio: data.bio || '',
              location: data.location || '',
              github: data.github || '',
              linkedin: data.linkedin || '',
              website: data.website || '',
              projects: data.projectCount || 0,
              followers: data.followerCount || 0,
              createdAt: data.createdAt || new Date().toISOString(),
            } as Developer;
          })
          .filter((dev): dev is Developer => dev !== null);
        
        setDevelopers(devsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching developers:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return {
    developers,
    loading,
    error,
  };
}
