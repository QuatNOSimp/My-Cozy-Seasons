import { ACHIEVEMENTS } from "../data/achievements.js";
import { GameState, addGold, addXP } from "../state.js";
import { EVT, emit, GameEvents } from "../GameEvents.js";
import SFX from "../SoundFX.js";

export const AchievementSystem = {
  scene: null,

  init(scene) {
    this.scene = scene;
    this.ensure();
    GameEvents.off(EVT.QUEST_EVENT, this._onEvent, this);
    GameEvents.off(EVT.LEVEL_UP, this._onLevel, this);
    this._onEvent = (p) => this.onEvent(p);
    this._onLevel = (lv) => this.onLevel(lv);
    GameEvents.on(EVT.QUEST_EVENT, this._onEvent, this);
    GameEvents.on(EVT.LEVEL_UP, this._onLevel, this);
  },

  ensure() {
    if (!GameState.achievements)
      GameState.achievements = { counters: {}, unlocked: {} };
    if (!GameState.achievements.counters) GameState.achievements.counters = {};
    if (!GameState.achievements.unlocked) GameState.achievements.unlocked = {};
  },

  count(id) {
    this.ensure();
    return GameState.achievements.counters[id] || 0;
  },
  isUnlocked(id) {
    this.ensure();
    return !!GameState.achievements.unlocked[id];
  },

  onEvent(p) {
    if (!p?.type) return;
    this.ensure();
    for (const a of ACHIEVEMENTS) {
      if (a.event !== p.type || this.isUnlocked(a.id)) continue;
      if (a.fishId && p.fishId !== a.fishId) continue;
      GameState.achievements.counters[a.id] = this.count(a.id) + 1;
      this.check(a);
    }
    emit(EVT.SAVE);
  },

  onLevel(lv) {
    this.ensure();
    for (const a of ACHIEVEMENTS) {
      if (a.event !== "level" || this.isUnlocked(a.id)) continue;
      GameState.achievements.counters[a.id] = lv;
      this.check(a);
    }
  },

  check(a) {
    if (this.count(a.id) >= a.need) this.unlock(a);
  },

  unlock(a) {
    GameState.achievements.unlocked[a.id] = Date.now();
    addGold(a.gold);
    if (a.xp > 0) addXP(a.xp);
    SFX.levelup();
    this.scene?.hud?.banner("Thành tựu mới!", a.name);
    this.scene?.hud?.toast(
      `${a.desc} (+${a.gold} vàng${a.xp ? `, +${a.xp} XP` : ""})`,
      "reward",
    );
    emit(EVT.SAVE);
  },
};
