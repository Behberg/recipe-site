// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';

// Nomaini uz savu domēnu, kad tas ir piesaistīts Netlify.
const SITE_URL = process.env.URL || 'https://dzervene.netlify.app';

// Recipe dates for <lastmod> in the sitemap, so Google knows what is new.
const recipeDates = new Map();
for (const file of fs.readdirSync('./src/content/recipes')) {
  if (!/^[^.]+\.md$/.test(file)) continue;
  const date = fs.readFileSync(`./src/content/recipes/${file}`, 'utf8').match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1];
  if (date) recipeDates.set(file.replace('.md', ''), date);
}

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'ignore',
  devToolbar: { enabled: false },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin') && !page.includes('/izlase') && !/\/404\/?$/.test(page) && !page.includes('/img/'),
      // Adds <xhtml:link hreflang> alternates between the Latvian, English, Russian and Lithuanian pages.
      i18n: {
        defaultLocale: 'lv',
        locales: { lv: 'lv', en: 'en', ru: 'ru', lt: 'lt' },
      },
      serialize(item) {
        const slug = item.url.match(/\/recepte\/([^/]+)\/?$/)?.[1];
        const date = slug && recipeDates.get(slug);
        if (date) item.lastmod = new Date(date).toISOString();
        return item;
      },
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
