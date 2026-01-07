// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Use Vercel preview URL until custom domain is set
  site: 'https://landing-page-ten-indol-38.vercel.app',
  // Avoid dev warnings and accept both with/without slash
  trailingSlash: 'ignore',
  output: 'server',
  adapter: vercel({}),
  integrations: [
    sitemap({
      // Generate proper i18n alternates for en/es/fr
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          es: 'es',
          fr: 'fr',
        },
      },
      // Exclude non-indexable/technical routes
      filter: (page) => {
        const deny = ['/admin.html', '/robots.txt', '/oauth/', '/api/'];
        if (deny.some((d) => page === d || page.startsWith(d))) return false;
        // Exclude root redirect and contact success regardless of trailing slash
        if (page === '/') return false;
        if (page.endsWith('/contact/success') || page.endsWith('/contact/success/')) return false;
        return true;
      },
    }),
  ],
});
