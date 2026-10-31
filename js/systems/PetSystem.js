import { PETS, SPECIES_NAME } from "../data/pets.js";
import { LAYOUT, tx2px } from "../config.js";
import { Pet } from "../entities/Pet.js";
import { GameState } from "../state.js";
import { InventorySystem } from "./InventorySystem.js";
import { EVT, emit, GameEvents } from "../GameEvents.js";
import SFX from "../SoundFX.js";

export const PetSystem = {
  scene: null,
  pets: [],

  init(scene) {
    this.scene = scene;
    this.pets = [];
    GameEvents.off(EVT.HOUR_TICK, this._hourFn, this);
    this._hourFn = () => this.pets.forEach((p) => p.decayHour());
    GameEvents.on(EVT.HOUR_TICK, this._hourFn, this);
    for (const cfg of PETS) {
      const home = LAYOUT.pet[cfg.id];
      const pet = new Pet(
        scene,
        cfg,
        tx2px(home.homeX),
        tx2px(home.homeY),
        home.r,
      );
      this.pets.push(pet);
      scene.addInteractable({
        x: pet.x,
        y: pet.y,
        radius: 55,
        dynamic: pet,
        getPrompt: () => this.getPrompt(cfg),
        onInteract: () => this.interact(pet, cfg),
      });
    }
  },

  getPrompt(cfg) {
    const sel = GameState.selected;
    if (sel === cfg.food)
      return { text: `Cho ${cfg.name} ăn`, icon: `icon_${cfg.food}` };
    return { text: `Vuốt ve ${cfg.name}`, icon: "icon_heart" };
  },

  interact(pet, cfg) {
    const sc = this.scene;
    const sel = GameState.selected;
    if (sel === cfg.food) {
      if (!InventorySystem.has(cfg.food)) {
        sc.hud.toast("Hết thức ăn rồi, ghé cửa hàng nhé!");
        return;
      }
      InventorySystem.remove(cfg.food);
      sc.player.faceToward(pet.x, pet.y);
      sc.player.playAction("feed", () => {
        pet.feed();
        sc.add
          .particles(pet.x, pet.y - 26, "pt_heart", {
            lifespan: 1000,
            speedY: { min: -34, max: -60 },
            quantity: 3,
            emitting: false,
          })
          .setDepth(820)
          .explode(3);
        SFX.purr();
        sc.hud.toast(`${cfg.name} đang ăn ${cfg.foodName} ngon lành!`);
        emit(EVT.QUEST_EVENT, {
          type: "pet.feed",
          petId: cfg.id,
          species: cfg.species,
        });
      });
      return;
    }
    if (pet.petCooldown > 0) {
      sc.hud.toast(`${cfg.name} đang tận hưởng rồi~`);
      return;
    }
    sc.player.faceToward(pet.x, pet.y);
    sc.player.playAction("pet", () => {
      pet.petted();
      SFX.purr();
      emit(EVT.QUEST_EVENT, {
        type: "pet.pet",
        petId: cfg.id,
        species: cfg.species,
      });
    });
  },

  update(dt) {
    this.pets.forEach((p) => p.update(dt));
  },
  endDay() {
    this.pets.forEach((p) => p.endDay());
  },
  openPanel(pet) {
    this.scene.panels.showPetPanel(pet);
  },
};
