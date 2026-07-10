import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  stories: [
    '../packages/ui/src/**/*.mdx',
    '../packages/ui/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../apps/bytebank-app/src/**/*.mdx',
    '../apps/bytebank-app/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@chromatic-com/storybook',
  ],
  framework: '@storybook/nextjs-vite',
  staticDirs: ['../apps/bytebank-app/public'],
};

export default config;
