import { CONFIG, T } from "../config.js";
import { GameState } from "../state.js";
import { Player } from "../entities/Player.js";
import { TimeSystem } from "../systems/TimeSystem.js";
import { CookingSystem } from "../systems/CookingSystem.js";
import { DaySystem } from "../systems/DaySystem.js";
import { QuestSystem } from "../systems/QuestSystem.js";
import { SaveSystem } from "../systems/SaveSystem.js";
import { AchievementSystem } from "../systems/AchievementSystem.js";
import { InventorySystem } from "../systems/InventorySystem.js";
import { itemById, itemName } from "../data/items.js";
import { HUD } from "../ui/HUD.js";
import { Panels } from "../ui/Panels.js";
import { DialogueUI } from "../ui/DialogueUI.js";
import { onKeyDownOnce } from "../utils/input.js";
import { EVT, emit } from "../GameEvents.js";
import SFX from "../SoundFX.js";

// ROOM_H = 12 ô: khớp đúng với lưới gạch sàn (sàn bắt đầu ở y = 96, cao 10 ô)
// nên không còn dải gạch thừa/bị cắt ở mép dưới.
const ROOM_W = 14 * T,
  ROOM_H = 12 * T,
  WALL_H = 112;
const TIPS = [
  'Cuốn "Nhật ký vườn": Tưới cây trước 9 giờ sáng là tốt nhất.',
  'Cuốn "Bách khoa thú cưng": Mèo thích được vuốt ve sau bữa ăn.',
  'Cuốn "Câu cá cho người mới": Chờ kim vào giữa vùng xanh rồi hãy nhấn!',
  'Cuốn "Nấu ăn bốn mùa": Bánh bí ngô là món đắt giá nhất mùa thu.',
  'Cuốn "Ánh sáng & Khu vườn": Đặt đèn dọc lối đi, đêm sẽ lung linh lắm.',
];

export class HouseScene extends Phaser.Scene {
  constructor() {
    super("House");
  }
  init(data) {
    this.floor = data?.floor || 1;
    this.entry = data?.entry || "door";
  }

  create() {
    if (!GameState.fridge) GameState.fridge = {};
    this.depthItems = [];
    this.interactables = [];
    this.solids = this.physics.add.staticGroup();
    this.sittingObj = null;
    this.worldContainer = this.add.container(0, 0);
    // KHÔNG setBounds cho camera: phòng nhỏ hơn khung nhìn (sau khi zoom), Phaser sẽ
    // ép camera dính góc trên-trái nên phòng bị lệch và lộ vùng trống bên phải.
    this.physics.world.setBounds(0, 0, ROOM_W, ROOM_H);
    this.cameras.main.setBackgroundColor("#241c16");
    this.buildRoom();
    const spawn =
      this.entry === "stairs" ? { x: 560, y: 468 } : { x: 200, y: 492 };
    this.player = new Player(
      this,
      spawn.x,
      spawn.y,
      GameState.character.gender,
    );
    this.physics.add.collider(this.player, this.solids);
    this.hud = new HUD(this);
    this.panels = new Panels(this);
    this.setupInput();
    TimeSystem.init(this);
    SaveSystem.init(this);
    QuestSystem.init(this);
    AchievementSystem.init(this);
    this.fitCameraToRoom();
    this.cameras.main.fadeIn(500, 30, 25, 20);
    this.hud.toast(
      this.floor === 1 ? "Tầng 1 · Phòng khách & bếp" : "Tầng 2 · Phòng ngủ",
    );
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.hud?.destroy();
      this.panels?.destroy();
      DialogueUI.forceClose();
    });
  }

  // Zoom vừa khít cả căn phòng vào màn hình rồi canh giữa.
  fitCameraToRoom() {
    const cam = this.cameras.main;
    const zoom = Math.min(CONFIG.W / ROOM_W, CONFIG.H / ROOM_H) * 0.98;
    cam.setZoom(zoom);
    cam.centerOn(ROOM_W / 2, ROOM_H / 2);
    // zoom lẻ + roundPixels dễ sinh vạch hở giữa các ô gạch
    cam.roundPixels = false;
  }

  put(key, x, y, opts = {}) {
    const img = this.add.image(x, y, key);
    this.worldContainer.add(img);
    if (!opts.flat) this.addDepthSorted(img);
    else img.setDepth(2);
    if (opts.col !== false) {
      const w = opts.cw ?? img.width * 0.86,
        h = opts.ch ?? 18;
      const oy = opts.coy ?? img.displayHeight / 2 - 6;
      const b = this.add.rectangle(x, y + oy, w, h).setVisible(false);
      this.physics.add.existing(b, true);
      this.solids.add(b);
    }
    return img;
  }

  buildRoom() {
    const wallTex = this.floor === 1 ? "int_wall1" : "int_wall2";
    const floorTex = this.floor === 1 ? "int_floor1" : "int_floor2";
    for (let x = 0; x < ROOM_W; x += T)
      for (let y = 0; y < WALL_H; y += T)
        this.worldContainer.add(this.add.image(x + T / 2, y + T / 2, wallTex));
    for (let x = 0; x < ROOM_W; x += T)
      for (let y = WALL_H - 16; y < ROOM_H; y += T)
        this.worldContainer.add(this.add.image(x + T / 2, y + T / 2, floorTex));
    const mkStatic = (x, y, w, h) => {
      const b = this.add.rectangle(x, y, w, h).setVisible(false);
      this.physics.add.existing(b, true);
      this.solids.add(b);
    };
    mkStatic(ROOM_W / 2, WALL_H - 6, ROOM_W, 40);
    mkStatic(6, ROOM_H / 2, 14, ROOM_H);
    mkStatic(ROOM_W - 6, ROOM_H / 2, 14, ROOM_H);
    mkStatic(ROOM_W / 2, ROOM_H - 4, ROOM_W, 12);
    if (this.floor === 1) this.buildFloor1();
    else this.buildFloor2();
  }

  buildFloor1() {
    this.put("furn_window", 120, 52, { col: false });
    this.put("furn_window", 420, 52, { col: false });
    this.put("furn_fireplace", 85, 158);
    this.addInteractable({
      x: 85,
      y: 190,
      radius: 62,
      getPrompt: () => ({ text: "Sưởi ấm", icon: "icon_star" }),
      onInteract: () => {
        this.add
          .particles(85, 150, "pt_sparkle", {
            lifespan: 900,
            speedY: { min: -20, max: -40 },
            tint: [0xf2a154],
            quantity: 6,
            emitting: false,
          })
          .setDepth(700)
          .explode(6);
        this.hud.toast("Ánh lửa ấm áp lan toả khắp phòng...");
        SFX.purr();
      },
    });
    this.put("furn_bookshelf", 235, 158);
    this.addInteractable({
      x: 235,
      y: 190,
      radius: 58,
      getPrompt: () => ({ text: "Đọc sách", icon: "icon_star" }),
      onInteract: () =>
        this.hud.toast(TIPS[Math.floor(Math.random() * TIPS.length)]),
    });
    this.put("furn_counter_long", 490, 168);
    this.put("furn_stove", 420, 158, { col: false });
    this.addInteractable({
      x: 420,
      y: 178,
      radius: 55,
      getPrompt: () => ({ text: "Nấu ăn", icon: "icon_star" }),
      onInteract: () => CookingSystem.openPanel(this),
    });
    this.put("furn_sink", 495, 158, { col: false });
    this.put("furn_fridge", 630, 210);
    this.addInteractable({
      x: 630,
      y: 230,
      radius: 58,
      getPrompt: () => ({ text: "Mở tủ lạnh", icon: "icon_star" }),
      onInteract: () => this.openFridge(),
    });
    this.put("furn_rug", 200, 372, { flat: true });
    this.put("furn_sofa", 170, 262);
    this.addInteractable({
      x: 170,
      y: 290,
      radius: 58,
      getPrompt: () => ({ text: "Ngồi sofa", icon: "icon_star" }),
      onInteract: () => this.sitAt(170, 300),
    });
    this.put("furn_ctable", 170, 356);
    this.put("furn_armchair", 62, 366);
    this.addInteractable({
      x: 62,
      y: 388,
      radius: 48,
      getPrompt: () => ({ text: "Ngồi ghế", icon: "icon_star" }),
      onInteract: () => this.sitAt(62, 396),
    });
    this.put("furn_table", 500, 402);
    this.put("furn_chair", 452, 462);
    this.put("furn_chair", 548, 462);
    this.addInteractable({
      x: 500,
      y: 452,
      radius: 56,
      getPrompt: () => ({ text: "Ngồi vào bàn", icon: "icon_star" }),
      onInteract: () => this.sitAt(452, 470),
    });
    this.put("furn_plant", 38, 508);
    this.put("furn_lamp", 330, 150, { cw: 20 });
    this.put("furn_stairs", 606, 494);
    this.addInteractable({
      x: 606,
      y: 520,
      radius: 60,
      getPrompt: () => ({ text: "Lên tầng 2", icon: "icon_star" }),
      onInteract: () => {
        SFX.blip();
        this.scene.restart({ floor: 2, entry: "stairs" });
      },
    });
    this.put("int_door", 200, 522);
    this.addInteractable({
      x: 200,
      y: 548,
      radius: 58,
      getPrompt: () => ({ text: "Ra vườn", icon: "icon_star" }),
      onInteract: () => {
        SFX.blip();
        this.scene.start("Game", { fromHouse: true });
      },
    });
  }

  buildFloor2() {
    this.put("furn_window", 150, 52, { col: false });
    this.put("furn_window", 400, 52, { col: false });
    this.put("furn_bed", 170, 300);
    this.addInteractable({
      x: 170,
      y: 360,
      radius: 78,
      getPrompt: () => ({ text: "Ngủ (sang ngày mới)", icon: "icon_star" }),
      onInteract: () => this.sleepInBed(),
    });
    this.put("furn_rug", 170, 452, { flat: true });
    this.put("furn_lamp", 56, 210, { cw: 20 });
    this.put("furn_dresser", 400, 168);
    this.put("furn_wardrobe", 560, 172);
    this.put("furn_armchair", 470, 390);
    this.addInteractable({
      x: 470,
      y: 412,
      radius: 48,
      getPrompt: () => ({ text: "Ngồi ghế", icon: "icon_star" }),
      onInteract: () => this.sitAt(470, 420),
    });
    this.put("furn_plant", 620, 420);
    this.put("furn_stairs", 606, 494);
    this.addInteractable({
      x: 606,
      y: 520,
      radius: 60,
      getPrompt: () => ({ text: "Xuống tầng 1", icon: "icon_star" }),
      onInteract: () => {
        SFX.blip();
        this.scene.restart({ floor: 1, entry: "stairs" });
      },
    });
  }

  sitAt(x, y) {
    if (this.player.sitting) return;
    this.player.setDepth(9999);
    this.player.sit(x, y);
    this.sittingObj = true;
    this.hud.toast("Nhấn E để đứng dậy");
  }

  standUp() {
    if (!this.player.sitting) return;
    this.player.standUp();
    this.player.setDepth(Math.round(this.player.y)); // update() sẽ tự sắp xếp lại độ sâu
    this.sittingObj = null;
  }

  sleepInBed() {
    this.player.locked = true;
    this.player.playSleep(() => {
      this.cameras.main.fadeOut(900, 20, 24, 38);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        DaySystem.advanceDay(this, { quiet: true });
        this.scene.start("Game", { fromHouse: true, morning: true });
      });
    });
  }

  forceSleep() {
    this.cameras.main.fadeOut(700, 20, 24, 38);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      DaySystem.advanceDay(this, { quiet: true });
      this.scene.start("Game", { fromHouse: true, morning: true });
    });
  }

  openFridge() {
    const allowed = (id) => {
      const m = itemById(id);
      return (
        id.startsWith("crop_") ||
        id.startsWith("dish_") ||
        ["food", "fish", "misc"].includes(m?.category)
      );
    };
    const close = () => {
      this.current2?.remove();
      this.current2 = null;
      GameState.uiOpen = false;
    };
    const draw = () => {
      this.current2?.remove();
      const render = () => {
        const invRows =
          InventorySystem.entries()
            .filter((e) => allowed(e.id))
            .map(
              (e) => `
          <div class="shop-row"><img src="${this.icon2(e.id)}">
            <div class="si"><b>${itemName(e.id)}</b><span>Trong túi: ${e.qty}</span></div>
            <button class="btn btn-soft fr-in" data-id="${e.id}">Cất vào tủ</button>
          </div>`,
            )
            .join("") ||
          '<p style="color:#8a7362;font-weight:700">Túi đồ không có đồ ăn.</p>';
        const frRows =
          Object.entries(GameState.fridge)
            .filter(([, q]) => q > 0)
            .map(
              ([id, q]) => `
          <div class="shop-row"><img src="${this.icon2(id)}">
            <div class="si"><b>${itemName(id)}</b><span>Trong tủ: ${q}</span></div>
            <button class="btn btn-soft fr-out" data-id="${id}">Lấy ra</button>
          </div>`,
            )
            .join("") ||
          '<p style="color:#8a7362;font-weight:700">Tủ lạnh trống.</p>';
        return `<button class="panel-close">✕</button><h3>Tủ lạnh</h3>
          <b style="font-size:12px;color:#7ba05b">TÚI ĐỒ</b>
          <div style="max-height:150px;overflow-y:auto;margin:6px 0 12px">${invRows}</div>
          <b style="font-size:12px;color:#5db6d4">TRONG TỦ</b>
          <div style="max-height:150px;overflow-y:auto;margin:6px 0">${frRows}</div>`;
      };
      const root = document.getElementById("ui-root");
      const wrap = document.createElement("div");
      wrap.className = "overlay anim-fade";
      wrap.innerHTML = `<div class="panel anim-pop">${render()}</div>`;
      wrap.querySelector(".panel-close").onclick = close;
      wrap.addEventListener("click", (e) => {
        if (e.target === wrap) close();
      });
      wrap.querySelectorAll(".fr-in").forEach(
        (b) =>
          (b.onclick = () => {
            const id = b.dataset.id;
            if (InventorySystem.remove(id)) {
              GameState.fridge[id] = (GameState.fridge[id] || 0) + 1;
              SFX.pop();
              emit(EVT.SAVE);
              draw();
            }
          }),
      );
      wrap.querySelectorAll(".fr-out").forEach(
        (b) =>
          (b.onclick = () => {
            const id = b.dataset.id;
            if (GameState.fridge[id] > 0) {
              GameState.fridge[id]--;
              InventorySystem.add(id);
              SFX.pop();
              emit(EVT.SAVE);
              draw();
            }
          }),
      );
      root.appendChild(wrap);
      this.current2 = wrap;
      GameState.uiOpen = true;
    };
    draw();
  }
  icon2(id) {
    let key = `icon_${id}`;
    if (id.startsWith("crop_")) key = `icon_crop_${id.slice(5)}`;
    if (id.startsWith("seed_")) key = `icon_seed_${id.slice(5)}`;
    const tex = this.textures.get(key) || this.textures.get("icon_star");
    const src = tex?.getSourceImage?.();
    return src?.toDataURL ? src.toDataURL() : "";
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
      if (GameState.uiOpen) return;
      // Kiểm tra "đang ngồi" TRƯỚC "locked": sit() đặt locked = true nên
      // nếu kiểm tra locked trước thì không bao giờ đứng dậy được.
      if (this.player.sitting) {
        this.standUp();
        return;
      }
      if (this.player.locked) return;
      this.tryInteract();
    });
    onKeyDownOnce(k, "I", () => this.panels.toggleInventory());
    onKeyDownOnce(k, "ESC", () => {
      if (this.panels.esc()) return;
      this.panels.showPause();
    });
  }

  addDepthSorted(o) {
    this.depthItems.push(o);
  }
  addInteractable(it) {
    this.interactables.push(it);
  }
  nearestInteractable() {
    let best = null,
      bd = CONFIG.INTERACT_R;
    for (const it of this.interactables) {
      const d = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        it.x,
        it.y,
      );
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

  update(time, dt) {
    this.player.update(this.keys);
    TimeSystem.update(dt);
    const it =
      !GameState.uiOpen && !this.player.locked && !this.player.sitting
        ? this.nearestInteractable()
        : null;
    if (it && it !== this.lastIt) {
      this.promptIcon?.destroy();
      this.promptIcon = this.add
        .image(it.x, it.y - 46, "icon_e")
        .setDepth(1200)
        .setScale(0.9);
      this.lastIt = it;
    }
    if (!it && this.promptIcon) {
      this.promptIcon.destroy();
      this.promptIcon = null;
      this.lastIt = null;
    }
    if (this.promptIcon && it)
      this.promptIcon.setPosition(it.x, it.y - 46 + Math.sin(time / 260) * 3);
    for (const o of this.depthItems) if (o.active) o.setDepth(Math.round(o.y));
    if (this.player.sitting) this.player.setDepth(9999);
  }
}
