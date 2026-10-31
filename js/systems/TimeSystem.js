import { CONFIG, pad2 } from "../config.js";
import { GameState } from "../state.js";
import { EVT, emit } from "../GameEvents.js";

const PHASES = [
  { id: "morning", vi: "Sáng sớm", from: 6 * 60, tint: [1.0, 0.97, 0.9] },
  { id: "noon", vi: "Trưa", from: 11 * 60, tint: [1.0, 1.0, 1.0] },
  { id: "afternoon", vi: "Chiều", from: 14 * 60, tint: [1.0, 0.97, 0.88] },
  { id: "evening", vi: "Hoàng hôn", from: 17 * 60, tint: [0.98, 0.85, 0.72] },
  { id: "night", vi: "Đêm", from: 20 * 60, tint: [0.55, 0.6, 0.85] },
];

export const TimeSystem = {
  scene: null,
  acc: 0,
  lastPhase: null,

  init(scene) {
    this.scene = scene;
    this.acc = 0;
    this.applyTint();
  },

  phaseAt(mins) {
    let ph = PHASES[0];
    for (const p of PHASES) if (mins >= p.from) ph = p;
    if (mins < 6 * 60) ph = PHASES[4];
    return ph;
  },
  phaseVi() {
    return this.phaseAt(GameState.timeMinutes).vi;
  },
  clockText() {
    const m = GameState.timeMinutes % (24 * 60);
    return `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`;
  },

  update(dt) {
    if (GameState.uiOpen) return;
    this.acc += dt;
    let ticked = false;
    while (this.acc >= CONFIG.MINUTE_MS) {
      this.acc -= CONFIG.MINUTE_MS;
      GameState.timeMinutes++;
      ticked = true;
      if (GameState.timeMinutes % 60 === 0) emit(EVT.HOUR_TICK);
      if (GameState.timeMinutes >= CONFIG.PASS_OUT) {
        this.scene.forceSleep("Bạn thiếp đi vì quá khuya...");
        return;
      }
    }
    if (ticked) {
      this.applyTint();
      emit(EVT.TIME_TICK);
    }
  },

  applyTint() {
    const sc = this.scene;
    if (!sc) return;
    const mins = GameState.timeMinutes;
    const idx = PHASES.findIndex((p) => p.id === this.phaseAt(mins).id);
    const cur = PHASES[idx],
      next = PHASES[(idx + 1) % PHASES.length];
    const span = (next.from - cur.from + 24 * 60) % (24 * 60) || 24 * 60;
    const into = (mins - cur.from + 24 * 60) % (24 * 60);
    const t = Math.min(1, Math.max(0, (into - span * 0.55) / (span * 0.45)));
    const tint = [0, 1, 2].map(
      (i) => cur.tint[i] + (next.tint[i] - cur.tint[i]) * t,
    );
    const w = GameState.weather === "rainy" ? 0.88 : 1;
    const color = Phaser.Display.Color.GetColor(
      Math.round(tint[0] * 255 * w),
      Math.round(tint[1] * 255 * w),
      Math.round(tint[2] * 255 * w),
    );
    if (sc.dayNightOverlay) sc.dayNightOverlay.setFillStyle(color, 1);
    const ph = this.phaseAt(mins);
    if (ph.id !== this.lastPhase) {
      this.lastPhase = ph.id;
      emit(EVT.PHASE, ph);
    }
  },

  resetToMorning() {
    GameState.timeMinutes = CONFIG.DAY_START + 30;
    this.lastPhase = null;
    this.applyTint();
  },
};
