import { CONFIG } from "../config.js";
import { GameState } from "../state.js";
import { EVT, GameEvents } from "../GameEvents.js";

export const SaveSystem = {
  dirty: false,
  timer: null,
  _unloadBound: false,

  init(scene) {
    GameEvents.off(EVT.SAVE, this.markDirty, this);
    GameEvents.on(EVT.SAVE, this.markDirty, this);
    scene.time.addEvent({
      delay: 45000,
      loop: true,
      callback: () => {
        if (this.dirty) this.save();
      },
    });
    if (!this._unloadBound) {
      this._unloadBound = true;
      window.addEventListener("beforeunload", () => {
        if (GameState.started) this.save();
      });
    }
  },

  markDirty() {
    this.dirty = true;
    if (this.timer) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      if (this.dirty) this.save();
    }, 1200);
  },

  serialize() {
    const s = GameState;
    return {
      version: CONFIG.SAVE_VERSION,
      ts: Date.now(),
      character: s.character,
      gold: s.gold,
      xp: s.xp,
      level: s.level,
      day: s.day,
      seasonIndex: s.seasonIndex,
      year: s.year,
      timeMinutes: s.timeMinutes,
      weather: s.weather,
      inventory: s.inventory,
      plots: s.plots,
      decor: s.decor,
      pets: s.pets,
      quests: s.quests,
      questDayKey: s.questDayKey,
      mailDay: s.mailDay,
      fridge: s.fridge || {},
      gifts: s.gifts || {},
      achievements: s.achievements || { counters: {}, unlocked: {} },
      unlocked: s.unlocked,
      settings: s.settings,
    };
  },

  save(silent = false) {
    if (!GameState.started) return;
    try {
      localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(this.serialize()));
      this.dirty = false;
      if (!silent) window.dispatchEvent(new CustomEvent("mcs-saved"));
    } catch (e) {
      console.warn("Save lỗi:", e);
    }
  },

  hasValidSave() {
    try {
      const raw = localStorage.getItem(CONFIG.SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      return data && data.version === CONFIG.SAVE_VERSION && data.character;
    } catch {
      return false;
    }
  },

  load() {
    try {
      const raw = localStorage.getItem(CONFIG.SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data || data.version !== CONFIG.SAVE_VERSION) {
        console.warn("Save không tương thích.");
        return false;
      }
      Object.assign(GameState, {
        started: true,
        character: data.character,
        gold: data.gold ?? 300,
        xp: data.xp ?? 0,
        level: data.level ?? 1,
        day: data.day ?? 1,
        seasonIndex: data.seasonIndex ?? 0,
        year: data.year ?? 1,
        timeMinutes: data.timeMinutes ?? 390,
        weather: data.weather ?? "sunny",
        inventory: data.inventory ?? {},
        plots: data.plots ?? [],
        decor: data.decor ?? [],
        pets: data.pets ?? {},
        quests: data.quests ?? [],
        questDayKey: data.questDayKey ?? "",
        mailDay: data.mailDay ?? 0,
        fridge: data.fridge ?? {},
        gifts: data.gifts ?? {},
        achievements: data.achievements || { counters: {}, unlocked: {} },
        unlocked: data.unlocked ?? {
          greenhouse: false,
          fishing: false,
          cooking: false,
          house: false,
        },
        settings: data.settings ?? { sound: true },
      });
      return true;
    } catch (e) {
      console.warn("Load lỗi:", e);
      return false;
    }
  },

  wipe() {
    localStorage.removeItem(CONFIG.SAVE_KEY);
  },
};
