// Trạng thái game toàn cục + helpers tăng tiến
import { EVT, emit } from "./GameEvents.js";
import { clamp } from "./config.js";

export const GameState = {
  version: 1,
  started: false,
  character: { gender: "female", name: "Bạn" },
  gold: 300,
  xp: 0,
  level: 1,
  day: 1,
  seasonIndex: 0,
  year: 1,
  timeMinutes: 6 * 60 + 30,
  weather: "sunny",
  inventory: {}, // id -> qty
  selected: null, // item id đang cầm
  plots: [], // do FarmingSystem khởi tạo
  decor: [], // [{id,x,y}]
  pets: {}, // id -> {hunger,happiness,cleanliness,energy}
  quests: [], // daily quests hôm nay
  questDayKey: "",
  mailDay: 0, // ngày cuối đã mở hộp thư
  unlocked: { greenhouse: false, fishing: false, cooking: false, house: false },
  settings: { sound: true },
  uiOpen: false,
};

export function xpForLevel(l) {
  return 90 + (l - 1) * 60;
}

export function addGold(n) {
  GameState.gold = Math.max(0, GameState.gold + n);
  emit(EVT.GOLD, GameState.gold);
}

export function addXP(n) {
  GameState.xp += n;
  emit(EVT.XP, GameState.xp);
  let need = xpForLevel(GameState.level);
  while (GameState.xp >= need) {
    GameState.xp -= need;
    GameState.level++;
    need = xpForLevel(GameState.level);
    emit(EVT.LEVEL_UP, GameState.level);
  }
}

export function defaultPetStats() {
  return { hunger: 30, happiness: 75, cleanliness: 85, energy: 90 };
}

export function newGamePayload(gender, name) {
  GameState.started = true;
  GameState.character = { gender, name: name || "Bạn" };
  GameState.gold = 300;
  GameState.xp = 0;
  GameState.level = 1;
  GameState.day = 1;
  GameState.seasonIndex = 0;
  GameState.year = 1;
  GameState.timeMinutes = 6 * 60 + 30;
  GameState.weather = "sunny";
  GameState.inventory = {
    seed_turnip: 4,
    seed_tulip: 2,
    food_rabbit: 3,
    food_dog: 3,
    food_cat: 5,
    hoe: 1,
    can: 1,
    rod: 1,
    net: 1,
    flower_pot: 1,
  };
  GameState.selected = null;
  GameState.plots = [];
  GameState.decor = [];
  GameState.pets = {};
  GameState.quests = [];
  GameState.questDayKey = "";
  GameState.mailDay = 0;
  GameState.unlocked = {
    greenhouse: false,
    fishing: false,
    cooking: false,
    house: false,
  };
}
