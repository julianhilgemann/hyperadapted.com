import { defineCollection, z } from "astro:content";
import { categoryNames } from "../data/categories";

/**
 * One Markdown file per piece in src/content/articles/. Two kinds:
 *
 *   on this site   no `href`: the body is the article, served at
 *                  /articles/<file name>.
 *   elsewhere      `href` set (a Medium post, a Substack letter, a YouTube
 *                  video): the card links straight there with that channel's
 *                  mark, no page is built here, and the body can stay empty.
 *
 * `image` is a path under public/ (e.g. /assets/articles/cover.webp), 16:9.
 * Without one, the card draws a cover in the category's tone.
 */
const articles = defineCollection({
    type: "content",
    schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.coerce.date(),
        category: z.enum(categoryNames),
        image: z.string().optional(),
        href: z.string().url().optional(),
        draft: z.boolean().default(false),
    }),
});

export const collections = { articles };
