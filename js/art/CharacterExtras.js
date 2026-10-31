// Vẽ NPC bằng code (tái sử dụng phong cách nhân vật Phần 1)
import { NPCS } from "../data/npcs.js";

let G = null;
const rr = (g, x, y, w, h, r, c, a = 1) => {
  g.fillStyle(c, a);
  g.fillRoundedRect(x, y, w, h, r);
};
const ci = (g, x, y, r, c, a = 1) => {
  g.fillStyle(c, a);
  g.fillCircle(x, y, r);
};
const el = (g, x, y, rx, ry, c, a = 1) => {
  g.fillStyle(c, a);
  g.fillEllipse(x, y, rx * 2, ry * 2);
};
const ln = (g, pts, c, w = 2, a = 1) => {
  g.lineStyle(w, c, a);
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.strokePath();
};

function drawNPC(g, cfg, dir, pose, f) {
  const cx = 24,
    fy = 52,
    P = cfg.palette;
  const walk = pose === "walk" ? Math.sin((f / 4) * Math.PI * 2) : 0;
  const bob =
    pose === "walk"
      ? Math.abs(Math.cos((f / 4) * Math.PI * 2)) * 1.5
      : (f % 2) * 0.7;
  const by = fy - bob;
  const isSide = dir === "left",
    s = isSide ? -1 : 1;

  // chân
  const legH = 11,
    lo = walk * 3.6;
  if (!isSide) {
    rr(g, cx - 8, by - legH, 6, legH, 2, P.pants);
    rr(g, cx + 2, by - legH, 6, legH, 2, P.pants);
    rr(g, cx - 8.5, by - 4, 7, 4.5, 2, P.boot);
    rr(g, cx + 1.5, by - 4, 7, 4.5, 2, P.boot);
  } else {
    rr(g, cx - 3 + lo, by - legH, 6, legH, 2, P.pants);
    rr(g, cx - 3 + lo, by - 4, 7, 4.5, 2, P.boot);
    rr(g, cx - 3 - lo * 0.7, by - legH + 1, 6, legH - 1, 2, "#5c4a3d");
    rr(g, cx - 3.5 - lo * 0.7, by - 4, 7, 4.5, 2, "#3a2e22");
  }

  // thân
  const ty = by - legH - 16;
  if (cfg.dress) {
    g.fillStyle(P.shirt, 1);
    g.fillTriangle(cx - 8, ty, cx + 8, ty, cx + 13, by - 8);
    g.fillTriangle(cx - 8, ty, cx - 13, by - 8, cx + 13, by - 8);
    if (P.apron) {
      g.fillStyle(P.apron, 1);
      g.fillTriangle(cx - 5, ty + 6, cx + 5, ty + 6, cx + 8, by - 9);
      g.fillTriangle(cx - 5, ty + 6, cx - 8, by - 9, cx + 8, by - 9);
    }
  } else {
    rr(g, cx - 9 + (isSide ? s : 0), ty, 18, 17, 5, P.shirt);
    rr(
      g,
      cx - 9 + (isSide ? s : 0),
      ty + 12,
      18,
      5,
      { bl: 4, br: 4, tl: 0, tr: 0 },
      P.pants,
    );
  }
  // tay
  const sw = walk * 3;
  rr(g, cx - 12, ty + 2 + sw, 5, 11, 2.5, P.shirt);
  ci(g, cx - 9.5, ty + 13.5 + sw, 2.6, P.skin);
  rr(g, cx + 7, ty + 2 - sw, 5, 11, 2.5, P.shirt);
  ci(g, cx + 9.5, ty + 13.5 - sw, 2.6, P.skin);

  // đầu
  const hy = ty - 9;
  ci(g, cx, hy, 10.2, P.skin);
  if (!isSide) {
    ci(g, cx - 3.6, hy + 1.2, 1.6, "#3a2a20");
    ci(g, cx + 3.6, hy + 1.2, 1.6, "#3a2a20");
    ci(g, cx - 6, hy + 4.4, 2, "#f0a8a0", 0.5);
    ci(g, cx + 6, hy + 4.4, 2, "#f0a8a0", 0.5);
    g.lineStyle(1.4, "#a06a4a", 1);
    g.beginPath();
    g.arc(cx, hy + 4.6, 2.4, 0.15 * Math.PI, 0.85 * Math.PI);
    g.strokePath();
  } else {
    ci(g, cx + s * 4.4, hy + 1.2, 1.6, "#3a2a20");
    ci(g, cx + s * 6.8, hy + 4.4, 1.8, "#f0a8a0", 0.5);
  }

  if (cfg.id === "mai") {
    // tóc búi bạc + kính tròn
    g.fillStyle(P.hair, 1);
    g.fillCircle(cx, hy - 3.4, 10.4);
    if (!isSide) {
      g.fillCircle(cx - 8.4, hy - 0.6, 3.2, 1);
      g.fillCircle(cx + 8.4, hy - 0.6, 3.2, 1);
    }
    ci(g, cx + (isSide ? -s * 6 : 0), hy - 11, 5, P.hair);
    if (!isSide) {
      g.lineStyle(1.6, "#8a7a6a", 1);
      g.strokeCircle(cx - 3.8, hy + 1.4, 3.2);
      g.strokeCircle(cx + 3.8, hy + 1.4, 3.2);
      ln(
        g,
        [
          [cx - 0.6, hy + 1.4],
          [cx + 0.6, hy + 1.4],
        ],
        "#8a7a6a",
        1.6,
      );
    }
  } else if (cfg.id === "tu") {
    // râu trắng + mũ rơm
    if (!isSide) {
      g.fillStyle(P.hair, 1);
      g.fillCircle(cx, hy + 6.5, 6.5);
      g.fillStyle(P.skin, 1);
      g.fillCircle(cx, hy + 3.6, 4.2);
    } else {
      g.fillStyle(P.hair, 1);
      g.fillCircle(cx + s * 3, hy + 6, 5.4);
      g.fillStyle(P.skin, 1);
      g.fillCircle(cx + s * 2, hy + 3, 3.6);
    }
    el(g, cx, hy - 6.4, 14, 4.6, "#d9b98a");
    g.fillStyle("#c9a878", 1);
    g.beginPath();
    g.arc(cx, hy - 7.4, 7.4, Math.PI, 0);
    g.fill();
    rr(g, cx - 7.4, hy - 8.4, 14.8, 3, 1.5, "#b58a54");
  }
}

export function generateNPCTextures(scene) {
  G = scene.make.graphics({ x: 0, y: 0, add: false });
  for (const cfg of NPCS) {
    const frames = { idle_down: 2, walk_down: 4, walk_left: 4, idle_left: 1 };
    for (const [key, n] of Object.entries(frames)) {
      const [pose, dir] = key.split("_");
      for (let f = 0; f < n; f++) {
        G.clear();
        drawNPC(G, cfg, dir, pose, f);
        G.generateTexture(`npc_${cfg.id}_${pose}_${dir}_${f}`, 48, 58);
      }
    }
    for (const [key, n] of Object.entries(frames)) {
      const [pose, dir] = key.split("_");
      scene.anims.create({
        key: `npcani_${cfg.id}_${pose}_${dir}`,
        frames: Array.from({ length: n }, (_, i) => ({
          key: `npc_${cfg.id}_${pose}_${dir}_${i}`,
        })),
        frameRate: pose === "walk" ? 7 : 2,
        repeat: -1,
      });
    }
  }
  G.destroy();
  G = null;
}
