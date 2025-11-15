'use client';

import { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebaseClient';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setAuthState({ user, loading: false, error: null });
      },
      (error) => {
        console.error('[useAuth] Auth state change error:', error);
        setAuthState({ user: null, loading: false, error: error.message });
      }
    );

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      const auth = getFirebaseAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setAuthState({ user: userCredential.user, loading: false, error: null });
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Sign in failed';
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      const auth = getFirebaseAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setAuthState({ user: userCredential.user, loading: false, error: null });
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Sign up failed';
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const signInWithGoogle = async () => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      setAuthState({ user: userCredential.user, loading: false, error: null });
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Google sign in failed';
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      const auth = getFirebaseAuth();
      await firebaseSignOut(auth);
      setAuthState({ user: null, loading: false, error: null });
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Sign out failed';
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };
};
