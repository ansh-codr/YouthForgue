'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PROJECT_FEED_CACHE_TTL_MS } from '@/src/config/constants';

interface Props {
  children: ReactNode;
}

export function QueryProvider({ children }: Props) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: PROJECT_FEED_CACHE_TTL_MS,
            refetchOnWindowFocus: false,
            gcTime: PROJECT_FEED_CACHE_TTL_MS * 4,
          },
          mutations: {
            retry: 2,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} position="bottom" />}
    </QueryClientProvider>
  );
}
