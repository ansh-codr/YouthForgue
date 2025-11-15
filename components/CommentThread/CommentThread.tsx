"use client";
import React, { useState } from 'react';
import { useYouthForgeStore } from '@/lib/mockStore';
import { useAuthMock } from '@/hooks/useAuthMock';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({ body: z.string().min(2, 'Say something...').max(2000) });

type FormValues = z.infer<typeof schema>;

export function CommentThread({ projectId }: { projectId: string }) {
  const comments = useYouthForgeStore(s => s.comments.filter(c => c.projectId === projectId));
  const addComment = useYouthForgeStore(s => s.addComment);
  const { user, isAuthenticated } = useAuthMock();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    if (!isAuthenticated) return;
    setSubmitting(true);
    await addComment(projectId, data.body, user || { id: 'anon', name: 'Guest', avatar: '' });
    setSubmitting(false);
    reset();
  };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold">Comments</h4>
      <ul className="space-y-3">
        {comments.map(c => (
          <li key={c.id} className="glass-light p-3 rounded">
            <p className="text-sm"><span className="font-medium">{c.author.name}:</span> {c.body}</p>
            <p className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <textarea
          {...register('body')}
          className="glass-input w-full min-h-[80px]"
          placeholder={isAuthenticated ? 'Write a comment...' : 'Login to comment'}
          disabled={!isAuthenticated || submitting}
        />
        {errors.body && <p className="text-xs text-red-400">{errors.body.message}</p>}
        <button type="submit" className="glass-button text-sm" disabled={!isAuthenticated || submitting}>
          {submitting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>
    </div>
  );
}

export default CommentThread;
