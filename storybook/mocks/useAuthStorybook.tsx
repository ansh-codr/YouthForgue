import React, { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type StorybookAuthUser = {
  uid: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
};

interface StorybookAuthValue {
  user: StorybookAuthUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
}

const defaultUser: StorybookAuthUser = {
  uid: 'storybook-user',
  displayName: 'Story Booker',
  email: 'storybook@youthforge.dev',
  photoURL: 'https://avatars.githubusercontent.com/u/583231?v=4',
};

const StorybookAuthContext = createContext<StorybookAuthValue | null>(null);

const mockAuthResponse = async () => ({ success: true as const });

export const StorybookAuthProvider = ({ children, initialUser = defaultUser }: { children: ReactNode; initialUser?: StorybookAuthUser | null }) => {
  const [user, setUser] = useState<StorybookAuthUser | null>(initialUser ?? defaultUser);

  const value = useMemo<StorybookAuthValue>(() => ({
    user,
    loading: false,
    error: null,
    signIn: async () => mockAuthResponse(),
    signUp: async () => mockAuthResponse(),
    signInWithGoogle: async () => mockAuthResponse(),
    signOut: async () => {
      setUser(null);
      return mockAuthResponse();
    },
  }), [user]);

  return <StorybookAuthContext.Provider value={value}>{children}</StorybookAuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(StorybookAuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within StorybookAuthProvider when running Storybook');
  }
  return ctx;
};

export const buildStorybookUser = (overrides: Partial<StorybookAuthUser> = {}): StorybookAuthUser => ({
  ...defaultUser,
  ...overrides,
});

export const defaultStorybookUser = defaultUser;
