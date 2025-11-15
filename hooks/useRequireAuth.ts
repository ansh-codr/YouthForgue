'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function useRequireAuth(redirectTo: string = '/') {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        toast.error('Please sign in to continue');
        router.push(redirectTo);
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, loading, router, redirectTo]);

  return { user, loading, isAuthorized };
}
