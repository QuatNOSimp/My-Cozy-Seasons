import { GameState } from "../state.js";
import { SeasonSystem } from "./SeasonSystem.js";
import { LAYOUT, tx2px } from "../config.js";

const LAMP_SPOTS = [
  { tx: 10.5, ty: 11.2 },
  { tx: 15.2, ty: 13.4 },
  { tx: 24.0, ty: 15.2 },
];

export const LightSystem = {
  scene: null,
  glows: [],
  lampSprites: [],
  fireflies: null,
  _wasNight: null,

  init(scene) {
    this.scene = scene;
    this.glows = [];
    this.fireflies = null;
    this._wasNight = null;
    this.lampSprites.forEach((l) => l.destroy());
    this.lampSprites = [];
    // cột đèn đường (thấy cả ban ngày)
    for (const s of LAMP_SPOTS) {
      const spr = scene.add.image(tx2px(s.tx), tx2px(s.ty), "decor_lamp_post");
      scene.worldContainer.add(spr);
      scene.addDepthSorted(spr);
      this.lampSprites.push(spr);
      const b = scene.add
        .rectangle(tx2px(s.tx), tx2px(s.ty) + 42, 18, 12)
        .setVisible(false);
      scene.physics.add.existing(b, true);
      scene.solids.add(b);
    }
    this.refresh();
  },

  isNightish() {
    const m = GameState.timeMinutes % (24 * 60);
    return m >= 17 * 60 || m < 6 * 60;
  },

  update() {
    if (!this.scene) return;
    const n = this.isNightish();
    if (n !== this._wasNight) {
      this._wasNight = n;
      this.refresh();
    }
    if (n && this.glows.length) {
      const f = 0.92 + Math.sin(this.scene.time.now / 280) * 0.08;
      for (const g of this.glows) g.setAlpha((g.getData("baseA") || 0.6) * f);
    }
  },

  refresh() {
    const sc = this.scene;
    if (!sc || !sc.worldContainer) return;
    this.glows.forEach((g) => g.destroy());
    this.glows = [];
    this._wasNight = this.isNightish();
    if (this._wasNight) {
      const add = (x, y, scale, alpha) => {
        const g = sc.add
          .image(x, y, "glow_warm")
          .setBlendMode(Phaser.BlendModes.ADD)
          .setAlpha(alpha)
          .setScale(scale)
          .setData("baseA", alpha);
        sc.worldContainer.add(g);
        sc.addDepthSorted(g);
        this.glows.push(g);
      };
      for (const d of GameState.decor) {
        if (d.id === "lantern") add(d.x, d.y - 20, 1.15, 0.65);
        if (d.id === "lamp_post") add(d.x, d.y - 38, 1.7, 0.8);
      }
      for (const s of LAMP_SPOTS) add(tx2px(s.tx), tx2px(s.ty) - 38, 1.7, 0.8);
      const hx = tx2px(LAYOUT.house.tx),
        hy = tx2px(LAYOUT.house.ty);
      [
        [93, 112],
        [192, 110],
        [291, 112],
        [92, 240],
        [292, 240],
      ].forEach(([wx, wy]) => add(hx + wx, hy + wy, 0.85, 0.4));
      add(hx + 192, hy + 252, 0.7, 0.5);
    }
    this.updateFireflies();
  },

  updateFireflies() {
    const sc = this.scene;
    if (!sc) return;
    const summer = SeasonSystem.current().id === "summer";
    if (summer && this._wasNight) {
      if (!this.fireflies) {
        this.fireflies = sc.add
          .particles(0, 0, "pt_firefly", {
            x: { min: 0, max: sc.scale.width },
            y: { min: sc.scale.height * 0.35, max: sc.scale.height * 0.95 },
            lifespan: 3600,
            frequency: 300,
            speedX: { min: -16, max: 16 },
            speedY: { min: -12, max: 12 },
            scale: { start: 0.5, end: 1.2 },
            alpha: { start: 0.9, end: 0 },
            blendMode: "ADD",
          })
          .setDepth(897)
          .setScrollFactor(0);
      }
    } else if (this.fireflies) {
      this.fireflies.destroy();
      this.fireflies = null;
    }
  },
};
