/**
 * The default UI sounds, drawn with Web Audio instead of shipped as files.
 * Each recipe renders once into an AudioBuffer on an OfflineAudioContext;
 * from then on it plays exactly like a dropped-in file would (sound.ts). A
 * file named in src/data/sounds.json replaces the recipe for its role.
 *
 * The brief is "barely there, not digital": soft attacks so nothing clicks,
 * short exponential tails, everything under a lowpass, a small seeded room
 * underneath, and every pitch from one chord (A major: A, C#, E) so the
 * sounds belong together. The noise and the room are seeded, so a recipe
 * renders the same sound on every visit.
 */
import type { SoundRole } from "./sound";

interface Recipe {
    /** Rendered length in seconds, room tail included. */
    seconds: number;
    /** Lowpass over the whole sound: the warmth. */
    lowpass: number;
    room: { wet: number; seconds: number };
    /** Pan the dry sound from one side to the other over the first `time` seconds. */
    sweep?: { from: number; to: number; time: number };
    draw: (ctx: OfflineAudioContext, out: AudioNode) => void;
}

// Pitches of the chord, in Hz.
const A3 = 220;
const E5 = 659.25;
const A5 = 880;
const E6 = 1318.51;
const Cs7 = 2217.46;
const E7 = 2637.02;

/** A small seeded PRNG (mulberry32): the same noise on every render. */
function seeded(seed: number) {
    return () => {
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** Rise to `peak` in `attack`, then fall away exponentially with time constant `decay`. */
function envelope(param: AudioParam, at: number, peak: number, attack: number, decay: number) {
    param.setValueAtTime(0, at);
    param.linearRampToValueAtTime(peak, at + attack);
    param.setTargetAtTime(0, at + attack, decay);
}

interface Tone {
    freq: number;
    at?: number;
    attack?: number;
    decay: number;
    gain: number;
    type?: OscillatorType;
    /** Glide to this frequency over `time` seconds: a felt hammer settling. */
    glide?: { to: number; time: number };
    /** A frequency modulator whose depth dies away: glass and bell, not beep. */
    fm?: { ratio: number; index: number; decay: number };
}

function tone(ctx: OfflineAudioContext, out: AudioNode, t: Tone) {
    const at = t.at ?? 0;
    const attack = t.attack ?? 0.004;
    const end = at + attack + t.decay * 9;

    const osc = ctx.createOscillator();
    osc.type = t.type ?? "sine";
    osc.frequency.setValueAtTime(t.freq, at);
    if (t.glide) osc.frequency.exponentialRampToValueAtTime(t.glide.to, at + t.glide.time);

    if (t.fm) {
        const mod = ctx.createOscillator();
        const depth = ctx.createGain();
        mod.frequency.value = t.freq * t.fm.ratio;
        envelope(depth.gain, at, t.fm.index * t.freq * t.fm.ratio, 0.002, t.fm.decay);
        mod.connect(depth).connect(osc.frequency);
        mod.start(at);
        mod.stop(end);
    }

    const amp = ctx.createGain();
    envelope(amp.gain, at, t.gain, attack, t.decay);
    osc.connect(amp).connect(out);
    osc.start(at);
    osc.stop(end);
}

interface Noise {
    at?: number;
    attack?: number;
    decay: number;
    gain: number;
    filter: BiquadFilterType;
    freq: number;
    q?: number;
    /** Move the filter to this frequency over `time` seconds. */
    sweep?: { to: number; time: number };
}

function noise(ctx: OfflineAudioContext, out: AudioNode, n: Noise, seed = 7) {
    const at = n.at ?? 0;
    const attack = n.attack ?? 0.002;
    const length = Math.ceil((attack + n.decay * 9) * ctx.sampleRate);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    const random = seeded(seed);
    for (let i = 0; i < length; i++) data[i] = random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = n.filter;
    filter.frequency.setValueAtTime(n.freq, at);
    if (n.sweep) filter.frequency.exponentialRampToValueAtTime(n.sweep.to, at + n.sweep.time);
    filter.Q.value = n.q ?? 0.7;
    const amp = ctx.createGain();
    envelope(amp.gain, at, n.gain, attack, n.decay);
    src.connect(filter).connect(amp).connect(out);
    src.start(at);
}

/**
 * A small room: stereo noise that decays and darkens as it goes (the highs
 * die first, as in a real space), after a few milliseconds of pre-delay.
 */
function room(ctx: OfflineAudioContext, seconds: number) {
    const rate = ctx.sampleRate;
    const length = Math.ceil(seconds * rate);
    const predelay = Math.round(0.008 * rate);
    const ir = ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
        const random = seeded(11 + ch);
        const data = ir.getChannelData(ch);
        let y = 0;
        for (let i = predelay; i < length; i++) {
            const t = (i - predelay) / (length - predelay);
            const x = (random() * 2 - 1) * Math.exp(-t * 7);
            y += (0.5 - 0.44 * t) * (x - y);
            data[i] = y * Math.min(1, (i - predelay) / (0.004 * rate));
        }
    }
    const convolver = ctx.createConvolver();
    convolver.buffer = ir;
    return convolver;
}

export const recipes: Record<SoundRole, Recipe> = {
    // A glass bead touched with a fingertip: two short partials of E and a
    // breath of filtered air. Gone in 50 ms but for the room.
    hover: {
        seconds: 0.5,
        lowpass: 7000,
        room: { wet: 0.14, seconds: 0.6 },
        draw(ctx, out) {
            tone(ctx, out, { freq: E7, attack: 0.0015, decay: 0.014, gain: 0.35 });
            tone(ctx, out, { freq: E6, attack: 0.002, decay: 0.022, gain: 0.22 });
            noise(ctx, out, { filter: "bandpass", freq: 3800, q: 1.4, attack: 0.001, decay: 0.006, gain: 0.5 });
        },
    },

    // A felt key going down: a low A that settles a fourth lower, an octave
    // up for definition, and the soft contact of felt.
    press: {
        seconds: 0.6,
        lowpass: 4500,
        room: { wet: 0.1, seconds: 0.6 },
        draw(ctx, out) {
            tone(ctx, out, { freq: A3, glide: { to: 165, time: 0.05 }, attack: 0.0015, decay: 0.04, gain: 0.9 });
            tone(ctx, out, { freq: A5, type: "triangle", attack: 0.001, decay: 0.022, gain: 0.18 });
            noise(ctx, out, { filter: "lowpass", freq: 1800, attack: 0.0005, decay: 0.005, gain: 0.6 });
        },
    },

    // The spark catching the light: a soft glass bell on E with its
    // inharmonic overtone, and a thin shimmer that travels across the stereo
    // field the way the light travels round the button.
    "spark-hover": {
        seconds: 1.4,
        lowpass: 9000,
        room: { wet: 0.32, seconds: 1.2 },
        sweep: { from: -0.3, to: 0.3, time: 0.5 },
        draw(ctx, out) {
            tone(ctx, out, { freq: E6, attack: 0.008, decay: 0.26, gain: 0.5, fm: { ratio: 3.5, index: 0.9, decay: 0.06 } });
            tone(ctx, out, { freq: E6 * 2.76, attack: 0.004, decay: 0.09, gain: 0.08 });
            noise(ctx, out, {
                filter: "bandpass",
                freq: 3000,
                q: 4,
                sweep: { to: 8000, time: 0.25 },
                attack: 0.06,
                decay: 0.09,
                gain: 0.12,
            });
        },
    },

    // The one action, answered: a warm low A under a slow strum of A, E and
    // C#, with a little air. The longest and fullest sound on the site.
    "spark-press": {
        seconds: 2.2,
        lowpass: 8000,
        room: { wet: 0.38, seconds: 1.6 },
        draw(ctx, out) {
            const bell = { ratio: 3.5, index: 0.6, decay: 0.08 };
            tone(ctx, out, { freq: A3, attack: 0.012, decay: 0.26, gain: 0.45 });
            tone(ctx, out, { freq: A5, attack: 0.006, decay: 0.52, gain: 0.42, fm: bell });
            tone(ctx, out, { freq: E6, at: 0.022, attack: 0.006, decay: 0.46, gain: 0.3, fm: bell });
            tone(ctx, out, { freq: Cs7, at: 0.044, attack: 0.006, decay: 0.3, gain: 0.1 });
            noise(ctx, out, { filter: "lowpass", freq: 1400, attack: 0.03, decay: 0.08, gain: 0.08 });
        },
    },

    // Two notes up, a fourth apart: sound arrives.
    "sound-on": {
        seconds: 1.2,
        lowpass: 6000,
        room: { wet: 0.25, seconds: 1 },
        draw(ctx, out) {
            const glass = { ratio: 2, index: 0.3, decay: 0.05 };
            tone(ctx, out, { freq: E5, attack: 0.005, decay: 0.15, gain: 0.5, fm: glass });
            tone(ctx, out, { freq: A5, at: 0.085, attack: 0.005, decay: 0.18, gain: 0.5, fm: glass });
        },
    },

    // The same two notes coming back down: sound leaves.
    "sound-off": {
        seconds: 1,
        lowpass: 5000,
        room: { wet: 0.2, seconds: 0.8 },
        draw(ctx, out) {
            const glass = { ratio: 2, index: 0.3, decay: 0.05 };
            tone(ctx, out, { freq: A5, attack: 0.005, decay: 0.12, gain: 0.45, fm: glass });
            tone(ctx, out, { freq: E5, at: 0.085, attack: 0.005, decay: 0.14, gain: 0.45, fm: glass });
        },
    },
};

/** Render a role's recipe at the playing context's sample rate. */
export async function render(role: SoundRole, sampleRate: number) {
    const recipe = recipes[role];
    const ctx = new OfflineAudioContext(2, Math.ceil(recipe.seconds * sampleRate), sampleRate);

    const warmth = ctx.createBiquadFilter();
    warmth.type = "lowpass";
    warmth.frequency.value = recipe.lowpass;
    warmth.Q.value = 0.5;
    warmth.connect(ctx.destination);

    const dry = ctx.createGain();
    let bus: AudioNode = dry;
    if (recipe.sweep) {
        const pan = ctx.createStereoPanner();
        pan.pan.setValueAtTime(recipe.sweep.from, 0);
        pan.pan.linearRampToValueAtTime(recipe.sweep.to, recipe.sweep.time);
        dry.connect(pan);
        bus = pan;
    }
    bus.connect(warmth);

    const wet = ctx.createGain();
    wet.gain.value = recipe.room.wet;
    dry.connect(room(ctx, recipe.room.seconds)).connect(wet).connect(warmth);

    recipe.draw(ctx, dry);
    return ctx.startRendering();
}
