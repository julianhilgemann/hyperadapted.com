/**
 * Internal links on a site that may live under a sub-path.
 *
 * The site runs on its own domain, but it started under
 * julianhilgemann.github.io/hyperadapted.com/ (a `base` in astro.config.mjs),
 * and Astro does not prefix links with a base itself. Every internal href and
 * public asset therefore goes through `url()`: url("/articles"). External
 * links and #anchors pass through unchanged. Without a `base`, BASE is empty
 * and `url()` returns the path as it is.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

/** True while the site is served under a sub-path (a github.io preview). */
export const isPreview = BASE !== "";

export const url = (path: string) => (path.startsWith("/") ? `${BASE}${path}` : path);

/** A pathname without the base or a trailing slash, for comparing routes: "/articles". */
export const route = (pathname: string) => pathname.slice(BASE.length).replace(/\/$/, "") || "/";
