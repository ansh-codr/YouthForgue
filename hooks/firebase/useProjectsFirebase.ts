'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  updateDoc,
  addDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
  increment,
  getDoc,
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebaseClient';
import type { Project, Comment } from '@/lib/types';

// Firestore document structure includes arrays for likes and comments
interface FirestoreProject {
  title: string;
  excerpt: string;
  description?: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  tags: string[];
  media: Array<{
    id: string;
    type: 'image' | 'video';
    url: string;
    alt?: string;
    previewUrl?: string;
  }>;
  likes: string[]; // Array of user IDs
  comments: Array<{
    id: string;
    author: {
      id: string;
      name: string;
      avatar: string;
    };
    body: string;
    parentId?: string;
    createdAt: string;
  }>;
  repoLink?: string;
  isFeatured?: boolean;
  createdAt: any;
  updatedAt?: any;
}

export const useProjectsFirebase = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time listener for projects collection
  useEffect(() => {
    const db = getFirebaseDb();
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const projectsData = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as FirestoreProject;
          
          // Convert Firestore structure to app Project type
          const project: Project = {
            id: docSnap.id,
            title: data.title,
            excerpt: data.excerpt,
            description: data.description,
            author: data.author,
            tags: data.tags || [],
            media: data.media || [],
            likeCount: (data.likes || []).length,
            commentCount: (data.comments || []).length,
            repoLink: data.repoLink,
            isFeatured: data.isFeatured,
            createdAt: data.createdAt instanceof Timestamp 
              ? data.createdAt.toDate().toISOString() 
              : data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt instanceof Timestamp
              ? data.updatedAt.toDate().toISOString()
              : data.updatedAt,
          };
          
          return project;
        });
        setProjects(projectsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('[useProjectsFirebase] Snapshot error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const likeProject = async (projectId: string, userId: string) => {
    try {
      const db = getFirebaseDb();
      const projectRef = doc(db, 'projects', projectId);
      
      // Get current document to check likes array
      const projectSnap = await getDoc(projectRef);
      if (!projectSnap.exists()) throw new Error('Project not found');
      
      const data = projectSnap.data() as FirestoreProject;
      const hasLiked = (data.likes || []).includes(userId);
      
      await updateDoc(projectRef, {
        likes: hasLiked ? arrayRemove(userId) : arrayUnion(userId),
      });

      return { success: true };
    } catch (err: any) {
      console.error('[useProjectsFirebase] Like error:', err);
      return { success: false, error: err.message };
    }
  };

  const addComment = async (projectId: string, commentData: Omit<Comment, 'id' | 'createdAt' | 'projectId'>) => {
    try {
      const db = getFirebaseDb();
      const projectRef = doc(db, 'projects', projectId);

      const newComment = {
        id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        author: commentData.author,
        body: commentData.body,
        parentId: commentData.parentId,
        createdAt: new Date().toISOString(),
      };

      await updateDoc(projectRef, {
        comments: arrayUnion(newComment),
      });

      return { success: true };
    } catch (err: any) {
      console.error('[useProjectsFirebase] Add comment error:', err);
      return { success: false, error: err.message };
    }
  };

  const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'likeCount' | 'commentCount'>) => {
    try {
      const db = getFirebaseDb();
      const projectsRef = collection(db, 'projects');

      const newProject: Omit<FirestoreProject, 'createdAt'> = {
        title: projectData.title,
        excerpt: projectData.excerpt,
        description: projectData.description,
        author: projectData.author,
        tags: projectData.tags,
        media: projectData.media,
        likes: [],
        comments: [],
        repoLink: projectData.repoLink,
        isFeatured: projectData.isFeatured,
      };

      const docRef = await addDoc(projectsRef, {
        ...newProject,
        createdAt: serverTimestamp(),
      });
      
      return { success: true, id: docRef.id };
    } catch (err: any) {
      console.error('[useProjectsFirebase] Create project error:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    projects,
    loading,
    error,
    likeProject,
    addComment,
    createProject,
  };
};
