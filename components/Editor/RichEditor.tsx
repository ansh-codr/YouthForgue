"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { useYouthForgeStore } from '@/lib/mockStore';

const schema = z.object({
  title: z.string().min(3, 'Title is too short'),
  body: z.string().min(10, 'Write at least 10 characters'),
  tags: z.array(z.string()).max(6, 'Up to 6 tags'),
});

type FormValues = z.infer<typeof schema>;

interface RichEditorProps {
  className?: string;
  onSubmit?: (data: FormValues) => Promise<void> | void;
}

export function RichEditor({ className, onSubmit }: RichEditorProps) {
  const tags = useYouthForgeStore(s => s.tags);
  const [preview, setPreview] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', body: '', tags: [] },
  });
  const selected = watch('tags');

  const toggleTag = (tagId: string) => {
    const next = selected.includes(tagId)
      ? selected.filter(t => t !== tagId)
      : [...selected, tagId];
    setValue('tags', next);
  };

  const submit = async (data: FormValues) => {
    if (onSubmit) await onSubmit(data);
    // else no-op; in dev page we showcase consumption
  };

  return (
    <form onSubmit={handleSubmit(submit)} className={cn('glass-card p-4 space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Create Post</h3>
        <button type="button" className="text-xs glass-button-ghost" onClick={() => setPreview(p => !p)} aria-pressed={preview}>
          {preview ? 'Edit' : 'Preview'}
        </button>
      </div>

      <label className="block">
        <span className="text-xs text-muted-foreground">Title</span>
        <input aria-label="Title" className="glass-input w-full" {...register('title')} />
        {errors.title && <p role="alert" className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
      </label>

      {!preview ? (
        <label className="block">
          <span className="text-xs text-muted-foreground">Markdown</span>
          <textarea aria-label="Body" rows={6} className="glass-input w-full min-h-[140px]" {...register('body')} />
          {errors.body && <p role="alert" className="text-xs text-red-500 mt-1">{errors.body.message}</p>}
        </label>
      ) : (
        <div className="prose prose-invert max-w-none p-3 rounded bg-white/5 border border-white/10" aria-label="Preview">
          {watch('body') || <span className="text-muted-foreground">Nothing to preview…</span>}
        </div>
      )}

      <div>
        <p className="text-xs text-muted-foreground mb-2">Select tags</p>
        <div className="flex flex-wrap gap-2">
          {tags.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => toggleTag(t.id)}
              className={cn('px-2 py-1 rounded border text-xs', selected.includes(t.id) ? 'bg-accent/20 border-accent text-accent' : 'bg-transparent border-white/10 text-white/80')}
              aria-pressed={selected.includes(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {errors.tags && <p role="alert" className="text-xs text-red-500 mt-1">{errors.tags.message}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="reset" className="glass-button-ghost text-xs">Reset</button>
        <button type="submit" className="glass-button text-xs">Publish</button>
      </div>
    </form>
  );
}

export default RichEditor;
