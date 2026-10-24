import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// Served from GitHub Pages on the custom domain, which is set in the repo's
// Pages settings (a custom Actions deploy ignores a CNAME file). Internal
// links and assets go through `url()` in src/lib/url.ts, so serving under a
// sub-path again only takes a `base` here.
export default defineConfig({
    site: 'https://hyperadapted.com',
    integrations: [tailwind()],
});
