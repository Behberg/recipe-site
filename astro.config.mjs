// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Nomaini uz savu domēnu, kad tas ir piesaistīts Netlify.
const SITE_URL = process.env.URL || 'https://garsigi.netlify.app';

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'ignore',
  devToolbar: { enabled: false },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin') && !page.includes('/izlase'),
    }),
  ],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  build: {
    format: 'directory',
  },
});
