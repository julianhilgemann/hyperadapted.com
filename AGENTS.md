# hyperadapted.com — agent reference

Hyperadapted is Julian Hilgemann's creative alias, and this site is its hub: it gathers the writing, audiovisual work and music in one place and links out to the channels where each piece lives (Instagram, Medium, YouTube, Substack, all `@hyperadapted`). Static Astro 4 + Tailwind 3 site, English, deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

It is the sister site of [julianhilgemann.com](https://github.com/julianhilgemann/julianhilgemann.com) and must look like it: same tokens, same components, same motion. That site tells the story "signal → number → signal": data work compresses the world into a number, expressive work opens it back up. julianhilgemann.com is the compression half (blue leads there); Hyperadapted is the expansion half (orange leads here). Each site's footer names the other as its other half.

## Site map

| Route | Page file | What it is |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | Hero (`Hero.astro`: gradient sheet, headline whose last word cycles, "sound." → "motion." …), "Latest" (the three newest articles), `FollowCTA`. Motion: `home.ts`. |
| `/articles` | `articles/index.astro` | Every published article, newest first; the newest card spans both columns. Motion: `page.ts`. |
| `/articles/<slug>` | `articles/[slug].astro` | One page per article hosted here (no `href`). Motion: `page.ts`. |
| `/about` | `about.astro` | What Hyperadapted is, the three strands (Writing, Audiovisual, Music), "Why Hyperadapted", the channels as link cards, "The other half". Motion: `page.ts`. |
| legal | `impressum`, `datenschutz`, `cookie-einstellungen` | German, as German law expects. Copied from julianhilgemann.com with the external-links list cut to this site's channels. |
| `404` | `404.astro` | |

`src/layouts/Layout.astro` owns `<head>`, the GA4 consent defaults, the Klaro cookie banner config, Nav, Footer and the follow dialog.

## Served under a sub-path, for now

Until the domain moves, the site is served at `https://julianhilgemann.github.io/hyperadapted.com/` (`base` in `astro.config.mjs`). Astro prefixes its own bundles but not your links, so **every internal href and every public asset goes through `url()`** from `src/lib/url.ts`: `href={url("/articles")}`, `src={url(image)}`. A bare `href="/about"` works in no environment but the custom domain. Markdown in articles cannot call `url()`, so link between articles with absolute URLs or not at all. While `base` is set, `isPreview` adds `noindex` to every page so the preview stays out of search.

hyperadapted.com itself still points at the old Webflow site. Moving the domain here:

1. `astro.config.mjs`: `site: 'https://hyperadapted.com'`, delete `base`.
2. Add `public/CNAME` containing `hyperadapted.com`.
3. DNS (at the registrar): apex `A` records to GitHub Pages (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153), `www` `CNAME` to `julianhilgemann.github.io`.
4. Repo Settings → Pages: custom domain `hyperadapted.com`, enforce HTTPS once the certificate is issued.
5. julianhilgemann.com: its footer and `/story` still label the link "Coming Soon: Hyperadapted" (`HYPERADAPTED_LABEL` in `story.astro`, the footer's own copy).

## Articles

`src/content/articles/*.md`, schema in `src/content/config.ts`: `title`, `description`, `date`, `category` (`Writing` | `Audiovisual` | `Music`, from `src/data/categories.ts`), optional `image` (a 16:9 file under `public/`, given as `/assets/...`), `href`, `draft`.

- No `href`: the article is hosted here; the body is the article, the file name is the slug.
- `href` set (a Medium post, a Substack letter, a YouTube video): the card links straight there with that channel's mark and verb ("Watch on YouTube", from `socialFor()` in `src/data/socials.ts`), and no page is built. The body can stay empty.
- `draft: true` keeps a file out of the build entirely.
- No `image`: `ArticleCard` draws a cover in the category's tone with the category's mark.

The three articles that ship are placeholders that say so in their last line. Replace them.

Category → tone: Writing is `info` (blue: structure, thought), Audiovisual and Music are `primary` (orange: the expressive end). The tone colours the card's eyebrow, arrow and cover, and the article page's accents.

## Channels

`src/data/socials.ts` is the one list: footer icons, the follow dialog, About's strands and link cards, and the CTA's icon row all read it, in its order. Marks are Simple Icons 16.35.0 paths. The Medium URL could not be verified from a script (Cloudflare); the others resolve. `src/data/site.ts` holds the email and `mainSite(placement)`, the utm-tagged link to julianhilgemann.com.

There is no contact button: the nav's orbiting action is **Follow**, and it, the footer's "Contact" and the CTA all open `FollowModal.astro` (any element with `.js-open-follow`; `data-location` names the placement in the `open_follow_modal` analytics event, and each channel click sends `follow_channel`).

## Design system

The tokens come from the [design-system](https://github.com/julianhilgemann/design-system) repo, included as a git submodule at `design-system/`. It has a light and a dark theme; julianhilgemann.com is light, this site is dark. The module's top-level exports are the dark theme, so `src/styles/tokens.mjs` only re-exports it, which keeps every import path identical to julianhilgemann.com's: a component or script copied from there works unchanged. To pull a token change: `git submodule update --remote design-system`, then commit the new submodule pointer. Clone with `--recurse-submodules` (or run `git submodule update --init`), or the build fails on the missing tokens.

Everything else follows julianhilgemann.com's AGENTS.md (its "Design system" and "Motion" sections), which is the reference for both sites:

- `tailwind.config.mjs` is copied as is: the palette is replaced, not extended, so only token colours exist (`text-white` compiles to nothing).
- `components.css` and `klaro.css` are copied as is; `global.css` is too, minus the CV timeline and plus `.article-body` (Markdown prose on token colours; there is no typography plugin).
- `Nav`, `Footer`, `Layout`, `GradientSheet`, `ScrollCue`, `MotionIntro`, `Section` and the motion scripts (`motion.ts`, `page.ts`, `gradient-sheet.ts`) are the main site's, with only names, items and links changed. `home.ts` is the main site's hero motion without the pipeline diagram. `FollowModal` is its `ContactModal`, `FollowCTA` its `SecondaryCTA`, `ArticleCard` its `ProjectCard`.
- When a shared component changes on julianhilgemann.com, port the change here too.

The one deliberate difference: the hero's cycling words are orange (`from-primary to-primary-glow`) where the main site's are blue, and the favicon is a dark "H" on orange, the pair of the main site's dark "JH" on blue.

## Images

`scripts/render-images.sh` (macOS, Google Chrome) renders `public/og-image.jpg` from `scripts/og-image.html` and the two PNG icons from `public/favicon.svg`. Re-run it after changing either source, and commit the results.

## Analytics and the cookie banner

`GA_ID` in `Layout.astro` is empty: no GA4 property exists yet. The consent defaults and the Klaro banner run regardless; once an ID is set, gtag.js loads and the banner's choice governs it. Klaro loads from jsDelivr and `src/styles/klaro.css` restyles it on the tokens (it must keep `top: auto`).

## Not carried over from julianhilgemann.com

The llms.txt generator, `/design-system`, `/hub`, `/story`, `/services`, the German `de/` tree and `LayoutDE`. The legal pages here are the German ones, served at the top level.
