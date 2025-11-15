"use client";

import { useMemo } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useComments } from '@/src/hooks/useComments';
import type { CommentPage, ProjectComment } from '@/src/types/project';

const schema = z.object({
  body: z.string().min(2, 'Say something...').max(1500, 'Keep it concise (max 1500 chars).'),
});

type FormValues = z.infer<typeof schema>;

interface CommentThreadProps {
  projectId: string;
}

export function CommentThread({ projectId }: CommentThreadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { commentsPages, fetchNextPage, hasNextPage, submitComment, submitting } = useComments(projectId);
  const { register, handleSubmit, reset, formState } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const comments = useMemo<ProjectComment[]>(
    () => commentsPages.flatMap((page: CommentPage) => page.comments),
    [commentsPages]
  );

  const onSubmit = handleSubmit(async (data) => {
    if (!user) {
      toast({ title: 'Login required', description: 'Sign in to join the conversation.' });
      return;
    }

    await submitComment({
      body: data.body,
      author: {
        id: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'Member',
        avatarUrl: user.photoURL || 'https://avatars.githubusercontent.com/u/1?v=4',
      },
    });
    reset();
  });

  return (
    <section id="comments" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Comments</h3>
        <span className="text-sm text-muted-foreground">{comments.length} total</span>
      </div>
      <div className="space-y-3">
        {comments.map((comment) => (
          <article key={comment.id} className="rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3 text-sm">
              <Image
                src={comment.author.avatarUrl || 'https://avatars.githubusercontent.com/u/1?v=4'}
                alt={comment.author.displayName}
                width={32}
                height={32}
                className="rounded-full"
                unoptimized
              />
              <div>
                <p className="font-medium">{comment.author.displayName}</p>
                <p className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed">{comment.body}</p>
          </article>
        ))}
        {!comments.length && <p className="text-sm text-muted-foreground">No comments yet.</p>}
      </div>

      {hasNextPage && (
        <button type="button" onClick={() => fetchNextPage()} className="glass-button-ghost text-sm">
          Load older comments
        </button>
      )}

      <form onSubmit={onSubmit} className="space-y-2">
        <textarea
          {...register('body')}
          className="glass-input w-full min-h-[120px]"
          placeholder={user ? 'Share feedback or ask a question…' : 'Sign in to comment'}
          disabled={!user || submitting}
        />
        {formState.errors.body && <p className="text-xs text-red-400">{formState.errors.body.message}</p>}
        <button type="submit" className="glass-button text-sm" disabled={!user || submitting}>
          {submitting ? 'Posting…' : 'Post comment'}
        </button>
      </form>
    </section>
  );
}

export default CommentThread;
