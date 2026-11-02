/**
 * The Sound Lab's dev-server side; the panel is src/components/SoundLab.astro.
 * Registered in astro.config.mjs, active under `astro dev` only:
 *
 *   PUT    /__sound-lab/sound?role=<role>&name=<file name>   body: the file
 *            → public/sounds/<role>.<ext>, named in src/data/sounds.json
 *   DELETE /__sound-lab/sound?role=<role>                    back to the built-in sound
 *   PATCH  /__sound-lab/manifest                             { master, roles: { <role>: { gain, shape } } }
 *
 * A new file, or the way back to the built-in sound, drops the role's trim
 * (start and end belonged to the old sound) and keeps its fades and filters.
 *
 * No write reloads the page: public/ files are not modules, and the
 * manifest's hot update is dropped below, so the running audio context (and
 * the gesture that unlocked it) survives every edit. A manual reload reads
 * the saved state.
 */
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AUDIO = new Set([".wav", ".mp3", ".ogg", ".m4a", ".aac", ".flac", ".webm", ".opus"]);
const MAX_BYTES = 10 * 1024 * 1024;

export default function soundLab() {
    return {
        name: "sound-lab",
        hooks: {
            "astro:config:setup": ({ command, config, updateConfig }) => {
                if (command !== "dev") return;
                const manifest = fileURLToPath(new URL("src/data/sounds.json", config.root));
                const dir = fileURLToPath(new URL("sounds/", config.publicDir));
                updateConfig({ vite: { plugins: [devServer(manifest, dir)] } });
            },
        },
    };
}

function devServer(manifestPath, dir) {
    const read = async () => JSON.parse(await fs.readFile(manifestPath, "utf8"));
    const write = (manifest) => fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
    // A role has one file at most, whatever its extension.
    const removeFiles = async (role) => {
        const names = await fs.readdir(dir).catch(() => []);
        await Promise.all(names.filter((n) => path.parse(n).name === role).map((n) => fs.rm(path.join(dir, n))));
    };
    const withShape = (entry, shape) => {
        const { shape: _, ...rest } = entry;
        return shape && Object.keys(shape).length ? { ...rest, shape } : rest;
    };
    const untrimmed = (entry) => {
        const { start, end, ...shape } = entry.shape ?? {};
        return withShape(entry, shape);
    };

    return {
        name: "sound-lab",
        handleHotUpdate({ file }) {
            if (path.normalize(file) === manifestPath) return [];
        },
        configureServer(server) {
            server.middlewares.use("/__sound-lab", async (req, res) => {
                const send = (status, body) => {
                    res.statusCode = status;
                    res.setHeader("Content-Type", typeof body === "string" ? "text/plain" : "application/json");
                    res.end(typeof body === "string" ? body : JSON.stringify(body));
                };
                try {
                    // Only the page itself may write, not another site open in the same browser.
                    const site = req.headers["sec-fetch-site"];
                    if (site && site !== "same-origin") return send(403, "Same origin only");

                    const { pathname, searchParams } = new URL(req.url, "http://localhost");
                    const manifest = await read();

                    if (pathname === "/sound") {
                        const role = searchParams.get("role");
                        if (!role || !Object.hasOwn(manifest.roles, role)) return send(400, `Unknown role "${role}"`);

                        if (req.method === "PUT") {
                            const name = searchParams.get("name") ?? "";
                            const ext = path.extname(name).toLowerCase();
                            if (!AUDIO.has(ext)) return send(400, `Not an audio file: ${name}`);
                            const data = await body(req);
                            await fs.mkdir(dir, { recursive: true });
                            await removeFiles(role);
                            await fs.writeFile(path.join(dir, role + ext), data);
                            manifest.roles[role] = untrimmed({
                                ...manifest.roles[role],
                                file: `/sounds/${role}${ext}`,
                                v: createHash("sha1").update(data).digest("hex").slice(0, 8),
                                source: name,
                            });
                            await write(manifest);
                            return send(200, manifest.roles[role]);
                        }

                        if (req.method === "DELETE") {
                            await removeFiles(role);
                            const { v, source, ...entry } = manifest.roles[role];
                            manifest.roles[role] = untrimmed({ ...entry, file: null });
                            await write(manifest);
                            return send(200, manifest.roles[role]);
                        }
                    }

                    if (pathname === "/manifest" && req.method === "PATCH") {
                        const patch = JSON.parse((await body(req)).toString("utf8"));
                        if (isLevel(patch.master)) manifest.master = patch.master;
                        for (const [role, entry] of Object.entries(patch.roles ?? {})) {
                            if (!Object.hasOwn(manifest.roles, role) || !entry) continue;
                            if (isLevel(entry.gain)) manifest.roles[role].gain = entry.gain;
                            if ("shape" in entry) manifest.roles[role] = withShape(manifest.roles[role], cleanShape(entry.shape));
                        }
                        await write(manifest);
                        return send(200, manifest);
                    }

                    send(404, "Not found");
                } catch (err) {
                    send(500, String(err?.message ?? err));
                }
            });
        },
    };
}

const isLevel = (g) => typeof g === "number" && g >= 0 && g <= 8;

// What a shape may hold (ms and Hz), the same keys as `Shape` in src/scripts/sound.ts.
const SHAPE = { start: [0, 60000], end: [0, 60000], attack: [0, 5000], release: [0, 10000], lowpass: [20, 20000], highpass: [20, 20000] };

function cleanShape(shape) {
    const clean = {};
    for (const [key, [min, max]] of Object.entries(SHAPE)) {
        const value = shape?.[key];
        if (typeof value === "number" && Number.isFinite(value)) clean[key] = Math.min(max, Math.max(min, Math.round(value * 10) / 10));
    }
    return clean;
}

function body(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        let size = 0;
        req.on("data", (chunk) => {
            size += chunk.length;
            if (size > MAX_BYTES) {
                reject(new Error("Over 10 MB: trim the file first"));
                req.destroy();
            } else chunks.push(chunk);
        });
        req.on("end", () => resolve(Buffer.concat(chunks)));
        req.on("error", reject);
    });
}
