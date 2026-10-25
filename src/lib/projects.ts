import { getCollection, type CollectionEntry } from "astro:content";
import { url } from "./url";

export type Project = CollectionEntry<"projects">;

/** Every published project, newest first. Drafts never leave the repo. */
export async function getProjects(): Promise<Project[]> {
    const all = await getCollection("projects", ({ data }) => !data.draft);
    return all.sort(
        (a, b) => b.data.date.valueOf() - a.data.date.valueOf() || a.data.title.localeCompare(b.data.title),
    );
}

/** Where a card leads: the channel it lives on, or its page here. */
export const projectHref = (project: Project) => project.data.href ?? url(`/projects/${project.slug}`);

/** In UTC, like the `datetime` attribute beside it, so every build prints the same day. */
export const formatDate = (date: Date) =>
    date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
