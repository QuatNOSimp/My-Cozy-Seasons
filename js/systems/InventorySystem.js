import { GameState } from "../state.js";
import { EVT, emit } from "../GameEvents.js";
import { itemById } from "../data/items.js";

export const InventorySystem = {
  count(id) {
    return GameState.inventory[id] || 0;
  },
  has(id, n = 1) {
    return this.count(id) >= n;
  },

  add(id, n = 1, silent = false) {
    GameState.inventory[id] = this.count(id) + n;
    emit(EVT.INV_CHANGE, { id, delta: n });
    if (!silent) emit(EVT.SAVE);
  },

  remove(id, n = 1) {
    if (!this.has(id, n)) return false;
    GameState.inventory[id] -= n;
    if (GameState.inventory[id] <= 0) {
      delete GameState.inventory[id];
      if (GameState.selected === id) GameState.selected = null;
    }
    emit(EVT.INV_CHANGE, { id, delta: -n });
    emit(EVT.SAVE);
    return true;
  },

  entries() {
    return Object.entries(GameState.inventory).map(([id, qty]) => ({
      id,
      qty,
      meta: itemById(id),
    }));
  },

  select(id) {
    GameState.selected = GameState.selected === id ? null : id;
    emit("inv:selected", GameState.selected);
  },

  sell(id, n = 1) {
    const meta = itemById(id);
    const price = meta?.sell || 0;
    if (!price || !this.has(id, n)) return false;
    this.remove(id, n);
    GameState.gold += price * n;
    emit(EVT.GOLD, GameState.gold);
    emit(EVT.SAVE);
    return price * n;
  },
};
