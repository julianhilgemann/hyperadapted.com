/**
 * The Sound Lab's waveform (SoundLab.astro, dev only): one role's sound drawn
 * as peaks, the played region between two handles (drag either to trim; a
 * click moves the nearer one), the fades drawn over the region, and a
 * playhead while it plays. Times are seconds into the levelled sound.
 */

export interface Region {
    start: number;
    end: number;
    attack: number;
    release: number;
}

/** A token colour from the page's custom properties, at an opacity. */
const token = (name: string, alpha = 1) =>
    `rgb(${getComputedStyle(document.documentElement).getPropertyValue(`--color-${name}`).trim()} / ${alpha})`;

const MIN_REGION = 0.01;

export class Wave {
    private buffer: AudioBuffer | null = null;
    private peaks: Float32Array | null = null;
    private region: Region = { start: 0, end: 0, attack: 0, release: 0 };
    private head: number | null = null;
    private frame = 0;

    constructor(
        private canvas: HTMLCanvasElement,
        /** Called while a handle moves, and once more with `done` when it lets go. */
        private onTrim: (start: number, end: number, done: boolean) => void,
    ) {
        canvas.addEventListener("pointerdown", (e) => this.grab(e));
        new ResizeObserver(() => this.layout()).observe(canvas);
    }

    get duration() {
        return this.buffer?.duration ?? 0;
    }

    setBuffer(buffer: AudioBuffer) {
        this.buffer = buffer;
        this.layout();
    }

    setRegion(region: Region) {
        this.region = region;
        this.draw();
    }

    /** Run the playhead over the region: `at` and `now()` are the audio clock. */
    play(at: number, start: number, end: number, rate: number, now: () => number) {
        cancelAnimationFrame(this.frame);
        const tick = () => {
            const t = start + (now() - at) * rate;
            this.head = t < end ? t : null;
            this.draw();
            if (this.head !== null) this.frame = requestAnimationFrame(tick);
        };
        tick();
    }

    private layout() {
        const { canvas, buffer } = this;
        const width = canvas.clientWidth;
        if (!width) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(canvas.clientHeight * dpr);
        if (buffer) {
            // One peak per device pixel: the loudest sample of any channel in that slice.
            const columns = canvas.width;
            const peaks = new Float32Array(columns);
            const per = buffer.length / columns;
            for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
                const data = buffer.getChannelData(ch);
                for (let x = 0; x < columns; x++) {
                    const from = Math.floor(x * per);
                    const to = Math.max(from + 1, Math.floor((x + 1) * per));
                    for (let i = from; i < to; i++) peaks[x] = Math.max(peaks[x], Math.abs(data[i] ?? 0));
                }
            }
            this.peaks = peaks;
        }
        this.draw();
    }

    private draw() {
        const { canvas, peaks, region, duration } = this;
        const g = canvas.getContext("2d");
        if (!g) return;
        const { width: w, height: h } = canvas;
        const dpr = window.devicePixelRatio || 1;
        g.clearRect(0, 0, w, h);
        if (!peaks || !duration) return;

        const x = (t: number) => (t / duration) * w;
        const sx = x(region.start);
        const ex = x(region.end);
        const mid = h / 2;
        const top = 4 * dpr;
        const bottom = h - 4 * dpr;

        // Peaks, lifted a little (a ** 0.6) so quiet tails stay visible.
        const inside = token("primary", 0.85);
        const outside = token("ink-faint", 0.45);
        for (let px = 0; px < peaks.length; px++) {
            const a = peaks[px] ** 0.6 * (mid - top);
            g.fillStyle = px >= sx && px <= ex ? inside : outside;
            g.fillRect(px, mid - a, 1, Math.max(1, a * 2));
        }

        // The envelope: up over the fade in, across, and down (quadratic) over the fade out.
        const rise = Math.min(x(region.start + region.attack), ex);
        const fall = Math.max(x(region.end - region.release), rise);
        g.strokeStyle = token("ink-strong", 0.7);
        g.lineWidth = dpr;
        g.beginPath();
        g.moveTo(sx, bottom);
        g.lineTo(rise, top);
        g.lineTo(fall, top);
        for (let i = 1; i <= 24; i++) {
            const t = i / 24;
            g.lineTo(fall + (ex - fall) * t, top + (bottom - top) * (1 - (1 - t) ** 2));
        }
        g.stroke();

        // Handles: a hairline with a tab to grab.
        g.fillStyle = token("ink-strong");
        for (const hx of [sx, ex]) {
            const cx = Math.min(Math.max(hx, 3 * dpr), w - 3 * dpr);
            g.fillRect(cx - dpr * 0.75, 0, dpr * 1.5, h);
            g.fillRect(cx - 3 * dpr, 0, 6 * dpr, 9 * dpr);
        }

        if (this.head !== null) {
            g.fillStyle = token("ink-strong", 0.9);
            g.fillRect(x(this.head) - dpr / 2, 0, dpr, h);
        }
    }

    private grab(e: PointerEvent) {
        if (!this.duration) return;
        const rect = this.canvas.getBoundingClientRect();
        const at = (clientX: number) => Math.min(Math.max(0, (clientX - rect.left) / rect.width), 1) * this.duration;
        const t = at(e.clientX);
        const handle = Math.abs(t - this.region.start) <= Math.abs(t - this.region.end) ? "start" : "end";
        this.canvas.setPointerCapture(e.pointerId);

        const move = (clientX: number, done: boolean) => {
            const t = at(clientX);
            let { start, end } = this.region;
            if (handle === "start") start = Math.min(t, end - MIN_REGION);
            else end = Math.max(t, start + MIN_REGION);
            this.region = { ...this.region, start, end };
            this.draw();
            this.onTrim(start, end, done);
        };
        move(e.clientX, false);

        const onMove = (ev: PointerEvent) => move(ev.clientX, false);
        const onUp = (ev: PointerEvent) => {
            this.canvas.removeEventListener("pointermove", onMove);
            this.canvas.removeEventListener("pointerup", onUp);
            this.canvas.removeEventListener("pointercancel", onUp);
            move(ev.clientX, true);
        };
        this.canvas.addEventListener("pointermove", onMove);
        this.canvas.addEventListener("pointerup", onUp);
        this.canvas.addEventListener("pointercancel", onUp);
    }
}
