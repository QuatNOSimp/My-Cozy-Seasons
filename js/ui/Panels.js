import { GameState, addGold, addXP } from "../state.js";
import { InventorySystem } from "../systems/InventorySystem.js";
import { itemById, itemName, CATEGORIES, CAT_NAME } from "../data/items.js";
import { CROPS } from "../data/crops.js";
import { SEASONS } from "../data/seasons.js";
import { SPECIES_NAME } from "../data/pets.js";
import { ACHIEVEMENTS } from "../data/achievements.js";
import { AchievementSystem } from "../systems/AchievementSystem.js";
import { EVT, GameEvents } from "../GameEvents.js";
import { SaveSystem } from "../systems/SaveSystem.js";
import SFX from "../SoundFX.js";

export class Panels {
  constructor(scene) {
    this.scene = scene;
    this.current = null;
    this.invCat = "all";
    this._binds = [];
    this.on2(EVT.QUEST_DONE, () => {
      if (this.current?.dataset.kind === "quest") this.renderQuestBody();
    });
    this.on2(EVT.INV_CHANGE, () => {
      if (this.current?.dataset.kind === "inv") this.renderInvBody();
    });
    this.on2("inv:selected", () => {
      if (this.current?.dataset.kind === "inv") this.renderInvBody();
    });
  }
  on2(e, cb) {
    const fn = (...a) => cb(...a);
    GameEvents.on(e, fn, this);
    this._binds.push([e, fn]);
  }

  open(html, kind) {
    this.close();

    const root = document.getElementById("ui-root");

    const wrap = document.createElement("div");
    wrap.className = "overlay anim-fade";
    wrap.dataset.kind = kind;
    wrap.innerHTML = `<div class="panel anim-pop">${html}</div>`;

    // Đảm bảo overlay nhận chuột
    wrap.style.pointerEvents = "auto";

    const panel = wrap.querySelector(".panel");
    if (panel) {
      panel.style.pointerEvents = "auto";
    }

    wrap.addEventListener("click", (e) => {
      if (e.target === wrap) this.close();
    });

    wrap.querySelector(".panel-close")?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.close();
    });

    root.appendChild(wrap);

    this.current = wrap;
    GameState.uiOpen = true;
    SFX.blip();

    return wrap;
  }

  close() {
    this.current?.remove();
    this.current = null;
    GameState.uiOpen = false;
  }
  esc() {
    if (this.current) {
      this.close();
      return true;
    }
    return false;
  }

  icon(id) {
    let key = `icon_${id}`;
    if (id.startsWith("crop_")) key = `icon_crop_${id.slice(5)}`;
    if (id.startsWith("seed_")) key = `icon_seed_${id.slice(5)}`;
    const tex =
      this.scene.textures.get(key) || this.scene.textures.get("icon_star");
    const src = tex?.getSourceImage?.();
    return src?.toDataURL ? src.toDataURL() : "";
  }

  toggleQuest() {
    if (this.current?.dataset.kind === "quest") return this.close();
    this.open(
      `<button class="panel-close">✕</button><h3>Nhiệm vụ hôm nay</h3><div id="quest-body"></div>`,
      "quest",
    );
    this.renderQuestBody();
  }
  renderQuestBody() {
    const body = this.current?.querySelector("#quest-body");
    if (!body) return;
    const iconFor = (cat) =>
      cat === "pet"
        ? '<svg viewBox="0 0 24 24" fill="#fff"><circle cx="6" cy="9" r="2.4"/><circle cx="10.5" cy="5.5" r="2.4"/><circle cx="15.5" cy="5.5" r="2.4"/><circle cx="19" cy="9" r="2.4"/><path d="M12.5 10c3 0 6 2.6 6 5.4 0 1.8-1.4 2.6-3 2.6-1.2 0-2-.6-3-.6s-1.8.6-3 .6c-1.6 0-3-.8-3-2.6 0-2.8 3-5.4 6-5.4z"/></svg>'
        : cat === "garden"
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M12 22V10"/><path d="M12 12c0-4-3-6-7-6 0 4 3 6 7 6zm0 0c0-4 3-6 7-6 0 4-3 6-7 6z"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/></svg>';
    body.innerHTML =
      GameState.quests
        .map(
          (q) => `
      <div class="quest-item ${q.done ? "done" : ""}">
        <div class="quest-ic">${iconFor(q.cat)}</div>
        <div class="quest-tx">
          <b>${q.done ? "✓ " : ""}${q.text}</b>
          <span>${q.progress}/${q.target}</span>
          <div class="quest-prog"><i style="width:${(q.progress / q.target) * 100}%"></i></div>
        </div>
        <div class="quest-reward">+${q.gold} vàng<br>+${q.xp} XP</div>
      </div>`,
        )
        .join("") ||
      '<p style="color:#8a7362;font-weight:700">Hôm nay chưa có nhiệm vụ.</p>';
  }

  toggleInventory() {
    if (this.current?.dataset.kind === "inv") return this.close();
    this.open(
      `
      <button class="panel-close">✕</button>
      <h3>Túi đồ</h3>
      <div class="tabs" id="inv-tabs"></div>
      <div class="inv-grid" id="inv-grid"></div>
      <div id="inv-action" style="margin-top:10px;text-align:center"></div>
      <p style="font-size:11px;color:#8a7362;font-weight:700;margin-top:8px">Nhấp để cầm đồ · Hạt giống: đến ô đất nhấn E · Decor: nhấp rồi đặt trong vườn</p>`,
      "inv",
    );
    const tabs = this.current.querySelector("#inv-tabs");
    CATEGORIES.forEach((c) => {
      const b = document.createElement("button");
      b.className = "tab" + (c === this.invCat ? " active" : "");
      b.textContent = CAT_NAME[c];
      b.onclick = () => {
        this.invCat = c;
        SFX.blip();
        tabs
          .querySelectorAll(".tab")
          .forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        this.renderInvBody();
      };
      tabs.appendChild(b);
    });
    this.renderInvBody();
  }
  renderInvBody() {
    const grid = this.current?.querySelector("#inv-grid");
    if (!grid) return;
    let entries = InventorySystem.entries();
    if (this.invCat !== "all")
      entries = entries.filter(
        (e) =>
          e.meta?.category === this.invCat ||
          (this.invCat === "seeds" && e.id.startsWith("seed_")) ||
          (this.invCat === "crops" && e.id.startsWith("crop_")) ||
          (this.invCat === "food" && e.meta?.category === "fish"),
      );
    if (!entries.length) {
      grid.innerHTML =
        '<div class="inv-empty">Trống trơn... ra vườn thu hoạch thôi!</div>';
      this.renderInvAction();
      return;
    }
    grid.innerHTML = "";
    entries.forEach(({ id, qty }) => {
      const slot = document.createElement("div");
      slot.className = "inv-slot" + (GameState.selected === id ? " sel" : "");
      slot.innerHTML = `<img src="${this.icon(id)}"><span class="q">${qty}</span><span class="n">${itemName(id)}</span>`;
      slot.onclick = () => {
        const meta = itemById(id);
        if (meta?.category === "decor") {
          this.close();
          this.scene.enterPlacement?.(id);
          return;
        }
        InventorySystem.select(id);
        SFX.pop();
        this.renderInvBody();
      };
      grid.appendChild(slot);
    });
    this.renderInvAction();
  }
  renderInvAction() {
    const box = this.current?.querySelector("#inv-action");
    if (!box) return;
    box.innerHTML = "";
    const sel = GameState.selected;
    if (sel && itemById(sel)?.use === "dish") {
      const b = document.createElement("button");
      b.className = "btn btn-warm";
      b.textContent = `Thưởng thức ${itemName(sel)}`;
      b.onclick = () => {
        InventorySystem.remove(sel);
        addXP(6);
        SFX.harvest();
        this.scene.hud.toast("Ngon tuyệt! +6 XP");
      };
      box.appendChild(b);
    }
  }

  showPetPanel(pet) {
    const s = pet.stats();
    const cfg = pet.cfg;
    const bar = (label, val, cls) => `
      <div class="statbar"><label><span>${label}</span><span>${Math.round(val)}%</span></label>
      <div class="track"><div class="fill ${cls}" style="width:${val}%"></div></div></div>`;
    this.open(
      `
      <button class="panel-close">✕</button>
      <h3>${cfg.name} · ${SPECIES_NAME[cfg.species]}</h3>
      ${bar("Đói bụng", 100 - s.hunger, "hunger")}
      ${bar("Vui vẻ", s.happiness, "happy")}
      ${bar("Sạch sẽ", s.cleanliness, "clean")}
      ${bar("Năng lượng", s.energy, "energy")}
      <p style="font-size:12px;color:#8a7362;font-weight:700;margin-top:8px">Thích ăn: ${cfg.foodName}. Vuốt ve (E) để bé vui hơn!</p>`,
      "pet",
    );
  }

  showAchievements() {
    if (this.current?.dataset.kind === "ach") return this.close();
    AchievementSystem.ensure();
    const rows = ACHIEVEMENTS.map((a) => {
      const done = AchievementSystem.isUnlocked(a.id);
      const prog = Math.min(a.need, AchievementSystem.count(a.id));
      return `
        <div class="quest-item ${done ? "done" : ""}">
          <div class="quest-ic" style="background:${done ? "#f5c542" : "#d9c9a8"}">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M8 21h8m-4-4v4M7 4h10v4a5 5 0 0 1-10 0V4z"/><path d="M7 6H4a3 3 0 0 0 3 4m10-4h3a3 3 0 0 1-3 4"/></svg>
          </div>
          <div class="quest-tx">
            <b>${done ? "✓ " : ""}${a.name}</b>
            <span>${a.desc} · ${prog}/${a.need}</span>
            <div class="quest-prog"><i style="width:${(prog / a.need) * 100}%"></i></div>
          </div>
          <div class="quest-reward">+${a.gold} vàng${a.xp ? `<br>+${a.xp} XP` : ""}</div>
        </div>`;
    }).join("");
    const got = ACHIEVEMENTS.filter((a) =>
      AchievementSystem.isUnlocked(a.id),
    ).length;
    this.open(
      `
      <button class="panel-close">✕</button>
      <h3>Thành tựu · ${got}/${ACHIEVEMENTS.length}</h3>
      <div style="max-height:400px;overflow-y:auto;padding-right:6px">${rows}</div>`,
      "ach",
    );
  }

  showShop() {
    const season = SEASONS[GameState.seasonIndex];
    const seeds = Object.entries(CROPS)
      .map(([id, c]) => ({ id, c }))
      .filter(({ c }) => c.seasons.includes(season.id) || c.rarity === "rare");
    const goods = [
      ...seeds.map(({ id, c }) => ({
        id: `seed_${id}`,
        name: c.name + " (hạt giống)",
        price: c.seedPrice,
        desc: `Mùa: ${c.seasons.map((s2) => SEASONS.find((x) => x.id === s2).vi).join(", ")} · ${c.growDays} ngày`,
        icon: `seed_${id}`,
      })),
      {
        id: "food_rabbit",
        name: "Cà rốt (thỏ)",
        price: 12,
        desc: "Thức ăn cho thỏ",
        icon: "food_rabbit",
      },
      {
        id: "food_dog",
        name: "Xúc xích (chó)",
        price: 15,
        desc: "Thức ăn cho chó",
        icon: "food_dog",
      },
      {
        id: "food_cat",
        name: "Cá khô (mèo)",
        price: 14,
        desc: "Thức ăn cho mèo",
        icon: "food_cat",
      },
      {
        id: "flour",
        name: "Bột mì",
        price: 18,
        desc: "Nguyên liệu nấu ăn",
        icon: "flour",
      },
      {
        id: "milk",
        name: "Sữa",
        price: 16,
        desc: "Nguyên liệu nấu ăn",
        icon: "milk",
      },
      {
        id: "egg",
        name: "Trứng",
        price: 14,
        desc: "Nguyên liệu nấu ăn",
        icon: "egg",
      },
      {
        id: "flower_pot",
        name: "Chậu hoa",
        price: 40,
        desc: "Decor khu vườn",
        icon: "flower_pot",
      },
      {
        id: "lantern",
        name: "Đèn vườn",
        price: 60,
        desc: "Toả sáng ban đêm",
        icon: "lantern",
      },
      {
        id: "gnome",
        name: "Tượng lùn",
        price: 80,
        desc: "Decor vui nhộn",
        icon: "gnome",
      },
      {
        id: "scarecrow",
        name: "Bù nhìn",
        price: 90,
        desc: "Canh giữ khu vườn",
        icon: "scarecrow",
      },
      {
        id: "bench",
        name: "Ghế gỗ",
        price: 100,
        desc: "Ngồi nghỉ ngắm vườn",
        icon: "bench",
      },
      {
        id: "lamp_post",
        name: "Cột đèn",
        price: 120,
        desc: "Thắp sáng lối đi",
        icon: "lamp_post",
      },
    ];
    this.open(
      `
      <button class="panel-close">✕</button>
      <h3>Cửa hàng · Vàng: <span id="shop-gold" style="color:#b98a2c">${GameState.gold}</span></h3>
      <div style="max-height:360px;overflow-y:auto;padding-right:6px">
        ${goods
          .map(
            (g2, i) => `
          <div class="shop-row">
            <img src="${this.icon(g2.icon)}">
            <div class="si"><b>${g2.name}</b><span>${g2.desc}</span></div>
            <div class="price">${g2.price}<img src="${window.ICONS?.coin || ""}"></div>
            <button class="btn btn-warm buy-btn" data-i="${i}">Mua</button>
          </div>`,
          )
          .join("")}
      </div>`,
      "shop",
    );
    const panel = this.current.querySelector(".panel");
    const sellBtn = document.createElement("button");
    sellBtn.className = "btn btn-soft";
    sellBtn.style.cssText = "margin-top:8px;width:100%";
    sellBtn.textContent = "Bán nông sản, cá, món ăn & vật liệu thừa";
    sellBtn.onclick = () => {
      let total = 0;
      for (const { id, qty } of InventorySystem.entries()) {
        const m = itemById(id);
        const price = id.startsWith("crop_")
          ? CROPS[id.slice(5)]?.sellPrice
          : m?.sell;
        const ok =
          id.startsWith("crop_") ||
          id.startsWith("dish_") ||
          ["materials", "fish"].includes(m?.category);
        if (price && ok) {
          total += price * qty;
          InventorySystem.remove(id, qty);
        }
      }
      if (total > 0) {
        addGold(total);
        this.scene.hud.toast(`Đã bán, thu về ${total} vàng!`, "reward");
        SFX.harvest();
        this.current.querySelector("#shop-gold").textContent = GameState.gold;
      } else this.scene.hud.toast("Không có gì để bán.");
    };
    panel.appendChild(sellBtn);
    this.current.querySelectorAll(".buy-btn").forEach((b) => {
      b.onclick = () => {
        const g2 = goods[+b.dataset.i];
        if (GameState.gold < g2.price) {
          this.scene.hud.toast("Không đủ vàng...");
          SFX.error();
          return;
        }
        addGold(-g2.price);
        InventorySystem.add(g2.id);
        SFX.harvest();
        this.scene.hud.toast(`Đã mua ${g2.name}!`);
        this.current.querySelector("#shop-gold").textContent = GameState.gold;
      };
    });
  }

  showPause() {
    if (this.current) return this.close();
    this.open(
      `
      <button class="panel-close">✕</button>
      <h3>Tạm dừng</h3>
      <div class="menu-list">
        <button class="btn btn-primary" id="pm-resume">Tiếp tục chơi</button>
        <button class="btn btn-warm" id="pm-sleep">Ngủ (sang ngày mới)</button>
        <div class="toggle-row"><span>Âm thanh</span><div class="switch ${GameState.settings.sound ? "on" : ""}" id="pm-sound"><i></i></div></div>
        <button class="btn btn-soft" id="pm-save">Lưu game ngay</button>
        <button class="btn btn-soft" id="pm-menu">Về menu chính</button>
      </div>`,
      "pause",
    );
    this.current.querySelector("#pm-resume").onclick = () => this.close();
    this.current.querySelector("#pm-sleep").onclick = () => {
      const sc = this.scene;
      this.close();
      if (sc.scene.key === "House") sc.forceSleep();
      else sc.startSleep();
    };
    this.current.querySelector("#pm-save").onclick = () => {
      SaveSystem.save();
      this.scene.hud.toast("Đã lưu tiến trình!");
    };
    this.current.querySelector("#pm-menu").onclick = () => {
      SaveSystem.save();
      this.close();
      document.getElementById("ui-root").innerHTML = "";
      this.scene.scene.start("Menu");
    };
    this.current.querySelector("#pm-sound").onclick = (e) => {
      GameState.settings.sound = !GameState.settings.sound;
      e.currentTarget.classList.toggle("on", GameState.settings.sound);
      import("../SoundFX.js").then((m) => {
        m.default.enabled = GameState.settings.sound;
      });
    };
  }

  destroy() {
    this._binds.forEach(([e, fn]) => GameEvents.off(e, fn, this));
    this._binds = [];
    this.current?.remove();
    this.current = null;
  }
}
