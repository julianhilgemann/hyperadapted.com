/**
 * UI sound: quiet cues on the site's actions, and the switch that turns them
 * off (SoundToggle.astro, bottom right on every page).
 *
 *   hover / press              .btn, .icon-btn, cards, nav links
 *   spark-hover / spark-press  the orbiting action (.orbit-ring): Follow
 *   sound-on / sound-off       the switch itself
 *
 * Any element can opt in with `data-sound="ui"` or `data-sound="spark"`, and
 * out, with everything inside it, with `data-sound="none"`.
 *
 * Every cue is an AudioBuffer: the file a role names in src/data/sounds.json,
 * or else the role's recipe from sound-synth.ts. Each buffer is levelled to
 * the same peak, so the manifest's `gain` alone sets how loud a role is. A
 * role's optional `shape` trims, fades and filters it on every play, so one
 * file serves however it is shaped. The Sound Lab (SoundLab.astro, dev only)
 * tunes those values and writes them back.
 *
 * Nothing should sound mechanical: every play drifts a little in pitch and
 * level, and sits in the stereo field where the element sits on screen.
 *
 * Browsers start audio only after a gesture, so the first cue on a page is
 * the visitor's first click, tap or key. Hover is mouse and pen only (touch
 * has none), and a touch press waits for the click, so a scroll that starts
 * on a card stays silent. The on/off choice is remembered in localStorage;
 * Layout.astro restores it as `html.sound-off` before first paint.
 */
import manifestJson from "../data/sounds.json";
import { render } from "./sound-synth";
import { url } from "../lib/url";

export type SoundRole = keyof typeof manifestJson.roles;

/** How a role's sound is cut and coloured on every play. Any key left out is "as recorded". */
export interface Shape {
    /** Where playing starts and stops, in ms into the (levelled) sound. */
    start?: number;
    end?: number;
    /** Fade in and fade out, in ms. */
    attack?: number;
    release?: number;
    /** Filter corners in Hz. */
    lowpass?: number;
    highpass?: number;
}

interface RoleEntry {
    where: string;
    gain: number;
    file: string | null;
    /** Content hash of the file, so a replaced file is never served from cache. */
    v?: string;
    /** The dropped file's original name, shown in the Sound Lab. */
    source?: string;
    shape?: Shape;
}

export interface SoundManifest {
    master: number;
    roles: Record<SoundRole, RoleEntry>;
}

export const manifest: SoundManifest = structuredClone(manifestJson);
export const roles = Object.keys(manifest.roles) as SoundRole[];

const SPARK = ".orbit-ring, [data-sound='spark']";
const UI = ".btn, .icon-btn, .card-hover, .link-card, .follow-row, .arrow-link, #site-header a, [data-sound='ui']";

/** Shortest gap between two plays of a role, in ms: a sweep across a row of buttons is not a drum roll. */
const GAP: Record<SoundRole, number> = {
    hover: 60,
    press: 40,
    "spark-hover": 300,
    "spark-press": 150,
    "sound-on": 0,
    "sound-off": 0,
};
/** How far a play may drift from the recorded pitch (as a playback rate). */
const DRIFT: Record<SoundRole, number> = {
    hover: 0.035,
    press: 0.03,
    "spark-hover": 0.015,
    "spark-press": 0.01,
    "sound-on": 0,
    "sound-off": 0,
};
/** Max stereo offset for an element at the screen's edge. */
const WIDTH = 0.4;
const MAX_VOICES = 8;
/** The fade a trim always gets where it cuts into the sound, so the cut never clicks. */
const EDGE = 0.003;

const STORE = "sound";
const UNLOCKED = "sound-unlocked";
const root = document.documentElement;

const storage = (s: () => Storage) => {
    try {
        return s();
    } catch {
        return null;
    }
};
const local = storage(() => localStorage);
const session = storage(() => sessionStorage);

let enabled = !root.classList.contains("sound-off");
let gestured = false;

let ctx: AudioContext | null = null;
let out: GainNode;
let analyser: AnalyserNode;
let voices = 0;

const buffers = new Map<SoundRole, Promise<AudioBuffer>>();
const bytes = new Map<SoundRole, Promise<ArrayBuffer>>();
const lastPlay = new Map<SoundRole, number>();

function context() {
    if (ctx) return ctx;
    ctx = new AudioContext({ latencyHint: "interactive" });
    out = ctx.createGain();
    out.gain.value = manifest.master;
    out.connect(ctx.destination);
    // The meter on the switch reads the cues before their gain, so it moves
    // the same at any volume. Wired to a silent output so every browser pulls it.
    analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.7;
    const sink = ctx.createGain();
    sink.gain.value = 0;
    analyser.connect(sink).connect(ctx.destination);
    return ctx;
}

/**
 * Start the context inside a gesture; with sound off, only note the gesture.
 * iOS: mix with the visitor's music and follow the silent switch.
 */
function unlock() {
    gestured = true;
    if (!enabled) return;
    // @ts-ignore Safari 16.4+
    if (navigator.audioSession) navigator.audioSession.type = "ambient";
    const c = context();
    if (c.state === "running") return finishUnlock();
    c.resume().then(finishUnlock, () => {});
}

function finishUnlock() {
    session?.setItem(UNLOCKED, "1");
    for (const type of ["pointerdown", "pointerup", "keydown", "touchend"]) window.removeEventListener(type, unlock, true);
    if (enabled) roles.forEach((role) => buffer(role));
}

/** Trim the silent tail, fade the last 10 ms, and level the peak to 1. */
function level(buffer: AudioBuffer) {
    const channels = Array.from({ length: buffer.numberOfChannels }, (_, i) => buffer.getChannelData(i));
    let peak = 0;
    for (const data of channels) for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
    if (peak === 0) return buffer;

    let end = 0;
    for (const data of channels) {
        for (let i = data.length - 1; i > end; i--) {
            if (Math.abs(data[i]) > peak * 1e-4) {
                end = i;
                break;
            }
        }
    }
    const length = Math.min(buffer.length, end + 1);
    const fade = Math.min(length, Math.round(0.01 * buffer.sampleRate));
    const levelled = new AudioBuffer({ numberOfChannels: channels.length, length, sampleRate: buffer.sampleRate });
    channels.forEach((data, ch) => {
        const target = levelled.getChannelData(ch);
        for (let i = 0; i < length; i++) {
            const tail = length - i <= fade ? (length - i) / fade : 1;
            target[i] = (data[i] / peak) * tail;
        }
    });
    return levelled;
}

function fileUrl(role: SoundRole) {
    const { file, v } = manifest.roles[role];
    return file ? `${url(file)}${v ? `?v=${v}` : ""}` : null;
}

/** Fetch a role's file ahead of the first gesture, so the first cue does not wait on the network. */
function prefetch(role: SoundRole) {
    const src = fileUrl(role);
    if (!src || bytes.has(role)) return;
    bytes.set(
        role,
        fetch(src).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(`${r.status} ${src}`)))),
    );
}

function buffer(role: SoundRole) {
    let pending = buffers.get(role);
    if (!pending) {
        const c = context();
        prefetch(role);
        const file = bytes.get(role);
        const synth = () => render(role, c.sampleRate).then(level);
        pending = file
            ? file.then((data) => c.decodeAudioData(data.slice(0))).then(level, (err) => {
                  console.warn(`Sound "${role}": ${err}. Using the built-in sound.`);
                  return synth();
              })
            : synth();
        buffers.set(role, pending);
    }
    return pending;
}

/**
 * The gain over one play as a curve: rise over `fadeIn`, hold, and fall away
 * (quadratic, like a natural decay) over `fadeOut`, at 1 ms resolution.
 */
function envelope(gain: number, seconds: number, fadeIn: number, fadeOut: number) {
    const points = Math.max(2, Math.min(4096, Math.ceil(seconds * 1000)));
    const curve = new Float32Array(points);
    for (let i = 0; i < points; i++) {
        const t = (i / (points - 1)) * seconds;
        let v = fadeIn > 0 && t < fadeIn ? t / fadeIn : 1;
        if (fadeOut > 0 && seconds - t < fadeOut) v = Math.min(v, ((seconds - t) / fadeOut) ** 2);
        curve[i] = v * gain;
    }
    return curve;
}

function panFor(el?: Element | null) {
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const x = (r.left + r.width / 2) / window.innerWidth;
    return Math.max(-1, Math.min(1, (x * 2 - 1) * WIDTH));
}

/**
 * Play a role's cue. `force` plays it with sound off (the switch's own
 * goodbye) and skips the gap.
 */
export function play(role: SoundRole, el?: Element | null, force = false) {
    if (!enabled && !force) return;
    if (!ctx && !gestured) return;
    const now = performance.now();
    if (!force && now - (lastPlay.get(role) ?? -Infinity) < GAP[role]) return;
    if (voices >= MAX_VOICES) return;
    lastPlay.set(role, now);

    const c = context();
    const pan = panFor(el);
    const start = async () => {
        if (c.state !== "running") await c.resume().catch(() => {});
        if (c.state !== "running") return;
        const audio = await buffer(role);
        const shape = manifest.roles[role].shape ?? {};
        const rate = 1 + (Math.random() * 2 - 1) * DRIFT[role];
        const level = manifest.roles[role].gain * (1 + (Math.random() * 2 - 1) * 0.1);

        // The region to play, in seconds of the sound, and how long that takes at this rate.
        const length = audio.duration;
        const start = Math.min(Math.max(0, (shape.start ?? 0) / 1000), length - 0.01);
        const end = Math.min(length, Math.max(start + 0.01, shape.end != null ? shape.end / 1000 : length));
        const seconds = (end - start) / rate;
        let fadeIn = Math.max((shape.attack ?? 0) / 1000, start > 0 ? EDGE : 0);
        let fadeOut = Math.max((shape.release ?? 0) / 1000, end < length ? EDGE : 0);
        if (fadeIn + fadeOut > seconds) {
            const k = seconds / (fadeIn + fadeOut);
            fadeIn *= k;
            fadeOut *= k;
        }

        const src = c.createBufferSource();
        src.buffer = audio;
        src.playbackRate.value = rate;
        let chain: AudioNode = src;
        if (shape.highpass) {
            const filter = new BiquadFilterNode(c, { type: "highpass", frequency: shape.highpass, Q: Math.SQRT1_2 });
            chain = chain.connect(filter);
        }
        if (shape.lowpass) {
            const filter = new BiquadFilterNode(c, { type: "lowpass", frequency: shape.lowpass, Q: Math.SQRT1_2 });
            chain = chain.connect(filter);
        }
        const at = c.currentTime;
        const gain = c.createGain();
        if (fadeIn || fadeOut) gain.gain.setValueCurveAtTime(envelope(level, seconds, fadeIn, fadeOut), at, seconds);
        else gain.gain.value = level;
        const panner = c.createStereoPanner();
        panner.pan.value = pan;
        chain.connect(gain).connect(panner).connect(out);
        chain.connect(analyser);
        voices++;
        src.onended = () => {
            voices--;
            src.disconnect();
        };
        src.start(at, start, end - start);
        document.dispatchEvent(new CustomEvent("sound:play", { detail: { role, at, start, end, rate } }));
    };
    start().catch((err) => console.warn(`Sound "${role}":`, err));
}

/* ── The switch ── */

export const isEnabled = () => enabled;

export function setEnabled(on: boolean) {
    if (on === enabled) return;
    if (!on) play("sound-off", null, true);
    enabled = on;
    root.classList.toggle("sound-off", !on);
    local?.setItem(STORE, on ? "on" : "off");
    if (on) {
        if (!ctx) unlock();
        play("sound-on", null, true);
    }
    document.dispatchEvent(new CustomEvent("sound:change", { detail: { enabled: on } }));
}

/** Four bands (low to high), 0–1, while a cue rings: the switch's meter. */
export function bands(): number[] {
    if (!ctx || !voices) return [0, 0, 0, 0];
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    const hz = ctx.sampleRate / analyser.fftSize;
    return [
        [150, 700],
        [700, 1600],
        [1600, 3500],
        [3500, 9000],
    ].map(([lo, hi]) => {
        const from = Math.floor(lo / hz);
        const to = Math.max(from + 1, Math.ceil(hi / hz));
        let sum = 0;
        for (let i = from; i < to; i++) sum += data[i];
        return Math.sqrt(sum / (to - from) / 255);
    });
}

export const ringing = () => voices > 0;

/* ── Sound Lab hooks (dev only) ── */

/** Replace a role's sound with a dropped file's bytes; resolves once it can play. */
export function useFile(role: SoundRole, data: ArrayBuffer) {
    const c = context();
    const pending = c.decodeAudioData(data.slice(0)).then(level);
    // Only a file that decodes replaces the sound; a bad drop keeps the old one.
    return pending.then(() => {
        buffers.set(role, pending);
        bytes.delete(role);
    });
}

/** Back to the built-in recipe. */
export function useSynth(role: SoundRole) {
    buffers.delete(role);
    bytes.delete(role);
}

export function setGain(role: SoundRole, gain: number) {
    manifest.roles[role].gain = gain;
}

/** A role's sound as it is before shaping: what the Sound Lab draws. */
export const getBuffer = (role: SoundRole) => buffer(role);

/** The audio clock, for the Sound Lab's playhead. */
export const now = () => ctx?.currentTime ?? 0;

export function setMaster(gain: number) {
    manifest.master = gain;
    if (ctx) out.gain.setTargetAtTime(gain, ctx.currentTime, 0.02);
}

/* ── Wiring ── */

type Cue = [el: Element, tier: "spark" | "ui"];

function cue(target: EventTarget | null): Cue | null {
    if (!(target instanceof Element) || target.closest("[data-sound='none'], :disabled, [aria-disabled='true']")) return null;
    const spark = target.closest(SPARK);
    if (spark) return [spark, "spark"];
    const ui = target.closest(UI);
    return ui ? [ui, "ui"] : null;
}

let hovered: Element | null = null;
let pressed: { el: Element; at: number } | null = null;

document.addEventListener("pointerover", (e) => {
    if (e.pointerType === "touch") return;
    const hit = cue(e.target);
    const el = hit?.[0] ?? null;
    if (el === hovered) return;
    hovered = el;
    if (hit) play(hit[1] === "spark" ? "spark-hover" : "hover", hit[0]);
});

// Leaving the window: coming back onto the same button sounds again.
document.addEventListener("pointerout", (e) => {
    if (!e.relatedTarget) hovered = null;
});

// Mouse and pen sound on the way down, where a physical button would; the
// click that follows is then skipped. Touch and keyboard sound on the click.
document.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "touch" || e.button !== 0) return;
    const hit = cue(e.target);
    if (!hit) return;
    pressed = { el: hit[0], at: performance.now() };
    play(hit[1] === "spark" ? "spark-press" : "press", hit[0]);
});

document.addEventListener("click", (e) => {
    const hit = cue(e.target);
    if (!hit) return;
    const already = pressed && pressed.el === hit[0] && performance.now() - pressed.at < 1500;
    pressed = null;
    if (!already) play(hit[1] === "spark" ? "spark-press" : "press", hit[0]);
});

for (const type of ["pointerdown", "pointerup", "keydown", "touchend"]) window.addEventListener(type, unlock, true);

// A visitor who already clicked on an earlier page of this visit: Chrome
// carries that gesture across a same-site link, so try to start straight
// away and let hover sound before the first click here. Where the browser
// says no, the gesture listeners above still wait.
if (enabled && session?.getItem(UNLOCKED)) {
    context()
        .resume()
        .then(() => ctx?.state === "running" && finishUnlock())
        .catch(() => {});
}

if (enabled) {
    const idle = window.requestIdleCallback ?? ((fn: () => void) => setTimeout(fn, 1500));
    idle(() => roles.forEach(prefetch));
}
