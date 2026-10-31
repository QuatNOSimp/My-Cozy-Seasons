import { GameState } from "../state.js";
import { SeasonSystem } from "./SeasonSystem.js";
import { TimeSystem } from "./TimeSystem.js";
import { WeatherSystem } from "./WeatherSystem.js";
import { FarmingSystem } from "./FarmingSystem.js";
import { PetSystem } from "./PetSystem.js";
import { QuestSystem } from "./QuestSystem.js";
import { SaveSystem } from "./SaveSystem.js";

export const DaySystem = {
  advanceDay(scene, opts = {}) {
    const rained = WeatherSystem.isPrecip();
    const seasonChanged = SeasonSystem.advanceDate();
    TimeSystem.resetToMorning();
    WeatherSystem.rollNewDay();
    if (scene.scene?.key === "Game") {
      WeatherSystem.clearFX();
      WeatherSystem.apply();
    }
    const hybrid = FarmingSystem.endDay(rained);
    PetSystem.endDay();
    QuestSystem.newDay();
    if (seasonChanged) scene.applySeasonVisuals?.();
    scene.buildForage?.();
    SaveSystem.save();
    scene.hud?.refresh();
    if (!opts.quiet) {
      const s = SeasonSystem.current();
      scene.time.delayedCall(700, () => {
        scene.hud.banner(
          `Ngày ${GameState.day} · Mùa ${s.vi}`,
          opts.reason || "Một ngày mới dịu dàng bắt đầu",
        );
        if (seasonChanged)
          scene.time.delayedCall(3300, () =>
            scene.hud.banner(`Mùa ${s.vi} đã đến!`, s.desc),
          );
        if (hybrid)
          scene.time.delayedCall(2400, () =>
            scene.hud.toast(
              "Điều kỳ diệu: một hạt giống hoa mới nảy mầm trong vườn!",
              "reward",
            ),
          );
        if (rained)
          scene.time.delayedCall(1600, () =>
            scene.hud.toast("Đêm qua trời mưa — cây cối được tưới mát."),
          );
      });
    }
    return { seasonChanged, hybrid, rained };
  },
};
