# hyperadapted.com — agent reference

Hyperadapted is Julian Hilgemann's creative alias, and this site is its hub: it gathers the writing, audiovisual work and music in one place and links out to the channels where each piece lives (Instagram, Medium, YouTube, Substack, all `@hyperadapted`). Static Astro 4 + Tailwind 3 site, English, deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

It is the sister site of [julianhilgemann.com](https://github.com/julianhilgemann/julianhilgemann.com) and must look like it: same tokens, same components, same motion. Together they tell one story, "signal → number → signal", in full on this site's `/story`: data work compresses the world into a number, expressive work opens it back up. julianhilgemann.com is the compression half (blue leads there); Hyperadapted is the expansion half (orange leads here). Each site's footer names the other as its other half.

## Site map

| Route | Page file | What it is |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | Hero (`Hero.astro`: gradient sheet, headline whose last word cycles, "sound." → "motion." …), "Latest" (the three newest projects), `FollowCTA`. Motion: `home.ts`. |
| `/projects` | `projects/index.astro` | Every published project, newest first; the newest card spans both columns. Motion: `page.ts`. |
| `/projects/<slug>` | `projects/[slug].astro` | One page per project hosted here (no `href`). Motion: `page.ts`. |
| `/story` | `story.astro` | The Story, moved here from julianhilgemann.com: seven chapters and a coda, one `StoryField` figure each and `NumberAnatomy` in chapter 6. Motion: `story.ts` + `story-field.ts`. See "Story" below. |
| `/about` | `about.astro` | What Hyperadapted is, the three strands (Writing, Audiovisual, Music), "Why Hyperadapted", the channels as link cards, "The other half". Motion: `page.ts`. |
| legal | `impressum`, `datenschutz`, `cookie-einstellungen` | German, as German law expects. Copied from julianhilgemann.com with the external-links list cut to this site's channels. |
| `404` | `404.astro` | |
| `/articles`, `/articles/<slug>` | `redirects` in `astro.config.mjs` | The old name of `/projects`, kept as redirects: static pages that meta-refresh, since GitHub Pages serves no server redirects. |

`src/layouts/Layout.astro` owns `<head>`, the GA4 consent defaults, the Klaro cookie banner config, Nav, Footer and the follow dialog.

## Domain

The site is served at `https://hyperadapted.com` (`site` in `astro.config.mjs`). It started at `julianhilgemann.github.io/hyperadapted.com/` under a `base`, which is why **every internal href and every public asset goes through `url()`** from `src/lib/url.ts`: `href={url("/projects")}`, `src={url(image)}`. Keep doing that; it costs nothing without a `base` and keeps a sub-path deploy one config line away. If a `base` is ever set again, `isPreview` adds `noindex` to every page.

- The custom domain is set in the repo's Pages settings (`gh api repos/julianhilgemann/hyperadapted.com/pages`), not by a `public/CNAME` file, which a custom Actions deploy ignores. HTTPS is enforced there too.
- DNS is at IONOS, set up like julianhilgemann.com's: four apex `A` records to GitHub Pages (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153) and `www` as a `CNAME` to `julianhilgemann.github.io`; GitHub redirects `www` to the apex. The domain's `MX` and SPF `TXT` records (IONOS mail) and the `google-site-verification` `TXT` record belong to other services: leave them alone.

## Projects

The work is called Projects, as on julianhilgemann.com, though a piece can be an essay as well as a video or a track. It was Articles until 2026-10-25.

`src/content/projects/*.md`, schema in `src/content/config.ts`: `title`, `description`, `date`, `category` (`Writing` | `Audiovisual` | `Music`, from `src/data/categories.ts`), optional `image` (a 16:9 file under `public/`, given as `/assets/...`), `href`, `draft`.

- No `href`: the project is hosted here; the body is the page, the file name is the slug.
- `href` set (a Medium post, a Substack letter, a YouTube video): the card links straight there with that channel's mark and verb ("Watch on YouTube", from `socialFor()` in `src/data/socials.ts`), and no page is built. The body can stay empty.
- `draft: true` keeps a file out of the build entirely.
- No `image`: `ProjectCard` draws a cover in the category's tone with the category's mark.

`welcome-to-hyperadapted`, `datasketches` and `notes-on-sound` are placeholders that say so in their last line. Replace them. `flyby` and `neon-maze` are real: YouTube Shorts, dated to the second of their upload (UTC) so they sort above the placeholders from the same day, with a 16:9 centre crop of the Short's frame as the cover.

Category → tone: Writing is `info` (blue: structure, thought), Audiovisual and Music are `primary` (orange: the expressive end). The tone colours the card's eyebrow, arrow and cover, and the project page's accents.

## Story

`/story` tells the arc both sites share: reality arrives as dense signal, data work compresses it down to a number, and expressive work opens that number back up. It was built on julianhilgemann.com and has lived only here since 2026-10-25. That site's `/story` forwards here with the `#chapter` kept, and its homepage links chapter 4 (`#structure`) and chapter 7 (`#expansion`), so keep the chapter ids. The source of the framing is the "Website Storyboard: Signal to Number and Back" doc, which also holds the copy variants and the slogan bank.

- **Links.** Chapters 1 and 2 go to About (`/about`, `/about#name`). The compression chapters 3 to 6 go to the work behind them: fx_macro_platform and hybrid_sales_pipeline_forecast on GitHub, and julianhilgemann.com's `/about#platform` and `/about#bi` through `mainSite("story", path)`. Chapter 7 and the coda lead to `/projects`; the coda's third button is Follow.
- **Files.** `story.astro` holds the copy and the chapter layout. `StoryField.astro` draws one still frame per chapter, seeded so the field is the same cloud in every build; `NumberAnatomy.astro` is chapter 6. `story.ts` and `story-field.ts` are the motion. Figure labels, chapter numbers and tags travel through the frontmatter `ui` object, and the chapter copy is eight literal sections rather than a `.map()`.
- **Tone.** Each chapter section carries a tone class: neutral for 1, blue (`tone-info`, system and structure) for 3 to 5, orange (`tone-primary`, belief, the number, the burst) for 2, 6 and 7. Chapter 7 is the one place both accents appear at once, so the expansion is felt rather than read.
- **Type.** It compresses with the narrative: measure and letter-spacing tighten from chapter 1 to 6, weight rises toward the number, which is set in monospace, and chapter 7 opens up again. The steps are `.ch-1` … `.ch-7` in the page's `<style>` block, small enough to feel rather than see.
- **Phones.** Figures that share a screen with text are sized by height below `lg` (`max-height` in `svh` plus `width: auto`), with a tighter step under `(max-height: 760px)` for short phones like an SE. Check a change at 375x667.

### How a chapter behaves

Each chapter is a full-height section (`100svh`) holding one card, and `story.ts` gives every chapter a single paused timeline that runs **once, on entry**. Nothing on this page is scrubbed: a reader should never have to keep scrolling to see a chapter finish.

- The card slides up and fades in first (a rise without scale: scaling a card that wide dragged its headline sideways); the marker, the masked headline lines, the paragraphs and the quiet link follow on the same timeline, so a chapter is never half-arrived. The figure starts at 0.22s — while the card is still moving — and lands just after it settles.
- Because the timelines are built paused at load, every `from` claims its hidden state immediately and nothing flashes before the reader gets there. The headline is split at entry rather than at load, so a resize on the way down cannot leave stale line breaks clipping inside their masks.
- A trigger that the page loads *past* never fires, which would leave a deep link (`/story#structure`, linked from julianhilgemann.com's homepage) staring at an invisible card. Each chapter therefore also checks its own position once at setup and plays immediately if it is already at or above the start line. Keep that check if you touch the entrance.
- When the timeline completes the figure starts its idle loop, which is the answer to "the chapter is finished, but the page should not look dead". The cards keep a plain border; the travelling conic light lives on the Follow buttons instead, as the `.orbit-ring` utility in `global.css` (`@property --orbit-angle`), so the one action on a page is the thing that keeps moving.

`StoryField` figures have two phases in `story-field.ts`: `fieldEnter(fig, tl, at)` adds tweens to the chapter's timeline, and `fieldIdle(fig)` is what keeps moving afterwards — bands drifting, rays flickering, a lineage edge pulsing, the forecast's dashes marching, the coda turning. The measurement figure borrows the choices-layer idiom from `NumberAnatomy`: every second or two one sample goes out and another lights, because the selection behind a number is never finished. Every idle is wrapped in `whileVisible`, which pauses it off-screen — eight chapters of endless animation would otherwise all run at once.

Figure geometry is in viewBox units. Anything pivoting on a point *in the drawing* (the inference fan on its last data point, the burst on its core) must use GSAP's `svgOrigin`, not `transformOrigin`, which measures from the element's own bounding box. And each figure's markup is its animated END state, so reduced-motion and no-JS visitors see exactly where the entrance lands.

### Still to build

The page ships as text and still frames, which is also the reduced-motion version and can never be blocked by the animation work. Not built yet: the one persistent particle field whose state blends per chapter (Three.js or regl behind an Astro island, driven by ScrollTrigger), the held beat at the number, chapter 7's opt-in audio with the Web Audio analyser and its **Expand** button, and a 10–12 second loop of the whole arc for julianhilgemann.com's homepage hero. The storyboard's plan is to prototype the field states in TouchDesigner and port them to GLSL.

## Channels

`src/data/socials.ts` is the one list: footer icons, the follow dialog, About's strands and link cards, and the CTA's icon row all read it, in its order. Marks are Simple Icons 16.35.0 paths. The Medium URL could not be verified from a script (Cloudflare); the others resolve. `src/data/site.ts` holds the email and `mainSite(placement)`, the utm-tagged link to julianhilgemann.com.

There is no contact button: the nav's orbiting action is **Follow**, and it, the footer's "Contact" and the CTA all open `FollowModal.astro` (any element with `.js-open-follow`; `data-location` names the placement in the `open_follow_modal` analytics event, and each channel click sends `follow_channel`).

## Design system

The tokens come from the [design-system](https://github.com/julianhilgemann/design-system) repo, included as a git submodule at `design-system/`. It has a light and a dark theme; julianhilgemann.com is light, this site is dark. The module's top-level exports are the dark theme, so `src/styles/tokens.mjs` only re-exports it, which keeps every import path identical to julianhilgemann.com's: a component or script copied from there works unchanged. To pull a token change: `git submodule update --remote design-system`, then commit the new submodule pointer. Clone with `--recurse-submodules` (or run `git submodule update --init`), or the build fails on the missing tokens.

Everything else follows julianhilgemann.com's AGENTS.md (its "Design system" and "Motion" sections), which is the reference for both sites:

- `tailwind.config.mjs` is copied as is: the palette is replaced, not extended, so only token colours exist (`text-white` compiles to nothing).
- `components.css` comes from the design-system submodule (`design-system/components.css`, imported first in `global.css`), the same file julianhilgemann.com uses; it also holds the nav's mobile menu styles, whose panel is the same frosted glass as the bar. `klaro.css` is copied as is; `global.css` is too, minus the CV timeline and plus `.project-body` (Markdown prose on token colours; there is no typography plugin).
- `Nav` (markup and script; its styles are in the shared component layer), `Footer`, `Layout`, `GradientSheet`, `ScrollCue`, `MotionIntro`, `Section` and the motion scripts (`motion.ts`, `page.ts`, `gradient-sheet.ts`) are the main site's, with only names, items and links changed. `home.ts` is the main site's hero motion without the pipeline diagram. `FollowModal` is its `ContactModal`, `FollowCTA` its `SecondaryCTA`, and `ProjectCard` is its `ProjectCard`, fed from the content collection instead of a data array.
- When a shared component changes on julianhilgemann.com, port the change here too.

The one deliberate difference: the hero's cycling words are orange (`from-primary to-primary-glow`) where the main site's are blue, and the favicon is a dark "H" on orange, the pair of the main site's dark "JH" on blue.

## Images

`scripts/render-images.sh` (macOS, Google Chrome) renders `public/og-image.jpg` from `scripts/og-image.html` and the two PNG icons from `public/favicon.svg`. Re-run it after changing either source, and commit the results.

## Analytics and the cookie banner

`GA_ID` in `Layout.astro` is the Hyperadapted GA4 property (`G-504TW02WH9`, separate from julianhilgemann.com's). gtag.js loads on every page with Consent Mode defaults denied; accepting in the Klaro banner grants analytics storage. The follow dialog sends `open_follow_modal` and `follow_channel` events. Klaro loads from jsDelivr and `src/styles/klaro.css` restyles it on the tokens (it must keep `top: auto`).

## Not carried over from julianhilgemann.com

The llms.txt generator, `/design-system`, `/hub`, `/services`, the German `de/` tree and `LayoutDE`. The legal pages here are the German ones, served at the top level.
