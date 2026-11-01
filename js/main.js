import { CONFIG } from "./config.js";
import { installColorCompat } from "./utils/phasercolorcompat.js";
import { BootScene } from "./scenes/BootScene.js";
import { MenuScene } from "./scenes/MenuScene.js";
import { GameScene } from "./scenes/GameScene.js";
import { HouseScene } from "./scenes/HouseScene.js";

window.addEventListener("load", () => {
  installColorCompat();
  new Phaser.Game({
    type: Phaser.AUTO,
    parent: "game-container",
    backgroundColor: "#1a2332",
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: CONFIG.W,
      height: CONFIG.H,
    },
    physics: { default: "arcade", arcade: { debug: false } },
    scene: [BootScene, MenuScene, GameScene, HouseScene],
  });
});
