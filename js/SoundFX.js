// Âm thanh procedural bằng WebAudio - không cần file ngoài
const SFX = {
  ctx: null,
  master: null,
  rainNode: null,
  enabled: true,
  ensure() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.32;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
  },
  tone(freq, dur = 0.12, type = "sine", vol = 1, delay = 0) {
    if (!this.enabled) return;
    this.ensure();
    const t0 = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator(),
      g = this.ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.5 * vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g);
    g.connect(this.master);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  },
  pop() {
    this.tone(520, 0.09, "triangle", 0.7);
  },
  blip() {
    this.tone(760, 0.07, "sine", 0.5);
  },
  plant() {
    this.tone(340, 0.1, "triangle", 0.6);
    this.tone(430, 0.1, "triangle", 0.5, 0.07);
  },
  harvest() {
    this.tone(620, 0.1, "sine", 0.8);
    this.tone(830, 0.14, "sine", 0.7, 0.09);
  },
  quest() {
    [660, 880, 1100].forEach((f, i) =>
      this.tone(f, 0.14, "sine", 0.6, i * 0.09),
    );
  },
  levelup() {
    [520, 660, 780, 1040].forEach((f, i) =>
      this.tone(f, 0.18, "triangle", 0.7, i * 0.1),
    );
  },
  error() {
    this.tone(200, 0.16, "square", 0.3);
  },
  purr() {
    this.tone(190, 0.25, "sine", 0.35);
    this.tone(210, 0.25, "sine", 0.3, 0.12);
  },
  rain(on) {
    if (!this.enabled && !this.rainNode) return;
    this.ensure();
    if (on && !this.rainNode) {
      const len = this.ctx.sampleRate * 2;
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * 0.5;
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const flt = this.ctx.createBiquadFilter();
      flt.type = "lowpass";
      flt.frequency.value = 900;
      const g = this.ctx.createGain();
      g.gain.value = 0.1;
      src.connect(flt);
      flt.connect(g);
      g.connect(this.master);
      src.start();
      this.rainNode = { src, g };
    } else if (!on && this.rainNode) {
      try {
        this.rainNode.src.stop();
      } catch (e) {
        /* noop */
      }
      this.rainNode = null;
    }
  },
};
export default SFX;
