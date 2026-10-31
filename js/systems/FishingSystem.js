import { FISH } from "../data/fish.js";
import { SeasonSystem } from "./SeasonSystem.js";
import { InventorySystem } from "./InventorySystem.js";
import { GameState, addXP } from "../state.js";
import { EVT, emit } from "../GameEvents.js";
import SFX from "../SoundFX.js";

// Mini-game: thanh ngang, kim chạy qua lại; nhấn E khi kim nằm trong vùng xanh.
export const FishingSystem = {
  active: false,
  scene: null,
  g: null,
  txt: null,
  marker: 0,
  dir: 1,
  speed: 0.0005,
  zoneStart: 0.4,
  zoneSize: 0.25,
  fish: null,

  start(scene) {
    if (this.active) return;
    if (!InventorySystem.has("rod")) {
      scene.hud.toast("Bạn cần có cần câu!");
      return;
    }
    const season = SeasonSystem.current().id;
    const pool = FISH.filter((f) => f.seasons.includes(season));
    const total = pool.reduce((s2, f) => s2 + f.weight, 0);
    let r = Math.random() * total;
    this.fish = pool[0];
    for (const f of pool) {
      r -= f.weight;
      if (r <= 0) {
        this.fish = f;
        break;
      }
    }

    this.scene = scene;
    this.active = true;
    GameState.uiOpen = true;
    this.marker = 0;
    this.dir = 1;
    this.speed = 0.00042 + this.fish.difficulty * 0.00062;
    this.zoneSize = 0.3 - this.fish.difficulty * 0.17;
    this.zoneStart = 0.2 + Math.random() * (0.8 - this.zoneSize - 0.2);

    this.g = scene.add.graphics().setScrollFactor(0).setDepth(960);
    this.txt = scene.add
      .text(
        scene.scale.width / 2,
        scene.scale.height - 158,
        "Cá đang cắn câu... Nhấn E khi kim vào vùng xanh!",
        {
          fontFamily: "Nunito,sans-serif",
          fontSize: "16px",
          fontWeight: "900",
          color: "#fdf6e9",
          stroke: "#3a2e22",
          strokeThickness: 4,
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(961);
    SFX.pop();
  },

  update(dt) {
    if (!this.active) return;
    this.marker += this.dir * this.speed * dt;
    if (this.marker >= 1) {
      this.marker = 1;
      this.dir = -1;
    }
    if (this.marker <= 0) {
      this.marker = 0;
      this.dir = 1;
    }
    this.draw();
  },

  draw() {
    const W = this.scene.scale.width,
      H = this.scene.scale.height;
    const bw = Math.min(440, W - 100),
      bx = (W - bw) / 2,
      by = H - 112;
    const g = this.g;
    g.clear();
    g.fillStyle("#3a2e22", 0.85);
    g.fillRoundedRect(bx - 8, by - 8, bw + 16, 34, 12);
    g.fillStyle("#8a7362", 1);
    g.fillRoundedRect(bx, by, bw, 18, 8);
    g.fillStyle("#7ba05b", 1);
    g.fillRoundedRect(
      bx + this.zoneStart * bw,
      by - 3,
      this.zoneSize * bw,
      24,
      6,
    );
    g.fillStyle("#f5c542", 1);
    g.fillRoundedRect(bx + this.marker * bw - 3, by - 8, 6, 34, 3);
  },

  press() {
    if (!this.active) return;
    if (
      this.marker >= this.zoneStart &&
      this.marker <= this.zoneStart + this.zoneSize
    )
      this.success();
    else this.fail();
  },

  success() {
    const f = this.fish,
      sc = this.scene;
    InventorySystem.add(f.id);
    addXP(f.xp);
    SFX.harvest();
    sc.add
      .particles(sc.player.x, sc.player.y - 28, "pt_drop", {
        lifespan: 600,
        speed: { min: 30, max: 80 },
        quantity: 8,
        emitting: false,
      })
      .setDepth(700)
      .explode(8);
    sc.hud.toast(
      `Câu được ${f.name}! +${f.xp} XP`,
      f.rarity === "rare" ? "reward" : "",
    );
    if (f.rarity === "rare") sc.hud.banner("Cá hiếm!", f.name);
    emit(EVT.QUEST_EVENT, { type: "fish.catch", fishId: f.id });
    emit(EVT.SAVE);
    this.end();
  },

  fail() {
    SFX.error();
    this.scene.hud.toast("Ôi, nó thoát mất rồi!");
    this.end();
  },

  cancel() {
    if (this.active) this.end();
  },

  end() {
    this.active = false;
    GameState.uiOpen = false;
    this.g?.destroy();
    this.txt?.destroy();
    this.g = null;
    this.txt = null;
  },
};
