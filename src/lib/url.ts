/**
 * Internal links on a site that may live under a sub-path.
 *
 * Until the custom domain is switched on, the site is served from
 * julianhilgemann.github.io/hyperadapted.com/ (`base` in astro.config.mjs),
 * and Astro does not prefix links itself. Every internal href and public
 * asset therefore goes through `url()`: url("/articles"). External links and
 * #anchors pass through unchanged. Once `base` is gone, BASE is empty and
 * `url()` returns the path as it is.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

/** True while the site is served under a sub-path (the github.io preview). */
export const isPreview = BASE !== "";

export const url = (path: string) => (path.startsWith("/") ? `${BASE}${path}` : path);

/** A pathname without the base or a trailing slash, for comparing routes: "/articles". */
export const route = (pathname: string) => pathname.slice(BASE.length).replace(/\/$/, "") || "/";
