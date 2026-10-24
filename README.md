# hyperadapted.com

The website of **Hyperadapted**: writing, audiovisual art and music, where data turns back into something you can feel. It is the hub for the work and links out to the channels where each piece lives.

**Preview:** https://julianhilgemann.github.io/hyperadapted.com/

| Channel | |
| --- | --- |
| Instagram | [@hyperadapted](https://www.instagram.com/hyperadapted/) |
| Medium | [@hyperadapted](https://medium.com/@hyperadapted) |
| YouTube | [@hyperadapted](https://www.youtube.com/@hyperadapted) |
| Substack | [@hyperadapted](https://substack.com/@hyperadapted) |

Hyperadapted is the sister site of [julianhilgemann.com](https://julianhilgemann.com/?utm_source=github&utm_medium=referral&utm_campaign=hyperadapted-repo): the same pipeline run the other way, and the same design language, shared through the [design-system](https://github.com/julianhilgemann/design-system) tokens.

## Stack

Static [Astro](https://astro.build) 4 with Tailwind CSS 3 and GSAP, deployed to GitHub Pages by a GitHub Action on every push to `main`. Design tokens come from the `design-system` git submodule.

## Develop

```sh
git clone --recurse-submodules https://github.com/julianhilgemann/hyperadapted.com.git
cd hyperadapted.com
npm install
npm run dev      # http://localhost:4321/hyperadapted.com/
npm run build    # static site in dist/
```

## Add an article

Add a Markdown file to `src/content/articles/`:

```md
---
title: "A new piece"
description: "One sentence for the card and the link preview."
date: 2026-11-01
category: Writing          # Writing | Audiovisual | Music
image: /assets/articles/a-new-piece.webp   # optional, 16:9, under public/
href: https://medium.com/@hyperadapted/... # optional: link out instead of hosting it here
---

The article, if it lives here.
```

With `href`, the card links straight to that post or video and no page is built here. See [AGENTS.md](AGENTS.md) for the full reference.
