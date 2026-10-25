import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// Served from GitHub Pages on the custom domain, which is set in the repo's
// Pages settings (a custom Actions deploy ignores a CNAME file). Internal
// links and assets go through `url()` in src/lib/url.ts, so serving under a
// sub-path again only takes a `base` here.
export default defineConfig({
    site: 'https://hyperadapted.com',
    integrations: [tailwind()],
    // The work was listed under /articles until it took julianhilgemann.com's
    // name for it. GitHub Pages serves no server redirects, so these build as
    // static pages that meta-refresh and carry a canonical link.
    redirects: {
        '/articles': '/projects',
        '/articles/[slug]': '/projects/[slug]',
    },
});
