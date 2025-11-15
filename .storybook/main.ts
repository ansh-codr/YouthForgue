import path from 'path';
import type { TransformOptions } from '@babel/core';
import type { Configuration, RuleSetRule } from 'webpack';
import type { StorybookConfig } from '@storybook/react-webpack5';

const config: StorybookConfig = {
  stories: ['../components/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  babel: async (options: TransformOptions) => ({
    ...options,
    presets: [
      ...(options.presets ?? []),
      require.resolve('@babel/preset-typescript'),
    ],
  }),
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  staticDirs: ['../public'],
  webpackFinal: async (config: Configuration) => {
    config.resolve = config.resolve ?? {};
    config.resolve.extensions = Array.from(new Set([...(config.resolve.extensions ?? []), '.ts', '.tsx']));
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      '@': path.resolve(__dirname, '..'),
      'next/link': path.resolve(__dirname, '../__mocks__/next/link.tsx'),
      'next/image': path.resolve(__dirname, '../__mocks__/next/image.tsx'),
      '@/hooks/useAuth': path.resolve(__dirname, '../storybook/mocks/useAuthStorybook.tsx'),
      '@/src/hooks/useComments': path.resolve(__dirname, '../storybook/mocks/useCommentsStorybook.tsx'),
      '@/src/lib/upload': path.resolve(__dirname, '../storybook/mocks/uploadMock.ts'),
      'next/navigation': path.resolve(__dirname, '../storybook/mocks/nextNavigationMock.ts'),
    };

    if (!config.module) config.module = { rules: [] };
    if (!config.module.rules) config.module.rules = [];

    const tsRule: RuleSetRule = {
      test: /\.(ts|tsx)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: require.resolve('babel-loader'),
          options: {
            presets: [
              require.resolve('@babel/preset-env'),
              [require.resolve('@babel/preset-react'), { runtime: 'automatic' }],
              require.resolve('@babel/preset-typescript'),
            ],
          },
        },
      ],
    };
    config.module.rules.push(tsRule);

    return config;
  },
};

export default config;
