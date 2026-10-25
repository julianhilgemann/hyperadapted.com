/**
 * The three strands of the work. A project's `category` must be one of these
 * (src/content/config.ts checks it at build time), and the category decides
 * the card's tone and the mark on its cover when it has no image.
 *
 * Tone follows julianhilgemann.com's split: blue is structure and thought,
 * orange is the expressive end, where a number is opened back up.
 *
 * Icons are the inside of a 24x24 stroked SVG (Feather style).
 */
export const categoryNames = ["Writing", "Audiovisual", "Music"] as const;

export type Category = (typeof categoryNames)[number];

export const categories: Record<Category, { tone: "info" | "primary"; icon: string }> = {
    Writing: {
        tone: "info",
        icon: '<path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>',
    },
    Audiovisual: {
        tone: "primary",
        icon: '<polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>',
    },
    Music: {
        tone: "primary",
        icon: '<path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>',
    },
};
