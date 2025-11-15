'use client';

import { useState, useEffect } from 'react';
import { getFirebaseDb } from '@/lib/firebaseClient';
import { collection, query, onSnapshot, addDoc, orderBy, Timestamp } from 'firebase/firestore';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Intermediate' | 'Hard';
  category: string;
  image?: string;
  tags: string[];
  prize?: string;
  participants: number;
  deadline: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
  };
}

export function useChallengesFirebase() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getFirebaseDb();
    const challengesRef = collection(db, 'challenges');
    const q = query(challengesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const challengesData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || '',
            description: data.description || '',
            difficulty: data.difficulty || 'Intermediate',
            category: data.category || 'General',
            image: data.image || '',
            tags: data.tags || [],
            prize: data.prize,
            participants: data.participants || 0,
            deadline: data.deadline instanceof Timestamp 
              ? data.deadline.toDate().toISOString() 
              : data.deadline || '',
            createdAt: data.createdAt instanceof Timestamp 
              ? data.createdAt.toDate().toISOString() 
              : data.createdAt || new Date().toISOString(),
            createdBy: data.createdBy || { id: '', name: 'Anonymous' },
          };
        });
        setChallenges(challengesData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching challenges:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const createChallenge = async (challengeData: Omit<Challenge, 'id' | 'createdAt' | 'participants'>) => {
    try {
      const db = getFirebaseDb();
      const challengesRef = collection(db, 'challenges');
      
      await addDoc(challengesRef, {
        ...challengeData,
        participants: 0,
        createdAt: Timestamp.now(),
      });

      return { success: true };
    } catch (err: any) {
      console.error('Error creating challenge:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    challenges,
    loading,
    error,
    createChallenge,
  };
}
