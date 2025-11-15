'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToggleLike } from '@/src/hooks/useProjects';
import { LIKE_COOLDOWN_MS } from '@/src/config/constants';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  projectId: string;
  initialCount: number;
  initialLiked?: boolean;
  className?: string;
}

export function LikeButton({ projectId, initialCount, initialLiked = false, className }: LikeButtonProps) {
  const { user } = useAuth();
  const mutation = useToggleLike(projectId);
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [cooldown, setCooldown] = useState(false);

  useEffect(() => {
    setLiked(initialLiked);
  }, [initialLiked]);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  const toggle = async () => {
    if (!user || mutation.isPending || cooldown) return;
    setCooldown(true);
    setTimeout(() => setCooldown(false), LIKE_COOLDOWN_MS);
    const optimisticLiked = !liked;
    const optimisticCount = liked ? Math.max(0, count - 1) : count + 1;
    setLiked(optimisticLiked);
    setCount(optimisticCount);

    try {
      const result = await mutation.mutateAsync({ userId: user.uid });
      setLiked(result.liked);
      setCount(result.likesCount);
    } catch (error) {
      setLiked(liked);
      setCount(count);
      console.error('[LikeButton] toggle failed', error);
    }
  };

  const disabled = !user || mutation.isPending || cooldown;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1 text-sm transition-colors',
        liked ? 'text-rose-400' : 'text-muted-foreground hover:text-white',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      aria-pressed={liked}
      aria-label="Like project"
    >
      <Heart className={cn('h-4 w-4', liked && 'fill-current text-rose-400')} />
      {count}
    </button>
  );
}
