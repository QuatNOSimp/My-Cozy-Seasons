import { GameState } from "../state.js";
import { EVT, emit } from "../GameEvents.js";
import { SeasonSystem } from "./SeasonSystem.js";
import SFX from "../SoundFX.js";

export const WeatherSystem = {
  scene: null,
  emitter: null,
  wetOverlay: null,

  init(scene) {
    this.scene = scene;
    this.apply();
  },

  rollNewDay() {
    const s = SeasonSystem.current();
    GameState.weather = Math.random() < s.rainChance ? "rainy" : "sunny";
    emit(EVT.WEATHER_CHANGED, GameState.weather);
  },

  isPrecip() {
    return GameState.weather === "rainy";
  },
  isSnow() {
    return this.isPrecip() && SeasonSystem.current().id === "winter";
  },

  apply() {
    const sc = this.scene;
    this.clearFX();
    if (!this.isPrecip()) return;
    const snow = this.isSnow();
    const { width: W } = sc.scale;
    this.emitter = sc.add
      .particles(0, 0, snow ? "pt_snow" : "pt_rain", {
        x: { min: -60, max: W + 60 },
        y: -30,
        lifespan: snow ? 7000 : 1100,
        speedY: snow ? { min: 50, max: 90 } : { min: 520, max: 640 },
        speedX: snow ? { min: -40, max: 40 } : { min: -60, max: -20 },
        quantity: snow ? 2 : 5,
        frequency: 16,
        alpha: { start: 0.9, end: 0.55 },
        scale: snow ? { start: 0.7, end: 1 } : 1,
        rotate: snow ? { start: 0, end: 180 } : 12,
      })
      .setDepth(900)
      .setScrollFactor(0);
    // nền đất sẫm màu khi mưa
    this.wetOverlay = sc.add
      .rectangle(
        sc.scale.width / 2,
        sc.scale.height / 2,
        sc.scale.width,
        sc.scale.height,
        0x28384a,
        0.14,
      )
      .setScrollFactor(0)
      .setDepth(899);
    SFX.rain(true);
  },

  clearFX() {
    this.emitter?.destroy();
    this.emitter = null;
    this.wetOverlay?.destroy();
    this.wetOverlay = null;
    SFX.rain(false);
  },
};
