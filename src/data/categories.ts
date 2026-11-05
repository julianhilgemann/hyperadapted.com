/**
 * What kind of work a project is. A project's `category` must be one of these
 * (src/content/config.ts checks it at build time), and the category decides
 * the card's tone and the mark on its cover when it has no image.
 *
 * The audiovisual work splits by how it is made: Generative Audiovisual runs
 * live (TouchDesigner networks that draw the picture while the sound plays),
 * 3D Animation is rendered (Blender scenes baked from the music into a
 * finished video). Writing and Music are the other two strands on About.
 *
 * Tone follows julianhilgemann.com's split: blue is structure and thought,
 * orange is the expressive end, where a number is opened back up.
 *
 * Icons are the inside of a 24x24 stroked SVG (Feather style).
 */
export const categoryNames = ["Generative Audiovisual", "3D Animation", "Writing", "Music"] as const;

export type Category = (typeof categoryNames)[number];

type Mark = { tone: "info" | "primary"; icon: string };

export const categories: Record<Category, Mark> = {
    "Generative Audiovisual": {
        tone: "primary",
        icon: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>',
    },
    "3D Animation": {
        tone: "primary",
        icon: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>',
    },
    Writing: {
        tone: "info",
        icon: '<path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>',
    },
    Music: {
        tone: "primary",
        icon: '<path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>',
    },
};

/** About's Audiovisual strand spans both audiovisual categories, so it keeps a mark of its own. */
export const audiovisual: Mark = {
    tone: "primary",
    icon: '<polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>',
};
