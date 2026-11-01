import { CONFIG, LAYOUT, T, tx2px, dist, mulberry32 } from "../config.js";
import { GameState, addXP } from "../state.js";
import { CROPS } from "../data/crops.js";
import { RECIPES } from "../data/recipes.js";
import { NPCS } from "../data/npcs.js";
import { itemName } from "../data/items.js";
import { Player } from "../entities/Player.js";
import { NPC } from "../entities/NPC.js";
import { FarmingSystem } from "../systems/FarmingSystem.js";
import { PetSystem } from "../systems/PetSystem.js";
import { QuestSystem } from "../systems/QuestSystem.js";
import { TimeSystem } from "../systems/TimeSystem.js";
import { SeasonSystem } from "../systems/SeasonSystem.js";
import { WeatherSystem } from "../systems/WeatherSystem.js";
import { SaveSystem } from "../systems/SaveSystem.js";
import { InventorySystem } from "../systems/InventorySystem.js";
import { FishingSystem } from "../systems/FishingSystem.js";
import { DaySystem } from "../systems/DaySystem.js";
import { LightSystem } from "../systems/LightSystem.js";
import { AchievementSystem } from "../systems/AchievementSystem.js";
import { generateSeasonTextures } from "../art/Textures.js";
import { EVT, emit, on, GameEvents } from "../GameEvents.js";
import { HUD } from "../ui/HUD.js";
import { Panels } from "../ui/Panels.js";
import { DialogueUI } from "../ui/DialogueUI.js";
import { onKeyDownOnce } from "../utils/input.js";
import SFX from "../SoundFX.js";

export class GameScene extends Phaser.Scene {
  constructor() {
    super("Game");
  }
  init(data) {
    this.enterData = data || {};
  }

  create() {
    this.depthItems = [];
    this.interactables = [];
    this.forageSprites = [];
    this.butterflies = [];
    this.npcs = [];
    this.solids = this.physics.add.staticGroup();
    this.placementMode = null;
    this.sittingBench = null;

    this.worldContainer = this.add.container(0, 0);
    this.cameras.main.setBounds(0, 0, CONFIG.MAP_W * T, CONFIG.MAP_H * T);
    this.physics.world.setBounds(0, 0, CONFIG.MAP_W * T, CONFIG.MAP_H * T);

    // Lớp phủ ngày/đêm — TimeSystem tô màu qua đây (Container không có setTint)
    this.dayNightOverlay = this.add
      .rectangle(
        this.scale.width / 2,
        this.scale.height / 2,
        this.scale.width,
        this.scale.height,
        0xffffff,
        1,
      )
      .setScrollFactor(0)
      .setBlendMode(Phaser.BlendModes.MULTIPLY)
      .setDepth(895);

    this.buildGround();
    this.buildPond();
    this.buildHouse();
    this.buildPetArea();
    this.buildTrees();
    this.buildFences();
    this.buildMailbox();

    const spawn = this.enterData.fromHouse
      ? { x: tx2px(LAYOUT.door.tx), y: tx2px(LAYOUT.door.ty + 1.7) }
      : { x: tx2px(LAYOUT.door.tx), y: tx2px(LAYOUT.door.ty + 1.4) };
    this.player = new Player(
      this,
      spawn.x,
      spawn.y,
      GameState.character.gender,
    );
    this.physics.add.collider(this.player, this.solids);

    FarmingSystem.init(this);
    this.maybeUnlockGreenhouse(true);
    PetSystem.init(this);
    this.decorSprites = [];
    this.restoreDecor();
    this.buildForage();
    this.buildButterflies();
    this.buildFishingSpot();
    this.spawnNPCs();

    TimeSystem.init(this);
    WeatherSystem.init(this);
    QuestSystem.init(this);
    SaveSystem.init(this);
    AchievementSystem.init(this);
    LightSystem.init(this);
    this.applySeasonVisuals();

    this.hud = new HUD(this);
    this.panels = new Panels(this);
    this.setupInput();
    this.bindLevelUps();

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.fadeIn(700, 26, 35, 50);

    const s = SeasonSystem.current();
    if (this.enterData.morning) {
      this.time.delayedCall(500, () =>
        this.hud.banner(
          `Ngày ${GameState.day} · Mùa ${s.vi}`,
          "Bạn thức dậy thật sảng khoái!",
        ),
      );
    } else {
      this.time.delayedCall(500, () =>
        this.hud.banner(`Mùa ${s.vi} — Ngày ${GameState.day}`, s.desc),
      );
      this.time.delayedCall(2200, () =>
        this.hud.toast(
          `Chào ${GameState.character.name}! Nhấn E để tương tác, I mở túi đồ.`,
        ),
      );
    }

    // KHÔNG dùng removeAllListeners — mỗi hệ thống tự off-first trong init()
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.hud?.destroy();
      this.panels?.destroy();
      DialogueUI.forceClose();
      FishingSystem.cancel();
    });
  }

  /* ---------- thế giới ---------- */
  buildGround() {
    const rng = mulberry32(42);
    this.groundImgs = [];
    for (let ty = 0; ty < CONFIG.MAP_H; ty++) {
      for (let tx = 0; tx < CONFIG.MAP_W; tx++) {
        const v = rng() < 0.55 ? 0 : rng() < 0.8 ? 1 : 2;
        const img = this.add.image(
          tx * T + T / 2,
          ty * T + T / 2,
          `grass_${v}`,
        );
        this.worldContainer.add(img);
        this.groundImgs.push({ img, v });
      }
    }
    const pathTiles = new Set();
    for (const seg of LAYOUT.paths) {
      const [x1, x2] = seg.x1 < seg.x2 ? [seg.x1, seg.x2] : [seg.x2, seg.x1];
      const [y1, y2] = seg.y1 < seg.y2 ? [seg.y1, seg.y2] : [seg.y2, seg.y1];
      for (let x = x1; x <= x2; x++)
        for (let y = y1; y <= y2; y++) pathTiles.add(`${x},${y}`);
    }
    for (const key of pathTiles) {
      const [tx, ty] = key.split(",").map(Number);
      this.worldContainer.add(
        this.add
          .image(tx * T + T / 2, ty * T + T / 2, "tile_path")
          .setAlpha(0.95),
      );
    }
    const dirtRect = (x1, y1, x2, y2) => {
      for (let ty = y1; ty <= y2; ty++)
        for (let tx = x1; tx <= x2; tx++) {
          this.worldContainer.add(
            this.add.image(tx * T + T / 2, ty * T + T / 2, "tile_dirt"),
          );
        }
    };
    dirtRect(17, 6, 27, 10);
    dirtRect(3, 15, 16, 21);
  }

  buildPond() {
    const p = LAYOUT.pond;
    const cx = tx2px(p.tx),
      cy = tx2px(p.ty);
    const g = this.add.graphics();
    g.fillStyle(0xc9b98a, 1);
    g.fillEllipse(cx, cy, p.rx * 2 * T + 26, p.ry * 2 * T + 26);
    g.fillStyle(0x6fc3e0, 1);
    g.fillEllipse(cx, cy, p.rx * 2 * T, p.ry * 2 * T);
    g.fillStyle(0x8fd4ea, 1);
    g.fillEllipse(cx - 18, cy - 12, p.rx * 1.5 * T, p.ry * 1.4 * T);
    g.fillStyle(0x5db6d4, 0.6);
    g.fillEllipse(cx + 24, cy + 16, p.rx * 0.9 * T, p.ry * 0.8 * T);
    g.fillStyle(0x5fae4c, 1);
    g.fillEllipse(cx + 40, cy - 26, 30, 22);
    g.fillStyle(0x6aa854, 1);
    g.fillEllipse(cx - 56, cy + 24, 26, 18);
    g.fillStyle(0xf7bcd2, 1);
    g.fillCircle(cx + 44, cy - 28, 5);
    this.worldContainer.add(g);
    this.ripples = this.add.graphics().setAlpha(0.5);
    this.worldContainer.add(this.ripples);
    const dock = this.add.image(
      tx2px(LAYOUT.dock.tx) + 20,
      tx2px(LAYOUT.dock.ty) + 24,
      "dock",
    );
    this.worldContainer.add(dock);
    this.addDepthSorted(dock);
    const zone = this.add
      .rectangle(cx, cy, p.rx * 1.7 * T, p.ry * 1.6 * T)
      .setVisible(false);
    this.physics.add.existing(zone, true);
    this.solids.add(zone);
  }

  buildHouse() {
    const h = LAYOUT.house;
    this.houseSpr = this.add.image(
      tx2px(h.tx) + 192,
      tx2px(h.ty) + 168,
      "house",
    );
    this.houseSnow = this.add
      .image(this.houseSpr.x, this.houseSpr.y, "house_snow")
      .setVisible(false);
    this.worldContainer.add(this.houseSpr);
    this.worldContainer.add(this.houseSnow);
    this.addDepthSorted(this.houseSpr);
    this.addDepthSorted(this.houseSnow);
    this.smoke = this.add
      .particles(tx2px(h.tx) + 281, tx2px(h.ty) + 14, "pt_snow", {
        lifespan: 2600,
        speedY: { min: -22, max: -34 },
        speedX: { min: -6, max: 10 },
        scale: { start: 0.5, end: 1.6 },
        alpha: { start: 0.5, end: 0 },
        frequency: 650,
        tint: [0xd9d0c0],
      })
      .setDepth(550);
    const hx = tx2px(h.tx),
      hy = tx2px(h.ty);
    const body = this.add
      .rectangle(hx + 192, hy + 210, 320, 190)
      .setVisible(false);
    this.physics.add.existing(body, true);
    this.solids.add(body);
    this.addInteractable({
      x: hx + 192,
      y: hy + 330,
      radius: 58,
      getPrompt: () => ({ text: "Vào nhà", icon: "icon_star" }),
      onInteract: () => {
        SFX.blip();
        this.player.faceToward(hx + 192, hy + 200);
        this.cameras.main.fadeOut(420, 30, 25, 20);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("House", { floor: 1, entry: "door" });
        });
      },
    });
  }

  buildPetArea() {
    const P = LAYOUT.pet;
    const hutch = this.add.image(
      tx2px(P.rabbit.hutch.tx) + 48,
      tx2px(P.rabbit.hutch.ty) + 46,
      "hutch",
    );
    const doghouse = this.add.image(
      tx2px(P.dog.house.tx) + 44,
      tx2px(P.dog.house.ty) + 41,
      "doghouse",
    );
    const bed1 = this.add.image(
      tx2px(P.cat1.bed.tx),
      tx2px(P.cat1.bed.ty),
      "catbed_pink",
    );
    const bed2 = this.add.image(
      tx2px(P.cat2.bed.tx),
      tx2px(P.cat2.bed.ty),
      "catbed_blue",
    );
    [hutch, doghouse, bed1, bed2].forEach((o) => {
      this.worldContainer.add(o);
      this.addDepthSorted(o);
    });
    for (const [ox, oy, w, hh] of [
      [tx2px(P.rabbit.hutch.tx) + 48, tx2px(P.rabbit.hutch.ty) + 60, 88, 44],
      [tx2px(P.dog.house.tx) + 44, tx2px(P.dog.house.ty) + 52, 80, 36],
    ]) {
      const b = this.add.rectangle(ox, oy, w, hh).setVisible(false);
      this.physics.add.existing(b, true);
      this.solids.add(b);
    }
  }

  buildTrees() {
    this.treeSprites = [];
    LAYOUT.trees.forEach(([tx, ty], i) => {
      const maple = i % 5 === 3;
      const spr = this.add.image(
        tx2px(tx),
        tx2px(ty),
        maple ? "tree_maple" : `tree_${i % 2}`,
      );
      spr.setData("maple", maple);
      spr.setData("variant", i % 2);
      this.worldContainer.add(spr);
      this.addDepthSorted(spr);
      this.treeSprites.push(spr);
      const b = this.add
        .rectangle(tx2px(tx), tx2px(ty) + 40, 34, 22)
        .setVisible(false);
      this.physics.add.existing(b, true);
      this.solids.add(b);
    });
  }

  buildFences() {
    const mkLine = (rect, gate = null) => {
      const { x1, y1, x2, y2 } = rect;
      for (let x = x1; x < x2; x++) {
        if (gate && Math.abs(x - gate) < 1.2) continue;
        const f = this.add.image(x * T + T / 2, y1 * T + 10, "fence_h");
        this.worldContainer.add(f);
        this.addDepthSorted(f);
        const f2 = this.add.image(x * T + T / 2, y2 * T + 10, "fence_h");
        this.worldContainer.add(f2);
        this.addDepthSorted(f2);
      }
      for (let y = y1; y < y2; y++) {
        const fl = this.add.image(x1 * T + 8, y * T + T / 2, "fence_v");
        this.worldContainer.add(fl);
        this.addDepthSorted(fl);
        const fr = this.add.image(x2 * T + 8, y * T + T / 2, "fence_v");
        this.worldContainer.add(fr);
        this.addDepthSorted(fr);
      }
    };
    mkLine(LAYOUT.fences.rabbit, 6);
    mkLine(LAYOUT.fences.garden, 19.5);
  }

  buildMailbox() {
    const mb = this.add.image(
      tx2px(LAYOUT.mailbox.tx),
      tx2px(LAYOUT.mailbox.ty),
      "mailbox",
    );
    this.worldContainer.add(mb);
    this.addDepthSorted(mb);
    this.addInteractable({
      x: mb.x,
      y: mb.y,
      radius: 48,
      getPrompt: () => ({
        text:
          GameState.mailDay === this.dayNum()
            ? "Hộp thư (đã mở)"
            : "Mở hộp thư",
        icon: "icon_star",
      }),
      onInteract: () => {
        if (GameState.mailDay === this.dayNum()) {
          this.hud.toast("Hòm thư hôm nay trống rồi.");
          return;
        }
        GameState.mailDay = this.dayNum();
        const season = SeasonSystem.current();
        const pool = Object.entries(CROPS)
          .filter(([_, c]) => c.seasons.includes(season.id))
          .map(([id]) => `seed_${id}`);
        const gift =
          pool[Math.floor(Math.random() * pool.length)] || "seed_turnip";
        InventorySystem.add(gift);
        SFX.quest();
        this.hud.toast(
          `Trong hộp thư có một gói hạt giống: ${itemName(gift)}!`,
          "reward",
        );
        emit(EVT.SAVE);
      },
    });
    const b = this.add.rectangle(mb.x, mb.y + 20, 26, 16).setVisible(false);
    this.physics.add.existing(b, true);
    this.solids.add(b);
  }
  dayNum() {
    return GameState.year * 1000 + GameState.seasonIndex * 100 + GameState.day;
  }

  buildForage() {
    this.forageSprites.forEach((f) => f.spr.destroy());
    this.forageSprites = [];
    const season = SeasonSystem.current();
    const count = 5 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const id =
        season.forage[Math.floor(Math.random() * season.forage.length)];
      let x,
        y,
        tries = 0;
      do {
        x = Phaser.Math.Between(2, CONFIG.MAP_W - 2) * T;
        y = Phaser.Math.Between(10, CONFIG.MAP_H - 2) * T;
        tries++;
      } while (tries < 20 && this.isBlockedSpot(x, y));
      const spr = this.add.image(x, y, `icon_${id}`).setScale(0.8);
      this.worldContainer.add(spr);
      this.addDepthSorted(spr);
      const entry = { id, spr };
      this.forageSprites.push(entry);
      this.addInteractable({
        x,
        y,
        radius: 44,
        getPrompt: () => ({ text: `Nhặt ${itemName(id)}`, icon: `icon_${id}` }),
        onInteract: () => {
          InventorySystem.add(id);
          SFX.pop();
          addXP(4);
          this.add
            .particles(x, y - 10, "pt_sparkle", {
              lifespan: 600,
              speed: { min: 20, max: 60 },
              quantity: 5,
              emitting: false,
            })
            .setDepth(700)
            .explode(5);
          emit(EVT.QUEST_EVENT, { type: "item.collect", itemId: id });
          spr.destroy();
          this.forageSprites = this.forageSprites.filter((f) => f !== entry);
          this.interactables = this.interactables.filter(
            (it) => it.x !== x || it.y !== y,
          );
          emit(EVT.SAVE);
        },
      });
    }
  }

  buildButterflies() {
    for (let i = 0; i < 5; i++) {
      const c = i % 3;
      const spr = this.add.sprite(
        tx2px(18 + Math.random() * 8),
        tx2px(12 + Math.random() * 6),
        `bf_${c}_0`,
      );
      spr.setData("t", Math.random() * 1000);
      spr.setData("baseX", spr.x);
      spr.setData("baseY", spr.y);
      this.worldContainer.add(spr);
      this.addDepthSorted(spr);
      this.butterflies.push(spr);
      if (!this.anims.exists(`bfly_${c}`)) {
        this.anims.create({
          key: `bfly_${c}`,
          frames: [{ key: `bf_${c}_0` }, { key: `bf_${c}_1` }],
          frameRate: 8,
          repeat: -1,
        });
      }
      spr.anims.play(`bfly_${c}`);
      this.addInteractable({
        x: spr.x,
        y: spr.y,
        radius: 46,
        dynamic: spr,
        getPrompt: () => ({ text: "Bắt bướm", icon: "icon_net" }),
        onInteract: () => this.catchButterfly(spr),
      });
    }
  }

  catchButterfly(spr) {
    if (!InventorySystem.has("net")) {
      this.hud.toast("Bạn cần có vợt bướm!");
      return;
    }
    this.player.faceToward(spr.x, spr.y);
    this.player.playAction("harvest", () => {
      if (Math.random() < 0.6) {
        const rare =
          SeasonSystem.current().id === "autumn" && Math.random() < 0.25;
        const id = rare ? "bug_rare" : "bug_common";
        InventorySystem.add(id);
        addXP(rare ? 25 : 10);
        SFX.harvest();
        this.hud.toast(
          rare ? "Wow! Bướm vua quý hiếm!" : `Bắt được ${itemName(id)}!`,
          rare ? "reward" : "",
        );
        emit(EVT.QUEST_EVENT, { type: "bug.catch", itemId: id });
      } else {
        this.hud.toast("Nó bay mất rồi!");
        SFX.error();
      }
      const nx = tx2px(4 + Math.random() * 26),
        ny = tx2px(10 + Math.random() * 10);
      spr.setData("baseX", nx);
      spr.setData("baseY", ny);
      spr.setPosition(nx, ny);
      emit(EVT.SAVE);
    });
  }

  buildFishingSpot() {
    const fs = LAYOUT.fishingSpot;
    const x = tx2px(fs.tx),
      y = tx2px(fs.ty);
    this.addInteractable({
      x,
      y,
      radius: 52,
      getPrompt: () => ({ text: "Câu cá", icon: "icon_rod" }),
      onInteract: () => {
        this.player.faceToward(x + 20, y);
        FishingSystem.start(this);
      },
    });
  }

  spawnNPCs() {
    const season = SeasonSystem.current().id;
    for (const cfg of NPCS) {
      if (!cfg.seasons.includes(season)) continue;
      const npc = new NPC(this, cfg, tx2px(cfg.spot.tx), tx2px(cfg.spot.ty));
      this.npcs.push(npc);
      this.addInteractable({
        x: npc.x,
        y: npc.y,
        radius: 58,
        dynamic: npc,
        getPrompt: () => ({
          text: `Trò chuyện với ${cfg.name}`,
          icon: "icon_heart",
        }),
        onInteract: () => this.talkTo(npc),
      });
    }
  }

  talkTo(npc) {
    const cfg = npc.cfg;
    this.player.faceToward(npc.x, npc.y);
    npc.facePlayer(this.player);
    if (!GameState.gifts) GameState.gifts = {};
    const today = this.dayNum();
    const giftDue = GameState.gifts[cfg.id] !== today;
    const pool = giftDue ? cfg.lines.gift : cfg.lines.chat;
    const lines = [pool[Math.floor(Math.random() * pool.length)]];
    let giftItem = null;
    if (giftDue) {
      const gp = cfg.gifts[SeasonSystem.current().id] || ["flour"];
      giftItem = gp[Math.floor(Math.random() * gp.length)];
      lines.push(`Ta có món quà nhỏ cho con: ${itemName(giftItem)}!`);
    }
    emit(EVT.QUEST_EVENT, { type: "npc.talk", npcId: cfg.id });
    DialogueUI.show(this, {
      name: `${cfg.name} · ${cfg.role}`,
      portraitKey: `npc_${cfg.id}_idle_down_0`,
      lines,
      onDone: () => {
        if (giftDue && giftItem) {
          GameState.gifts[cfg.id] = today;
          InventorySystem.add(giftItem);
          SFX.quest();
          this.hud.toast(
            `Nhận được ${itemName(giftItem)} từ ${cfg.name}!`,
            "reward",
          );
          emit(EVT.SAVE);
        }
      },
    });
  }

  maybeUnlockGreenhouse(silent = false) {
    if (
      !GameState.unlocked.greenhouse &&
      GameState.level >= CONFIG.GREENHOUSE_LEVEL
    ) {
      GameState.unlocked.greenhouse = true;
      emit(EVT.SAVE);
      if (!silent) {
        this.hud.banner(
          "Nhà kính đã mở khóa!",
          "Trồng cây trái mùa, không sợ mưa nắng",
        );
        SFX.levelup();
      }
    }
    if (GameState.unlocked.greenhouse) {
      this.buildGreenhouse();
      FarmingSystem.ensureGreenhouse();
    }
  }
  buildGreenhouse() {
    if (this.ghSpr) return;
    const gpos = LAYOUT.greenhouse;
    this.ghSpr = this.add.image(
      tx2px(gpos.tx) + 125,
      tx2px(gpos.ty) + 80,
      "gh_house",
    );
    this.worldContainer.add(this.ghSpr);
    this.addDepthSorted(this.ghSpr);
    const b = this.add
      .rectangle(tx2px(gpos.tx) + 125, tx2px(gpos.ty) + 30, 230, 40)
      .setVisible(false);
    this.physics.add.existing(b, true);
    this.solids.add(b);
  }

  bindLevelUps() {
    if (this._lvlFn) GameEvents.off(EVT.LEVEL_UP, this._lvlFn, this);
    this._lvlFn = (lv) => {
      this.maybeUnlockGreenhouse();
      RECIPES.filter((r) => r.level === lv).forEach((r) =>
        this.time.delayedCall(1500, () =>
          this.hud.toast(`Mở khóa công thức: ${itemName(r.id)}!`, "reward"),
        ),
      );
      if (lv === 2)
        this.time.delayedCall(2200, () =>
          this.hud.toast("Gợi ý: ghé bếp tầng 1 và thử câu cá ở hồ!"),
        );
    };
    on(EVT.LEVEL_UP, this._lvlFn, this);
  }

  /* ---------- decor ---------- */
  isBlockedSpot(x, y) {
    const h = LAYOUT.house;
    if (
      x > tx2px(h.tx) - 40 &&
      x < tx2px(h.tx) + 420 &&
      y > tx2px(h.ty) - 20 &&
      y < tx2px(h.ty) + 360
    )
      return true;
    const p = LAYOUT.pond;
    if (dist(x, y, tx2px(p.tx), tx2px(p.ty)) < p.rx * T * 1.1) return true;
    if (x > tx2px(17) && x < tx2px(27) && y > tx2px(6) && y < tx2px(11))
      return true;
    if (x > tx2px(3) && x < tx2px(16) && y > tx2px(15) && y < tx2px(21))
      return true;
    return false;
  }
  restoreDecor() {
    for (const d of GameState.decor) this.spawnDecor(d);
  }
  spawnDecor(d) {
    const spr = this.add.image(d.x, d.y, `decor_${d.id}`);
    this.worldContainer.add(spr);
    this.addDepthSorted(spr);
    this.decorSprites.push(spr);
    this.addInteractable({
      x: d.x,
      y: d.y,
      radius: 46,
      getPrompt: () => ({
        text: d.id === "bench" ? "Ngồi nghỉ / Nhặt lên" : "Nhặt lên",
        icon: `icon_${d.id}`,
      }),
      onInteract: () => {
        if (d.id === "bench" && !this.player.sitting) {
          this.player.setPosition(d.x, d.y - 6);
          this.player.setDepth(9999);
          this.player.sit();
          this.sittingBench = d;
          return;
        }
        GameState.decor = GameState.decor.filter((o) => o !== d);
        spr.destroy();
        this.decorSprites = this.decorSprites.filter((s) => s !== spr);
        this.interactables = this.interactables.filter(
          (it) => it.x !== d.x || it.y !== d.y,
        );
        InventorySystem.add(d.id);
        SFX.pop();
        LightSystem.refresh();
        emit(EVT.SAVE);
      },
    });
    LightSystem.refresh();
    return spr;
  }
  enterPlacement(itemId) {
    if (!InventorySystem.has(itemId)) return;
    this.placementMode = itemId;
    this.ghost = this.add
      .image(this.player.x, this.player.y, `decor_${itemId}`)
      .setAlpha(0.55)
      .setDepth(1000);
    this.hud.toast("Nhấp chuột để đặt · Esc để hủy");
  }
  updatePlacement(ptr) {
    if (!this.placementMode) return;
    const wx = ptr.worldX,
      wy = ptr.worldY;
    const ok =
      !this.isBlockedSpot(wx, wy) &&
      wx > T &&
      wx < (CONFIG.MAP_W - 1) * T &&
      wy > T &&
      wy < (CONFIG.MAP_H - 1) * T;
    this.ghost.setPosition(wx, wy).setTint(ok ? 0xffffff : 0xff6a6a);
  }
  placeDecor(ptr) {
    if (!this.placementMode) return;
    const wx = ptr.worldX,
      wy = ptr.worldY;
    if (this.isBlockedSpot(wx, wy)) {
      this.hud.toast("Chỗ này không đặt được.");
      return;
    }
    InventorySystem.remove(this.placementMode);
    const d = { id: this.placementMode, x: wx, y: wy };
    GameState.decor.push(d);
    this.spawnDecor(d);
    SFX.plant();
    this.exitPlacement();
    emit(EVT.SAVE);
  }
  exitPlacement() {
    this.placementMode = null;
    this.ghost?.destroy();
    this.ghost = null;
  }

  /* ---------- tiện ích ---------- */
  addDepthSorted(obj) {
    this.depthItems.push(obj);
  }
  addInteractable(it) {
    this.interactables.push(it);
  }

  setupInput() {
    const k = this.input.keyboard;
    const raw = {
      up: k.addKey("W"),
      up2: k.addKey("UP"),
      down: k.addKey("S"),
      down2: k.addKey("DOWN"),
      left: k.addKey("A"),
      left2: k.addKey("LEFT"),
      right: k.addKey("D"),
      right2: k.addKey("RIGHT"),
      shift: k.addKey("SHIFT"),
    };
    const wrap = (a, b) => ({
      get isDown() {
        return a.isDown || b.isDown;
      },
    });
    this.keys = {
      up: wrap(raw.up, raw.up2),
      down: wrap(raw.down, raw.down2),
      left: wrap(raw.left, raw.left2),
      right: wrap(raw.right, raw.right2),
      shift: raw.shift,
    };

    onKeyDownOnce(k, "E", () => {
      if (DialogueUI.isActive()) {
        DialogueUI.advance();
        return;
      }
      if (FishingSystem.active) {
        FishingSystem.press();
        return;
      }
      if (GameState.uiOpen || this.player.locked) return;
      if (this.player.sitting) {
        this.player.standUp();
        this.player.setDepth(0);
        this.addDepthSorted(this.player);
        this.sittingBench = null;
        return;
      }
      this.tryInteract();
    });
    onKeyDownOnce(k, "I", () => {
      if (!this.placementMode && !FishingSystem.active)
        this.panels.toggleInventory();
    });
    onKeyDownOnce(k, "Q", () => this.tryPetPanel());
    onKeyDownOnce(k, "ESC", () => {
      if (this.placementMode) {
        this.exitPlacement();
        return;
      }
      if (FishingSystem.active) {
        FishingSystem.cancel();
        return;
      }
      if (DialogueUI.isActive()) {
        DialogueUI.forceClose();
        return;
      }
      if (this.panels.esc()) return;
      this.panels.showPause();
    });
    onKeyDownOnce(k, "P", () => this.takePhoto());

    this.input.on("pointerdown", (ptr) => {
      if (this.placementMode) this.placeDecor(ptr);
    });
    this.input.on("pointermove", (ptr) => this.updatePlacement(ptr));
  }

  nearestInteractable() {
    let best = null,
      bd = CONFIG.INTERACT_R;
    for (const it of this.interactables) {
      const ix = it.dynamic ? it.dynamic.x : it.x;
      const iy = it.dynamic ? it.dynamic.y : it.y;
      const d = dist(this.player.x, this.player.y, ix, iy);
      if (d < bd) {
        bd = d;
        best = it;
      }
    }
    return best;
  }
  tryInteract() {
    this.nearestInteractable()?.onInteract();
  }
  tryPetPanel() {
    for (const pet of PetSystem.pets) {
      if (dist(this.player.x, this.player.y, pet.x, pet.y) < 60) {
        PetSystem.openPanel(pet);
        return;
      }
    }
  }

  takePhoto() {
    if (this._photoBusy) return;
    this._photoBusy = true;
    this.hud.hide();
    PetSystem.pets.forEach((p) => {
      if (p.state !== "sleep") {
        p.setAnim("happy");
        p.state = "happyreact";
        p.stateT = 2800;
      }
    });
    const cd = this.add
      .text(this.scale.width / 2, this.scale.height / 2, "3", {
        fontSize: "64px",
        fontWeight: "900",
        color: "#fff",
        stroke: "#5c4a3d",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2000);
    let n = 3;
    this.time.addEvent({
      delay: 620,
      repeat: 2,
      callback: () => {
        n--;
        SFX.blip();
        if (n > 0) cd.setText(String(n));
        else {
          cd.destroy();
          this.snapPhoto();
        }
      },
    });
  }
  snapPhoto() {
    this.game.renderer.snapshot((img) => {
      try {
        const W = 1040,
          H = 700;
        const cvs = document.createElement("canvas");
        cvs.width = W;
        cvs.height = H;
        const ctx = cvs.getContext("2d");
        ctx.fillStyle = "#fdf6e9";
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = "#e8d9bd";
        ctx.lineWidth = 6;
        ctx.strokeRect(10, 10, W - 20, H - 20);
        ctx.drawImage(img, 20, 20, W - 40, H - 78);
        ctx.fillStyle = "#5c4a3d";
        ctx.font = "800 21px Nunito, sans-serif";
        const s = SeasonSystem.current();
        ctx.fillText(
          `My Cozy Seasons — Mùa ${s.vi}, Ngày ${GameState.day} · Năm ${GameState.year}`,
          24,
          H - 26,
        );
        const a = document.createElement("a");
        a.href = cvs.toDataURL("image/png");
        a.download = `cozy-${s.id}-d${GameState.day}-${Date.now()}.png`;
        a.click();
      } catch (e) {
        console.warn(e);
      }
    });
    this.time.delayedCall(350, () => {
      this.hud.show();
      this.hud.toast("Đã chụp một bức ảnh thật đẹp!");
      this._photoBusy = false;
    });
  }

  startSleep(reason) {
    if (this.sleeping) return;
    this.sleeping = true;
    const doSleep = () => {
      this.player.playSleep(() => {
        this.cameras.main.fadeOut(900, 20, 26, 40);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          DaySystem.advanceDay(this, { reason });
          this.cameras.main.fadeIn(1100, 20, 26, 40);
          this.time.delayedCall(600, () => {
            this.sleeping = false;
          });
        });
      });
    };
    if (this.player.sitting) {
      this.player.standUp();
      this.player.setDepth(0);
      this.addDepthSorted(this.player);
      this.time.delayedCall(120, doSleep);
    } else doSleep();
  }
  forceSleep(reason) {
    this.startSleep(reason);
  }

  applySeasonVisuals() {
    const season = SeasonSystem.current();
    generateSeasonTextures(this, season);
    this.groundImgs?.forEach(({ img, v }) => img.setTexture(`grass_${v}`));
    this.treeSprites?.forEach((spr) =>
      spr.setTexture(
        spr.getData("maple") ? "tree_maple" : `tree_${spr.getData("variant")}`,
      ),
    );
    this.houseSnow.setVisible(season.id === "winter");
    this.houseSpr.setVisible(season.id !== "winter");
    this.ambientEm?.destroy();
    this.ambientEm = null;
    const W = this.scale.width;
    if (season.ambient === "petal") {
      this.ambientEm = this.add
        .particles(0, 0, "pt_petal", {
          x: { min: 0, max: W },
          y: -16,
          lifespan: 8000,
          speedY: { min: 22, max: 44 },
          speedX: { min: -16, max: 26 },
          rotate: { start: 0, end: 300 },
          frequency: 900,
          alpha: { start: 0.85, end: 0 },
        })
        .setDepth(898)
        .setScrollFactor(0);
    } else if (season.ambient === "leaf") {
      this.ambientEm = this.add
        .particles(0, 0, "pt_leaf", {
          x: { min: 0, max: W },
          y: -16,
          lifespan: 7000,
          speedY: { min: 30, max: 60 },
          speedX: { min: -30, max: 20 },
          rotate: { start: 0, end: 360 },
          frequency: 650,
          alpha: { start: 0.9, end: 0 },
        })
        .setDepth(898)
        .setScrollFactor(0);
      this.add
        .particles(0, 0, "pt_leaf2", {
          x: { min: 0, max: W },
          y: -16,
          lifespan: 7500,
          speedY: { min: 26, max: 55 },
          speedX: { min: -24, max: 24 },
          rotate: { start: 0, end: 300 },
          frequency: 1100,
          alpha: { start: 0.85, end: 0 },
        })
        .setDepth(898)
        .setScrollFactor(0);
    } else if (season.ambient === "snow") {
      this.ambientEm = this.add
        .particles(0, 0, "pt_snow", {
          x: { min: 0, max: W },
          y: -16,
          lifespan: 9000,
          speedY: { min: 26, max: 46 },
          speedX: { min: -20, max: 20 },
          frequency: 700,
          alpha: { start: 0.8, end: 0.3 },
          scale: { start: 0.6, end: 0.9 },
        })
        .setDepth(898)
        .setScrollFactor(0);
    }
    LightSystem.refresh();
  }

  /* ---------- vòng lặp ---------- */
  update(time, dt) {
    this.player.update(this.keys);
    PetSystem.update(dt);
    this.npcs.forEach((n) => n.update(dt));
    TimeSystem.update(dt);
    FishingSystem.update(dt);
    LightSystem.update();

    const it =
      !GameState.uiOpen && !this.player.locked && !this.player.sitting
        ? this.nearestInteractable()
        : null;
    if (it && it !== this.lastIt) this.showPromptIcon(it);
    if (!it && this.promptIcon) {
      this.promptIcon.destroy();
      this.promptIcon = null;
      this.lastIt = null;
    }
    if (this.promptIcon && it) {
      const ix = it.dynamic ? it.dynamic.x : it.x,
        iy = it.dynamic ? it.dynamic.y : it.y;
      this.promptIcon.setPosition(ix, iy - 46 + Math.sin(time / 260) * 3);
    }
    for (const b of this.butterflies) {
      const t2 = b.getData("t") + dt * 0.001;
      b.setData("t", t2);
      b.setPosition(
        b.getData("baseX") + Math.sin(t2 * 0.7) * 60,
        b.getData("baseY") + Math.cos(t2 * 1.1) * 34,
      );
      b.setFlipX(Math.cos(t2 * 0.7) < 0);
    }
    if (this.ripples) {
      this.ripples.clear();
      const p = LAYOUT.pond,
        cx = tx2px(p.tx),
        cy = tx2px(p.ty);
      for (let i = 0; i < 3; i++) {
        const r = (time / 40 + i * 40) % 120;
        this.ripples.lineStyle(1.6, 0xffffff, Math.max(0, 0.36 - r / 340));
        this.ripples.strokeEllipse(
          cx - 30 + i * 40,
          cy - 10 + (i % 2) * 26,
          r * 1.6,
          r * 0.8,
        );
      }
    }
    for (const o of this.depthItems) if (o.active) o.setDepth(Math.round(o.y));
    if (this.player.sitting) this.player.setDepth(9999);
  }

  showPromptIcon(it) {
    this.promptIcon?.destroy();
    this.promptIcon = this.add
      .image(
        it.dynamic ? it.dynamic.x : it.x,
        (it.dynamic ? it.dynamic.y : it.y) - 46,
        "icon_e",
      )
      .setDepth(1200)
      .setScale(0.9);
    this.lastIt = it;
  }
}
