import { GameState } from "../state.js";
import { LAYOUT, T, tx2px, clamp } from "../config.js";
import { CROPS, seedToCrop } from "../data/crops.js";
import { SeasonSystem } from "./SeasonSystem.js";
import { InventorySystem } from "./InventorySystem.js";
import { EVT, emit } from "../GameEvents.js";
import { HYBRIDS } from "../data/seasons.js";
import SFX from "../SoundFX.js";

export const FarmingSystem = {
  scene: null,
  runtime: [],

  init(scene) {
    this.scene = scene;
    if (!GameState.plots.length) {
      GameState.plots = LAYOUT.plots.map((p) => this.blankPlot(p));
    }
    if (GameState.unlocked.greenhouse) this.ensureGreenhouse(true);
    GameState.plots.forEach((p, i) => this.buildPlotVisual(p, i));
  },

  blankPlot(p) {
    return {
      ...p,
      tilled: false,
      watered: false,
      crop: null,
      stage: 0,
      progress: 0,
      offSeason: false,
      withered: false,
    };
  },

  // Thêm 4 ô nhà kính (idempotent) — gọi khi mở khóa hoặc load save cũ
  ensureGreenhouse(silent = false) {
    if (GameState.plots.some((p) => p.area === "gh")) return;
    const startIdx = GameState.plots.length;
    LAYOUT.ghPlots.forEach((p) => GameState.plots.push(this.blankPlot(p)));
    if (this.scene) {
      for (let i = startIdx; i < GameState.plots.length; i++)
        this.buildPlotVisual(GameState.plots[i], i);
    }
    if (!silent) emit(EVT.SAVE);
  },

  inSeason(plot, crop) {
    return plot.area === "gh" || SeasonSystem.isCropInSeason(crop);
  },

  plotCenter(p) {
    return { x: tx2px(p.tx) + T / 2, y: tx2px(p.ty) + T / 2 };
  },

  buildPlotVisual(p, idx) {
    const sc = this.scene;
    const { x, y } = this.plotCenter(p);
    const soil = sc.add
      .image(x, y, p.watered ? "tile_soil_wet" : "tile_soil")
      .setVisible(!!p.tilled);
    sc.addDepthSorted(soil);
    const cropSpr = sc.add.sprite(x, y - 6, "crop_turnip_0").setVisible(false);
    sc.addDepthSorted(cropSpr);
    const sparkles = sc.add
      .particles(x, y - 18, "pt_sparkle", {
        lifespan: 900,
        frequency: 700,
        scale: { start: 0.7, end: 0.2 },
        speedY: { min: -14, max: -30 },
        alpha: { start: 0.9, end: 0 },
      })
      .setVisible(false)
      .setDepth(600);
    this.runtime[idx] = { soil, cropSpr, sparkles, plot: p };
    this.refreshCropSprite(p, idx);
    sc.addInteractable({
      x,
      y,
      radius: 52,
      getPrompt: () => this.getPrompt(p),
      onInteract: () => this.interact(p, idx),
    });
  },

  refreshCropSprite(p, idx) {
    const rt = this.runtime[idx];
    if (!rt) return;
    if (!p.crop || !p.tilled) {
      rt.cropSpr.setVisible(false);
      rt.sparkles.setVisible(false);
      return;
    }
    if (p.withered) {
      rt.cropSpr
        .setTexture(`crop_${p.crop}_0`)
        .setVisible(true)
        .setTint(0x8a7a6a)
        .setAlpha(0.8);
      rt.sparkles.setVisible(false);
      return;
    }
    rt.cropSpr.clearTint().setAlpha(1);
    rt.cropSpr.setTexture(`crop_${p.crop}_${p.stage}`).setVisible(true);
    rt.sparkles.setVisible(p.stage === 4);
  },

  getPrompt(p) {
    if (!p.tilled)
      return {
        text: p.area === "gh" ? "Cuốc đất (nhà kính)" : "Cuốc đất",
        icon: "icon_hoe",
      };
    if (p.withered) return { text: "Dọn cây héo", icon: "icon_hoe" };
    if (!p.crop) return { text: "Gieo hạt", icon: "icon_can" };
    if (p.stage >= 4)
      return { text: "Thu hoạch!", icon: `icon_crop_${p.crop}` };
    return { text: p.watered ? "Đã tưới" : "Tưới nước", icon: "icon_can" };
  },

  interact(p, idx) {
    const sc = this.scene;
    const pl = sc.player;
    if (!p.tilled) {
      pl.faceToward(this.plotCenter(p).x, this.plotCenter(p).y);
      pl.playAction("dig", () => {
        p.tilled = true;
        this.runtime[idx].soil.setVisible(true);
        SFX.pop();
        emit(EVT.SAVE);
      });
      return;
    }
    if (p.withered) {
      pl.playAction("dig", () => {
        Object.assign(p, {
          crop: null,
          stage: 0,
          progress: 0,
          withered: false,
          watered: false,
        });
        this.refreshCropSprite(p, idx);
        SFX.pop();
        emit(EVT.SAVE);
      });
      return;
    }
    if (!p.crop) {
      const sel = GameState.selected;
      if (!sel || !sel.startsWith("seed_")) {
        sc.hud.toast("Chọn hạt giống trong Túi đồ (I) rồi gieo nhé!");
        return;
      }
      if (!InventorySystem.has(sel)) {
        sc.hud.toast("Hết hạt giống rồi!");
        return;
      }
      const cropId = seedToCrop(sel);
      const crop = CROPS[cropId];
      const okSeason = this.inSeason(p, crop);
      InventorySystem.remove(sel);
      Object.assign(p, {
        crop: cropId,
        stage: 0,
        progress: 0,
        offSeason: !okSeason,
        withered: false,
      });
      pl.faceToward(this.plotCenter(p).x, this.plotCenter(p).y);
      pl.playAction("harvest", () => {
        this.refreshCropSprite(p, idx);
        SFX.plant();
        emit(EVT.QUEST_EVENT, {
          type: "crop.plant",
          flower: crop.type === "flower" || crop.type === "star",
          cropId,
        });
        if (!okSeason)
          sc.hud.toast(
            `${crop.name} trái mùa sẽ lớn chậm gấp đôi... (nhà kính thì luôn OK!)`,
          );
        emit(EVT.SAVE);
      });
      return;
    }
    if (p.stage >= 4) {
      const crop = CROPS[p.crop];
      pl.faceToward(this.plotCenter(p).x, this.plotCenter(p).y);
      pl.playAction("harvest", () => {
        const { x, y } = this.plotCenter(p);
        sc.add
          .particles(x, y - 20, "pt_sparkle", {
            lifespan: 700,
            speed: { min: 30, max: 90 },
            quantity: 8,
            emitting: false,
          })
          .setDepth(700)
          .explode(8);
        InventorySystem.add(`crop_${p.crop}`);
        sc.hud.toast(`+1 ${crop.name}!`);
        SFX.harvest();
        emit(EVT.QUEST_EVENT, { type: "crop.harvest", cropId: p.crop });
        Object.assign(p, {
          crop: null,
          stage: 0,
          progress: 0,
          watered: false,
          offSeason: false,
        });
        this.refreshCropSprite(p, idx);
        emit(EVT.SAVE);
      });
      return;
    }
    if (p.watered) {
      sc.hud.toast("Ô đất đã đủ ẩm rồi.");
      return;
    }
    pl.faceToward(this.plotCenter(p).x, this.plotCenter(p).y);
    pl.playAction("water", () => {
      p.watered = true;
      this.runtime[idx].soil.setTexture("tile_soil_wet");
      const { x, y } = this.plotCenter(p);
      sc.add
        .particles(x, y - 14, "pt_drop", {
          lifespan: 500,
          speedY: { min: 30, max: 60 },
          quantity: 5,
          emitting: false,
        })
        .setDepth(700)
        .explode(5);
      SFX.pop();
      emit(EVT.QUEST_EVENT, { type: "crop.water" });
      emit(EVT.SAVE);
    });
  },

  endDay(rained) {
    let hybridMsg = false;
    for (let i = 0; i < GameState.plots.length; i++) {
      const p = GameState.plots[i];
      if (!p.crop || p.withered) continue;
      const crop = CROPS[p.crop];
      const hydrated = p.watered || (rained && p.area !== "gh"); // nhà kính không hưởng mưa
      if (hydrated) {
        const need = p.offSeason ? crop.growDays * 2 : crop.growDays;
        p.progress += 1;
        p.stage =
          p.progress >= need
            ? 4
            : clamp(Math.floor((p.progress / need) * 4), 0, 3);
      }
      p.watered = false;
      this.runtime[i]?.soil.setTexture("tile_soil");
      this.refreshCropSprite(p, i);
    }
    for (const hb of HYBRIDS) {
      for (const p of GameState.plots) {
        if (p.tilled && !p.crop && !p.withered && Math.random() < hb.chance) {
          const neigh = this.neighborCrops(p);
          if (neigh.includes(hb.parents[0]) && neigh.includes(hb.parents[1])) {
            p.crop = hb.child;
            p.stage = 0;
            p.progress = 0;
            p.offSeason = false;
            this.refreshCropSprite(p, GameState.plots.indexOf(p));
            hybridMsg = true;
          }
        }
      }
    }
    return hybridMsg;
  },

  neighborCrops(p) {
    return GameState.plots
      .filter(
        (o) =>
          Math.abs(o.tx - p.tx) + Math.abs(o.ty - p.ty) === 1 &&
          o.crop &&
          o.stage === 4,
      )
      .map((o) => o.crop);
  },
};
