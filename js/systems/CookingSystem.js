import { RECIPES } from "../data/recipes.js";
import { itemName } from "../data/items.js";
import { InventorySystem } from "./InventorySystem.js";
import { GameState, addXP } from "../state.js";
import { EVT, emit } from "../GameEvents.js";
import SFX from "../SoundFX.js";

export const CookingSystem = {
  openPanel(scene) {
    const icon = (id) => {
      let key = `icon_${id}`;
      if (id.startsWith("crop_")) key = `icon_crop_${id.slice(5)}`;
      if (id.startsWith("seed_")) key = `icon_seed_${id.slice(5)}`;
      const tex = scene.textures.get(key) || scene.textures.get("icon_star");
      const src = tex?.getSourceImage?.();
      return src?.toDataURL ? src.toDataURL() : "";
    };
    const rows = RECIPES.map((r, i) => {
      const locked = GameState.level < r.level;
      const ings = r.ingredients
        .map((g2) => {
          const have = InventorySystem.count(g2.id);
          const ok = have >= g2.qty;
          return `<span style="color:${ok ? "#7ba05b" : "#c96a5a"};font-weight:800">${itemName(g2.id)} ${have}/${g2.qty}</span>`;
        })
        .join(" · ");
      return `
        <div class="shop-row" style="${locked ? "opacity:.55" : ""}">
          <img src="${icon(r.id)}">
          <div class="si"><b>${itemName(r.id)}</b><span>${locked ? `Mở khóa ở cấp ${r.level}` : ings}</span></div>
          ${locked ? "" : `<button class="btn btn-warm cook-btn" data-i="${i}">Nấu</button>`}
        </div>`;
    }).join("");

    scene.panels.open(
      `
      <button class="panel-close">✕</button>
      <h3>Bếp nấu ăn</h3>
      <div style="max-height:380px;overflow-y:auto;padding-right:6px">${rows}</div>
      <p style="font-size:11px;color:#8a7362;font-weight:700;margin-top:8px">Nguyên liệu lấy từ Túi đồ (I) hoặc Tủ lạnh. Món ăn bán được giá cao, hoặc thưởng thức để nhận XP.</p>`,
      "cook",
    );

    scene.panels.current.querySelectorAll(".cook-btn").forEach((b) => {
      b.onclick = () => this.cook(scene, RECIPES[+b.dataset.i]);
    });
  },

  canCook(r) {
    return r.ingredients.every((g2) => InventorySystem.has(g2.id, g2.qty));
  },

  cook(scene, r) {
    if (!this.canCook(r)) {
      scene.hud.toast("Chưa đủ nguyên liệu...");
      SFX.error();
      return;
    }
    r.ingredients.forEach((g2) => InventorySystem.remove(g2.id, g2.qty));
    scene.panels.close();
    scene.player.playAction("cook", () => {
      InventorySystem.add(r.id);
      addXP(r.xp);
      SFX.harvest();
      scene.hud.toast(`Đã nấu xong ${itemName(r.id)}! +${r.xp} XP`, "reward");
      emit(EVT.QUEST_EVENT, { type: "cook.done", dishId: r.id });
      emit(EVT.SAVE);
    });
  },
};
