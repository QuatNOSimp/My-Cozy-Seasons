export function generateLightTextures(scene) {
  const mkGlow = (key, stops) => {
    if (scene.textures.exists(key)) scene.textures.remove(key);
    const ct = scene.textures.createCanvas(key, 128, 128);
    const ctx = ct.context;
    const grad = ctx.createRadialGradient(64, 64, 2, 64, 64, 64);
    stops.forEach(([o, c]) => grad.addColorStop(o, c));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    ct.refresh();
  };
  mkGlow("glow_warm", [
    [0, "rgba(255,228,150,0.9)"],
    [0.35, "rgba(255,200,110,0.38)"],
    [1, "rgba(255,180,80,0)"],
  ]);

  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  if (!scene.textures.exists("pt_firefly")) {
    g.clear();
    g.fillStyle(0xd8f57a, 0.35);
    g.fillCircle(4, 4, 4);
    g.fillStyle(0xeaff9a, 1);
    g.fillCircle(4, 4, 1.8);
    g.generateTexture("pt_firefly", 8, 8);
  }

  if (!scene.textures.exists("decor_lamp_post")) {
    g.clear();
    g.fillStyle(0x2a2018, 0.18);
    g.fillEllipse(24, 90, 20, 6);
    g.fillStyle(0x3a3f47, 1);
    g.fillRoundedRect(21.5, 26, 5, 64, 2);
    g.fillStyle(0x2f343c, 1);
    g.fillEllipse(24, 90, 14, 5);
    g.fillStyle(0x2f343c, 1);
    g.fillRoundedRect(12, 8, 24, 22, 5);
    g.fillStyle(0xffe9a8, 1);
    g.fillRoundedRect(15.5, 11.5, 17, 15, 3);
    g.fillStyle(0xfff3c9, 1);
    g.fillCircle(24, 19, 4.6);
    g.fillStyle(0x2f343c, 1);
    g.fillTriangle(10, 9, 38, 9, 24, 1);
    g.fillStyle(0x5c626e, 1);
    g.fillCircle(24, 31, 2.4);
    g.generateTexture("decor_lamp_post", 48, 96);
  }

  if (!scene.textures.exists("decor_scarecrow")) {
    g.clear();
    g.fillStyle(0x2a2018, 0.18);
    g.fillEllipse(32, 84, 22, 6);
    g.fillStyle(0x8a6238, 1);
    g.fillRoundedRect(29.5, 22, 5, 62, 2);
    g.fillStyle(0x8a6238, 1);
    g.fillRoundedRect(10, 36, 44, 4.5, 2);
    g.fillStyle(0x5f8fbf, 1);
    g.fillRoundedRect(20, 32, 24, 26, 6);
    g.fillStyle(0x5f8fbf, 1);
    g.fillRoundedRect(8, 34, 10, 7, 3);
    g.fillRoundedRect(46, 34, 10, 7, 3);
    g.fillStyle(0xd9b98a, 1);
    g.fillCircle(8, 37.5, 3.4);
    g.fillCircle(56, 37.5, 3.4);
    g.fillStyle(0xf2d9a8, 1);
    g.fillCircle(32, 22, 10);
    g.fillStyle(0x3a2a20, 1);
    g.fillCircle(28.5, 21, 1.5);
    g.fillCircle(35.5, 21, 1.5);
    g.lineStyle(1.4, 0x3a2a20, 1);
    g.beginPath();
    g.arc(32, 24.5, 2.6, 0.15 * Math.PI, 0.85 * Math.PI);
    g.strokePath();
    g.fillStyle(0xc99a6a, 1);
    g.fillEllipse(32, 14.5, 15, 4.5);
    g.fillStyle(0xb58a54, 1);
    g.beginPath();
    g.arc(32, 13, 7, Math.PI, 0);
    g.fill();
    g.fillStyle(0xf5c542, 1);
    g.fillTriangle(30, 40, 34, 40, 32, 45);
    g.lineStyle(1.6, 0xd9b98a, 1);
    g.beginPath();
    g.moveTo(26, 58);
    g.lineTo(22, 66);
    g.strokePath();
    g.beginPath();
    g.moveTo(38, 58);
    g.lineTo(42, 66);
    g.strokePath();
    g.generateTexture("decor_scarecrow", 64, 88);
  }

  if (!scene.textures.exists("icon_lamp_post")) {
    g.clear();
    g.fillStyle(0x3a3f47, 1);
    g.fillRoundedRect(22, 16, 4, 26, 2);
    g.fillStyle(0x2f343c, 1);
    g.fillRoundedRect(16, 6, 16, 13, 3);
    g.fillStyle(0xffe9a8, 1);
    g.fillRoundedRect(18.5, 8.5, 11, 8, 2);
    g.fillStyle(0x2f343c, 1);
    g.fillTriangle(15, 7, 33, 7, 24, 2);
    g.fillStyle(0x2f343c, 1);
    g.fillEllipse(24, 43, 10, 3.6);
    g.generateTexture("icon_lamp_post", 48, 48);
  }
  if (!scene.textures.exists("icon_scarecrow")) {
    g.clear();
    g.fillStyle(0x8a6238, 1);
    g.fillRoundedRect(22.5, 14, 3, 30, 1.5);
    g.fillStyle(0x8a6238, 1);
    g.fillRoundedRect(12, 20, 24, 3, 1.5);
    g.fillStyle(0x5f8fbf, 1);
    g.fillRoundedRect(17, 18, 14, 14, 4);
    g.fillStyle(0xf2d9a8, 1);
    g.fillCircle(24, 12, 6.5);
    g.fillStyle(0xc99a6a, 1);
    g.fillEllipse(24, 8, 10, 3);
    g.fillStyle(0xb58a54, 1);
    g.beginPath();
    g.arc(24, 7, 4.6, Math.PI, 0);
    g.fill();
    g.fillStyle(0x3a2a20, 1);
    g.fillCircle(21.8, 11.5, 1);
    g.fillCircle(26.2, 11.5, 1);
    g.generateTexture("icon_scarecrow", 48, 48);
  }
  g.destroy();
}
