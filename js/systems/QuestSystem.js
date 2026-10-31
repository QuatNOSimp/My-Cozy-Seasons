import { GameState, addGold, addXP } from "../state.js";
import { QUEST_POOL, DAILY_QUEST_COUNT } from "../data/quests.js";
import { EVT, emit, GameEvents } from "../GameEvents.js";
import { hashStr, mulberry32 } from "../config.js";
import SFX from "../SoundFX.js";

export const QuestSystem = {
  scene: null,
  caredToday: new Set(),

  init(scene) {
    this.scene = scene;
    GameEvents.off(EVT.QUEST_EVENT, this._evFn, this);
    this._evFn = (p) => this.onEvent(p);
    GameEvents.on(EVT.QUEST_EVENT, this._evFn, this);
    const key = this.dayKey();
    if (GameState.questDayKey !== key || !GameState.quests.length)
      this.generate();
  },

  dayKey() {
    return `${GameState.year}-${GameState.seasonIndex}-${GameState.day}`;
  },

  generate() {
    const rng = mulberry32(hashStr(this.dayKey()));
    const pool = [...QUEST_POOL];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const picked = [];
    const ensure = (cat) => {
      const q = pool.find((q2) => q2.cat === cat && !picked.includes(q2));
      if (q) picked.push(q);
    };
    ensure("pet");
    ensure("garden");
    for (const q of pool) {
      if (picked.length >= DAILY_QUEST_COUNT) break;
      if (!picked.includes(q)) picked.push(q);
    }
    GameState.quests = picked.map((q) => ({ ...q, progress: 0, done: false }));
    GameState.questDayKey = this.dayKey();
    this.caredToday.clear();
    emit(EVT.SAVE);
  },

  onEvent(payload) {
    if (!payload?.type) return;
    let changed = false;
    for (const q of GameState.quests) {
      if (q.done || q.event !== payload.type) continue;
      if (q.petId && payload.petId !== q.petId) continue;
      if (q.species && payload.species !== q.species) continue;
      if (q.flower && !payload.flower) continue;
      if (q.event === "pet.cared") continue;
      q.progress = Math.min(q.target, q.progress + 1);
      if (q.progress >= q.target) this.complete(q);
      changed = true;
    }
    if (payload.type === "pet.feed" || payload.type === "pet.pet") {
      this.caredToday.add(payload.petId);
      const q = GameState.quests.find(
        (q2) => !q2.done && q2.event === "pet.cared",
      );
      if (q) {
        q.progress = Math.min(q.target, this.caredToday.size);
        if (q.progress >= q.target) this.complete(q);
        changed = true;
      }
    }
    if (changed) emit(EVT.SAVE);
  },

  complete(q) {
    q.done = true;
    addGold(q.gold);
    addXP(q.xp);
    SFX.quest();
    this.scene?.hud?.toast(
      `Hoàn thành: ${q.text}  (+${q.gold} vàng, +${q.xp} XP)`,
      "reward",
    );
    emit(EVT.QUEST_DONE, q);
  },

  newDay() {
    this.generate();
  },
};
