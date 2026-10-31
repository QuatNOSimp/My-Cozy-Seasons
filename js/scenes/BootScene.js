import {
  generateAllTextures,
  generateSeasonTextures,
  generateCropAndItemIcons,
} from "../art/Textures.js";
import {
  generateInteriorTextures,
  generateInteriorIcons,
} from "../art/InteriorTextures.js";
import { generateNPCTextures } from "../art/CharacterExtras.js";
import { generateLightTextures } from "../art/LightTextures.js";
import { SEASONS } from "../data/seasons.js";
import { CROPS } from "../data/crops.js";
import { RECIPES } from "../data/recipes.js";
import { FISH } from "../data/fish.js";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  create() {
    const t = this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2,
        "Đang vẽ khu vườn...",
        {
          fontFamily: "Nunito, sans-serif",
          fontSize: "20px",
          fontWeight: "800",
          color: "#fdf6e9",
        },
      )
      .setOrigin(0.5);
    this.time.delayedCall(60, () => {
      try {
        generateAllTextures(this);
        generateSeasonTextures(this, SEASONS[0]);
        generateCropAndItemIcons(this, CROPS);
        generateInteriorTextures(this);
        generateInteriorIcons(this, RECIPES, FISH);
        generateNPCTextures(this);
        generateLightTextures(this);
        this.buildHUDIcons();
        this.scene.start("Menu");
      } catch (e) {
        console.error(e);
        t.setText("Lỗi khởi tạo: " + e.message);
      }
    });
  }

  buildHUDIcons() {
    window.ICONS = {};
    for (const key of ["coin", "star", "heart"]) {
      const tex = this.textures.get(`icon_${key}`);
      const src = tex.getSourceImage();
      if (src && src.toDataURL) window.ICONS[key] = src.toDataURL();
    }
  }
}
