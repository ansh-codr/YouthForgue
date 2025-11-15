import React, { useMemo } from 'react';
import type { Decorator, Preview } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../app/globals.css';
import { StorybookAuthProvider, defaultStorybookUser } from '@/storybook/mocks/useAuthStorybook';
import { StorybookCommentsProvider } from '@/storybook/mocks/useCommentsStorybook';
import { Toaster } from '@/components/ui/toaster';

const withProviders: Decorator = (Story, context) => {
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: { queries: { retry: false } },
  }), []);

  const authUser = context.parameters.authUser ?? defaultStorybookUser;
  const commentsState = context.parameters.commentsState;

  return (
    <QueryClientProvider client={queryClient}>
      <StorybookAuthProvider initialUser={authUser}>
        <StorybookCommentsProvider value={commentsState}>
          <div className="min-h-screen w-full bg-[#020617] text-white px-6 py-10">
            <Story />
            <Toaster />
          </div>
        </StorybookCommentsProvider>
      </StorybookAuthProvider>
    </QueryClientProvider>
  );
};

const preview: Preview = {
  decorators: [withProviders],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    layout: 'fullscreen',
  },
};

export default preview;
