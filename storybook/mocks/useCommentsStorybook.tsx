import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { CommentPage, CreateCommentInput, ProjectComment } from '@/src/types/project';

interface StorybookCommentsValue {
  commentsPages: CommentPage[];
  fetchNextPage: () => Promise<void> | void;
  hasNextPage: boolean;
  isFetching: boolean;
  submitComment: (input: CreateCommentInput) => Promise<ProjectComment>;
  submitting: boolean;
}

const emptyState: StorybookCommentsValue = {
  commentsPages: [{ comments: [], nextCursor: undefined }],
  fetchNextPage: async () => undefined,
  hasNextPage: false,
  isFetching: false,
  submitComment: async (input) => ({
    id: `storybook-comment-${Date.now()}`,
    body: input.body,
    projectId: 'storybook-project',
    author: input.author,
    createdAt: new Date().toISOString(),
  }),
  submitting: false,
};

const StorybookCommentsContext = createContext<StorybookCommentsValue>(emptyState);

export const StorybookCommentsProvider = ({ children, value }: { children: ReactNode; value?: Partial<StorybookCommentsValue> }) => {
  const memoized = useMemo<StorybookCommentsValue>(() => ({
    ...emptyState,
    ...value,
    commentsPages: value?.commentsPages ?? emptyState.commentsPages,
  }), [value]);
  return <StorybookCommentsContext.Provider value={memoized}>{children}</StorybookCommentsContext.Provider>;
};

export const useComments = () => useContext(StorybookCommentsContext);

export const buildCommentsPage = (comments: ProjectComment[]): CommentPage => ({ comments, nextCursor: undefined });
