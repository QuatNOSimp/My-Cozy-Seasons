import { SEASONS } from "../data/seasons.js";
import { GameState } from "../state.js";
import { EVT, emit } from "../GameEvents.js";

export const SeasonSystem = {
  current() {
    return SEASONS[GameState.seasonIndex];
  },
  vi() {
    return this.current().vi;
  },
  dayOfSeason() {
    return GameState.day;
  },
  yearDayText() {
    return `Ngày ${GameState.day}/${this.current().days} · Năm ${GameState.year}`;
  },

  // cộng ngày, trả về true nếu đổi mùa/năm
  advanceDate() {
    GameState.day++;
    let seasonChanged = false;
    if (GameState.day > this.current().days) {
      GameState.day = 1;
      GameState.seasonIndex = (GameState.seasonIndex + 1) % SEASONS.length;
      seasonChanged = true;
      if (GameState.seasonIndex === 0) GameState.year++;
    }
    return seasonChanged;
  },

  isCropInSeason(crop) {
    return crop.seasons.includes(this.current().id);
  },
};
