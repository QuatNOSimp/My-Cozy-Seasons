// Event bus trung tâm - các hệ thống giao tiếp qua đây, tránh phụ thuộc chéo
export const GameEvents = new Phaser.Events.EventEmitter();

export const EVT = {
  TIME_TICK: "time:tick",
  HOUR_TICK: "time:hour",
  PHASE: "time:phase",
  DAY_ADVANCED: "day:advanced",
  SEASON_CHANGED: "season:changed",
  WEATHER_CHANGED: "weather:changed",
  GOLD: "res:gold",
  XP: "res:xp",
  LEVEL_UP: "res:levelup",
  INV_CHANGE: "inv:change",
  QUEST_EVENT: "quest:event",
  QUEST_DONE: "quest:done",
  PET_CHANGE: "pet:change",
  SAVE: "save:dirty",
};

export const emit = (e, data) => GameEvents.emit(e, data);
export const on = (e, cb, ctx) => GameEvents.on(e, cb, ctx);
