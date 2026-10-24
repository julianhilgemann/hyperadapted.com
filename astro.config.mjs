import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// Served from GitHub Pages at julianhilgemann.github.io/hyperadapted.com/
// while the hyperadapted.com domain still points at the old site. Astro does
// not prefix links with `base` itself, so every internal href and public
// asset goes through `url()` in src/lib/url.ts.
//
// Moving to the custom domain (AGENTS.md has the full checklist):
//   site: 'https://hyperadapted.com', delete `base`, add public/CNAME.
export default defineConfig({
    site: 'https://julianhilgemann.github.io',
    base: '/hyperadapted.com',
    integrations: [tailwind()],
});
