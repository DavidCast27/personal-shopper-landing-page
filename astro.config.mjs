// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

import sitemap from '@astrojs/sitemap';

const SITE_URL = process.env.SITE_URL || 'http://localhost:4321';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [sitemap()],
});
