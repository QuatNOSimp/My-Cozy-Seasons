import { GameState, xpForLevel } from "../state.js";
import { SeasonSystem } from "../systems/SeasonSystem.js";
import { TimeSystem } from "../systems/TimeSystem.js";
import { EVT, GameEvents } from "../GameEvents.js";

export class HUD {
  constructor(scene) {
    this.scene = scene;
    this._binds = [];
    this.build();
    this.refresh();
    this.bindEvents();
  }

  on2(e, cb) {
    const fn = (...a) => cb(...a);
    GameEvents.on(e, fn, this);
    this._binds.push([e, fn]);
  }

  build() {
    const root = document.getElementById("ui-root");
    this.el = document.createElement("div");
    this.el.id = "hud";
    this.el.innerHTML = `
      <div id="hud-top-left">
        <div class="chip hud-season"><span id="hud-date"></span></div>
        <div class="chip hud-clock"><img src="${window.ICONS?.star || ""}"><span id="hud-clock"></span></div>
        <div class="chip" id="hud-weather" style="font-size:12.5px"></div>
      </div>
      <div id="hud-top-right">
        <div class="chip hud-gold"><img src="${window.ICONS?.coin || ""}"><span id="hud-gold"></span></div>
        <div class="chip hud-level"><span id="hud-level"></span><div class="xpbar"><i id="hud-xp"></i></div></div>
      </div>
      <div id="hud-bottom-right">
        <button class="hud-btn" id="hb-quest">${this.svgScroll()}<span>Nhiệm vụ</span></button>
        <button class="hud-btn" id="hb-inv">${this.svgBag()}<span>Túi đồ</span></button>
        <button class="hud-btn" id="hb-ach">${this.svgTrophy()}<span>Thành tựu</span></button>
        <button class="hud-btn" id="hb-menu">${this.svgGear()}<span>Menu</span></button>
      </div>
      <div id="hud-toolbar"><div class="toolbar-slot" id="tb-slot"><div class="toolbar-hint" id="tb-hint" style="display:none"></div></div></div>
      <div id="toast-zone"></div>
      <div id="banner"><h2 id="banner-title"></h2><p id="banner-sub"></p></div>`;
    root.appendChild(this.el);
    const bind = (selector, fn) => {
      const el = this.el.querySelector(selector);

      if (!el) {
        console.warn("[HUD] Không tìm thấy phần tử:", selector);
        return;
      }

      el.style.pointerEvents = "auto";
      el.style.cursor = "pointer";

      el.addEventListener("click", (e) => {
        e.stopPropagation();

        if (!this.scene.panels) {
          console.warn("[HUD] Panels chưa sẵn sàng:", selector);
          return;
        }

        fn();
      });
    };
    bind("#hb-quest", () => this.scene.panels.toggleQuest());
    bind("#hb-inv", () => this.scene.panels.toggleInventory());
    bind("#hb-ach", () => this.scene.panels.showAchievements());
    bind("#hb-menu", () => this.scene.panels.showPause());
    bind("#tb-slot", () => this.scene.panels.toggleInventory());
  }

  svgScroll() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="#5c4a3d" stroke-width="2"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>';
  }
  svgBag() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="#5c4a3d" stroke-width="2"><path d="M6 8h12l1 12H5L6 8z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>';
  }
  svgGear() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="#5c4a3d" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9l2.1 2.1m10 10l2.1 2.1m0-14.2l-2.1 2.1m-10 10l-2.1 2.1"/></svg>';
  }
  svgTrophy() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="#5c4a3d" stroke-width="2"><path d="M8 21h8m-4-4v4M7 4h10v4a5 5 0 0 1-10 0V4z"/><path d="M7 6H4a3 3 0 0 0 3 4m10-4h3a3 3 0 0 1-3 4"/></svg>';
  }

  bindEvents() {
    this.on2(EVT.GOLD, () => this.refresh());
    this.on2(EVT.XP, () => this.refresh());
    this.on2(EVT.LEVEL_UP, (lv) => {
      this.refresh();
      this.banner(`Lên cấp ${lv}!`, "Khu vườn đang nở rộ cùng bạn");
    });
    this.on2(EVT.TIME_TICK, () => this.refreshClock());
    this.on2(EVT.WEATHER_CHANGED, () => this.refresh());
    this.on2("inv:selected", () => this.refreshToolbar());
    this.on2(EVT.INV_CHANGE, () => this.refreshToolbar());
  }

  refresh() {
    if (!this.el.isConnected) return;
    const s = SeasonSystem.current();
    this.el.querySelector("#hud-date").innerHTML =
      `Mùa <b>${s.vi}</b> · ${SeasonSystem.yearDayText()}`;
    this.el.querySelector("#hud-gold").textContent = GameState.gold;
    this.el.querySelector("#hud-level").textContent = `Cấp ${GameState.level}`;
    this.el.querySelector("#hud-xp").style.width =
      `${Math.min(100, (GameState.xp / xpForLevel(GameState.level)) * 100)}%`;
    this.el.querySelector("#hud-weather").textContent =
      GameState.weather === "rainy"
        ? s.id === "winter"
          ? "Tuyết rơi"
          : "Trời mưa"
        : "Nắng đẹp";
    this.refreshClock();
    this.refreshToolbar();
  }
  refreshClock() {
    if (!this.el.isConnected) return;
    this.el.querySelector("#hud-clock").textContent =
      `${TimeSystem.clockText()} · ${TimeSystem.phaseVi()}`;
  }
  refreshToolbar() {
    if (!this.el.isConnected) return;
    const slot = this.el.querySelector("#tb-slot");
    const hint = this.el.querySelector("#tb-hint");
    const sel = GameState.selected;
    slot.querySelectorAll("img,.qty").forEach((n) => n.remove());
    if (!sel) {
      hint.style.display = "block";
      hint.textContent = "Tay không (I để chọn đồ)";
      return;
    }
    hint.style.display = "none";
    const img = document.createElement("img");
    img.src = this.iconURL(sel);
    slot.appendChild(img);
    const q = document.createElement("span");
    q.className = "qty";
    q.textContent = GameState.inventory[sel] || 0;
    slot.appendChild(q);
  }
  iconURL(id) {
    let key = `icon_${id}`;
    if (id.startsWith("crop_")) key = `icon_crop_${id.slice(5)}`;
    if (id.startsWith("seed_")) key = `icon_seed_${id.slice(5)}`;
    const tex =
      this.scene.textures.get(key) || this.scene.textures.get("icon_star");
    const src = tex?.getSourceImage?.();
    return src?.toDataURL ? src.toDataURL() : "";
  }

  toast(msg, cls = "") {
    if (!this.el.isConnected) return;
    const zone = this.el.querySelector("#toast-zone");
    const t = document.createElement("div");
    t.className = `toast ${cls}`;
    t.textContent = msg;
    zone.appendChild(t);
    this.scene.time.delayedCall(2600, () => {
      t.classList.add("out");
      this.scene.time.delayedCall(450, () => t.remove());
    });
    while (zone.children.length > 3) zone.firstChild.remove();
  }

  banner(title, sub = "") {
    if (!this.el.isConnected) return;
    const b = this.el.querySelector("#banner");
    this.el.querySelector("#banner-title").textContent = title;
    this.el.querySelector("#banner-sub").textContent = sub;
    b.classList.remove("show");
    void b.offsetWidth;
    b.classList.add("show");
  }

  hide() {
    this.el.style.display = "none";
  }
  show() {
    this.el.style.display = "";
  }

  destroy() {
    this._binds.forEach(([e, fn]) => GameEvents.off(e, fn, this));
    this._binds = [];
    this.el?.remove();
  }
}
