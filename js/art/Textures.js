// Toàn bộ texture của game được sinh bằng code tại BootScene.
// Quy ước key: pf_<gender>_<pose>_<dir>_<frame> | pet_<species>_<coat>_<anim>_<frame>
//              crop_<id>_<stage> | icon_<id> | tile_* | tree_* | furn_* ...

let G = null; // graphics context dùng chung
let sceneRef = null;

const SKIN = "#ffd9b8",
  SKIN_D = "#eab98f";
const HAIR = { female: "#7c4a2d", male: "#4a3121" };
const SHIRT = { female: "#e884a8", male: "#7fa8e0" };
const PANTS = "#5f7fbf",
  BOOT = "#8a5a3a";

function bake(key, w, h, draw) {
  G.clear();
  draw(G);
  G.generateTexture(key, w, h);
}

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
const ln = (g, pts, c, wdt = 2, a = 1) => {
  g.lineStyle(wdt, c, a);
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.strokePath();
};

/* ================= NHÂN VẬT ================= */
// Vẽ trong hệ toạ độ: chân tại (24, 52), khung 48x58
function drawHuman(g, o) {
  const { gender, dir, pose = "idle", f = 0 } = o;
  const cx = 24,
    fy = 52;
  const walkSwing = pose === "walk" ? Math.sin((f / 4) * Math.PI * 2) : 0;
  const bob =
    pose === "walk"
      ? Math.abs(Math.cos((f / 4) * Math.PI * 2)) * 1.6
      : (f % 2) * 0.8;
  const crouch = pose === "harvest" || pose === "dig" ? 3 : 0;
  const by = fy - bob + crouch * 0.4; // base y đã dịch
  const hair = HAIR[gender],
    shirt = SHIRT[gender];
  const side = dir === "left" ? -1 : 1;
  const isSide = dir === "left" || dir === "right";
  const isBack = dir === "up";

  // --- chân ---
  const legOff = walkSwing * 4;
  const legH = 11 - crouch * 0.8;
  if (!isSide) {
    rr(
      g,
      cx - 8,
      by - legH - 1 + Math.max(0, legOff) * 0.3,
      6,
      legH - Math.max(0, legOff) * 0.3,
      2,
      PANTS,
    );
    rr(
      g,
      cx + 2,
      by - legH - 1 + Math.max(0, -legOff) * 0.3,
      6,
      legH - Math.max(0, -legOff) * 0.3,
      2,
      PANTS,
    );
    rr(g, cx - 8.5, by - 4, 7, 4.5, 2, BOOT);
    rr(g, cx + 1.5, by - 4, 7, 4.5, 2, BOOT);
  } else {
    rr(g, cx - 3 + legOff, by - legH, 6, legH, 2, PANTS);
    rr(g, cx - 3 + legOff, by - 4, 7, 4.5, 2, BOOT);
    rr(g, cx - 3 - legOff * 0.7, by - legH + 1, 6, legH - 1, 2, "#4d6aa5");
    rr(g, cx - 3.5 - legOff * 0.7, by - 4, 7, 4.5, 2, "#6f452c");
  }

  // --- thân ---
  const ty = by - legH - 16;
  rr(g, cx - 9 + (isSide ? side * 1 : 0), ty, 18, 17, 5, shirt);
  rr(
    g,
    cx - 9 + (isSide ? side * 1 : 0),
    ty + 9,
    18,
    8,
    { bl: 5, br: 5, tl: 0, tr: 0 },
    PANTS,
  ); // yếm
  if (!isBack) {
    // dây yếm
    rr(g, cx - 7, ty + 1, 3, 9, 1.5, PANTS);
    rr(g, cx + 4, ty + 1, 3, 9, 1.5, PANTS);
  }
  // bóng thân nhẹ
  rr(g, cx + (isSide ? side * 1 : 0) + 4, ty + 2, 4, 13, 2, "#000", 0.06);

  // --- tay ---
  const armY = ty + 3;
  const holdForward = ["water", "harvest", "pet", "feed", "cook"].includes(
    pose,
  );
  if (holdForward && !isBack) {
    const reach = pose === "harvest" ? 8 + (f % 2) * 3 : 7;
    el(
      g,
      cx + side * (isSide ? 11 : 0) + (isSide ? 0 : 0),
      armY + 6,
      1,
      1,
      shirt,
    ); // gốc tay
    if (!isSide) {
      rr(g, cx - 12, armY + 3, 8, 5, 2.5, shirt);
      rr(g, cx + 4, armY + 3, 8, 5, 2.5, shirt);
      ci(g, cx - 13, armY + 5.5, 3, SKIN);
      ci(g, cx + 13, armY + 5.5, 3, SKIN);
    } else {
      rr(g, cx + side * 6 - 3, armY + 2, 12 * side, 5, 2.5, shirt);
      ci(g, cx + side * (6 + reach), armY + 4.5, 3.2, SKIN);
    }
  } else {
    const sw = pose === "walk" ? walkSwing * 3.5 : 0;
    rr(g, cx - 12, armY + 2 + sw, 5, 11, 2.5, shirt);
    ci(g, cx - 9.5, armY + 14 + sw, 2.8, SKIN);
    rr(g, cx + 7, armY + 2 - sw, 5, 11, 2.5, shirt);
    ci(g, cx + 9.5, armY + 14 - sw, 2.8, SKIN);
  }
  if (pose === "dig") {
    // tay cầm cuốc giơ lên
    const up = f % 2 === 0;
    rr(g, cx + 6, armY - (up ? 8 : 0), 5, 12, 2.5, shirt);
    ci(g, cx + 8.5, armY - (up ? 9 : -2), 3, SKIN);
  }

  // --- đầu ---
  const hy = ty - 9 + (pose === "dig" && f % 2 === 1 ? 2 : 0);
  ci(g, cx, hy, 10.5, SKIN);
  if (isBack) {
    ci(g, cx, hy - 0.5, 10.8, hair);
    if (gender === "female") rr(g, cx - 3, hy + 4, 6, 10, 3, hair);
  } else {
    // tóc: mái + đỉnh
    g.fillStyle(hair, 1);
    g.fillCircle(cx, hy - 3.2, 10.6);
    if (!isSide) {
      g.fillCircle(cx - 8.6, hy - 0.5, 3.4, 1);
      g.fillCircle(cx + 8.6, hy - 0.5, 3.4, 1);
    }
    if (gender === "female") {
      // tóc dài hai bên
      rr(g, cx - 12.5, hy - 2, 5, 15, 2.5, hair);
      rr(g, cx + 7.5, hy - 2, 5, 15, 2.5, hair);
    }
    // mặt
    if (!isSide) {
      const blink = pose === "idle" && f === 1;
      if (blink) {
        ln(
          g,
          [
            [cx - 5, hy + 1.5],
            [cx - 2, hy + 1.5],
          ],
          "#4a3121",
          1.4,
        );
        ln(
          g,
          [
            [cx + 2, hy + 1.5],
            [cx + 5, hy + 1.5],
          ],
          "#4a3121",
          1.4,
        );
      } else {
        ci(g, cx - 3.6, hy + 1.2, 1.7, "#3a2a20");
        ci(g, cx + 3.6, hy + 1.2, 1.7, "#3a2a20");
      }
      ci(g, cx - 6.2, hy + 4.2, 2, "#f5a0a0", 0.55);
      ci(g, cx + 6.2, hy + 4.2, 2, "#f5a0a0", 0.55);
      g.lineStyle(1.4, "#b06a4a", 1);
      g.beginPath();
      g.arc(cx, hy + 4.5, 2.6, 0.15 * Math.PI, 0.85 * Math.PI);
      g.strokePath();
    } else {
      ci(g, cx + side * 4.6, hy + 1.2, 1.7, "#3a2a20");
      ci(g, cx + side * 7, hy + 4.2, 1.8, "#f5a0a0", 0.55);
    }
  }
  // ngủ: mắt nhắm + zZ (vẽ riêng tư thế nằm ở drawSleeping)

  // --- đạo cụ theo pose ---
  drawProp(g, pose, f, cx, ty, hy, dir);
}

function drawProp(g, pose, f, cx, ty, hy, dir) {
  const down = dir === "down",
    up = dir === "up";
  if (pose === "water") {
    const px = up ? cx : cx + 14,
      py = up ? hy - 14 : ty + 8;
    rr(g, px - 6, py, 12, 9, 3, "#5db6d4");
    rr(g, px - 8, py - 2, 6, 3, 1.5, "#5db6d4");
    ln(
      g,
      [
        [px + 6, py + 2],
        [px + 11, py - 1],
      ],
      "#5db6d4",
      3,
    );
    ci(g, px + 11, py - 1, 2, "#4a9ab5");
    if (f % 2 === 1) {
      ci(g, px + 12, py + 4, 1.5, "#8fd4e8");
      ci(g, px + 10, py + 7, 1.3, "#8fd4e8");
      ci(g, px + 13, py + 9, 1.2, "#8fd4e8");
    }
  } else if (pose === "dig") {
    const upSwing = f % 2 === 0;
    const hx = cx + 10,
      hy1 = upSwing ? ty - 16 : ty + 2;
    ln(
      g,
      [
        [hx, hy1],
        [hx + (upSwing ? 4 : -2), hy1 + 16],
      ],
      "#8a5a3a",
      3.2,
    );
    rr(g, hx + (upSwing ? 2 : -6), hy1 + 14, 8, 5, 2, "#9aa3b2");
  } else if (pose === "harvest") {
    if (f % 2 === 0) {
      ci(g, cx + (dir === "left" ? -14 : 14), ty + 12, 4, "#e8543f");
    }
  } else if (pose === "feed") {
    const px = cx + (down ? 0 : 12),
      py = ty + 12;
    el(g, px, py + 3, 6, 3, "#c9a06a");
    el(g, px, py + 1, 4.5, 2, "#8a6a4a");
    ci(g, px - 1.5, py, 1.2, "#f2a154");
    ci(g, px + 1.5, py - 0.5, 1.2, "#f2a154");
  } else if (pose === "pet") {
    if (f % 2 === 1) {
      ci(g, cx + 12, ty - 2, 2.6, "#ff8aa0");
      ci(g, cx + 15, ty - 2, 2.6, "#ff8aa0");
    }
  } else if (pose === "cook") {
    const px = cx + 14,
      py = ty + 8;
    ci(g, px, py + 3, 6, "#5c626e");
    ci(g, px, py + 2, 4.5, "#3a3f47");
    ln(
      g,
      [
        [px + 5, py + 1],
        [px + 12, py - 3],
      ],
      "#8a5a3a",
      2.6,
    );
    if (f % 2 === 1) {
      ci(g, px - 2, py - 5, 1.4, "#fff", 0.7);
      ci(g, px + 2, py - 8, 1.8, "#fff", 0.6);
    }
  }
}

function drawSleeping(g, gender) {
  // tư thế nằm ngang
  const cy = 40;
  el(g, 24, 50, 20, 4, "#000", 0.12);
  rr(g, 8, cy - 4, 32, 14, 7, "#a8c686"); // chăn
  rr(g, 8, cy - 4, 32, 5, { tl: 7, tr: 7, bl: 0, br: 0 }, "#94b876");
  ci(g, 13, cy - 6, 8.5, SKIN); // đầu
  g.fillStyle(HAIR[gender], 1);
  g.fillCircle(11.5, cy - 8.5, 8.5);
  ci(g, 15.5, cy - 4.5, 3.2, SKIN);
  ln(
    g,
    [
      [14.5, cy - 4],
      [17, cy - 4],
    ],
    "#4a3121",
    1.3,
  ); // mắt nhắm
  // chữ z
  ln(
    g,
    [
      [34, cy - 14],
      [38, cy - 14],
      [34, cy - 10],
      [38, cy - 10],
    ],
    "#fff",
    1.6,
    0.9,
  );
}

function drawSitting(g, gender) {
  const cx = 24,
    fy = 50;
  el(g, cx, fy + 2, 16, 4, "#000", 0.12);
  rr(g, cx - 10, fy - 8, 20, 8, 4, PANTS); // đùi
  rr(g, cx - 10, fy - 3, 8, 6, 3, BOOT);
  rr(g, cx + 2, fy - 3, 8, 6, 3, BOOT);
  rr(g, cx - 9, fy - 24, 18, 17, 5, SHIRT[gender]);
  rr(g, cx - 9, fy - 15, 18, 7, { bl: 4, br: 4 }, PANTS);
  rr(g, cx - 12, fy - 21, 5, 12, 2.5, SHIRT[gender]);
  rr(g, cx + 7, fy - 21, 5, 12, 2.5, SHIRT[gender]);
  ci(g, cx - 9.5, fy - 9, 2.8, SKIN);
  ci(g, cx + 9.5, fy - 9, 2.8, SKIN);
  ci(g, cx, fy - 33, 10.5, SKIN);
  g.fillStyle(HAIR[gender], 1);
  g.fillCircle(cx, fy - 36.2, 10.6);
  ci(g, cx - 3.6, fy - 31.8, 1.7, "#3a2a20");
  ci(g, cx + 3.6, fy - 31.8, 1.7, "#3a2a20");
  ci(g, cx - 6.2, fy - 28.8, 2, "#f5a0a0", 0.55);
  ci(g, cx + 6.2, fy - 28.8, 2, "#f5a0a0", 0.55);
  if (gender === "female") {
    rr(g, cx - 12.5, fy - 35, 5, 14, 2.5, HAIR[gender]);
    rr(g, cx + 7.5, fy - 35, 5, 14, 2.5, HAIR[gender]);
  }
}

/* ================= THÚ CƯNG ================= */
const COATS = {
  white: { body: "#f7f3ec", shade: "#e0d8cc", ear: "#f0b8c0" },
  tan: { body: "#e8b878", shade: "#c99858", ear: "#c9885a", belly: "#f7ecd8" },
  gray: { body: "#9aa3b2", shade: "#7f8899", ear: "#f0b8c0" },
  orange: {
    body: "#e8a35a",
    shade: "#c9853f",
    ear: "#f0b8c0",
    stripe: "#c97a2a",
  },
};

function drawRabbit(g, anim, f, coat) {
  const C = COATS[coat],
    cx = 24,
    fy = 34;
  el(g, cx, fy + 2, 15, 3.5, "#000", 0.13);
  const hop = anim === "hop" ? (f % 2 === 0 ? 0 : -5) : 0;
  const stretch = anim === "hop" && f % 2 === 1;
  // đuôi
  ci(g, cx + 11, fy - 6 + hop, 3.5, "#fff");
  // thân
  el(g, cx + 1, fy - 6 + hop, stretch ? 13 : 11, stretch ? 6.5 : 8, C.body);
  el(g, cx + 3, fy - 4 + hop, 7, 4, C.shade, 0.5);
  // chân
  if (anim === "sit") {
    el(g, cx - 4, fy - 1, 7, 4, C.body);
    el(g, cx + 6, fy - 1, 7, 4, C.body);
  } else if (anim === "sleep") {
    // cuộn tròn
  } else {
    rr(g, cx - 7, fy - 3 + hop, 5, 5, 2.5, C.body);
    rr(g, cx + 4, fy - 3 + hop + (f % 2) * 1.5, 5, 5, 2.5, C.body);
  }
  if (anim === "sleep") {
    el(g, cx, fy - 5, 13, 7.5, C.body);
    el(g, cx + 8, fy - 8, 6, 3, C.body); // tai dẹt
    ln(
      g,
      [
        [cx - 4, fy - 6],
        [cx - 1.5, fy - 6],
      ],
      "#7a5a4a",
      1.3,
    );
    ln(
      g,
      [
        [cx + 1, fy - 2],
        [cx + 5, fy - 3],
      ],
      C.shade,
      1,
    );
    return;
  }
  // đầu
  const hx = cx - 7,
    hy = anim === "sit" || anim === "eat" ? fy - 15 : fy - 13;
  ci(g, hx, hy + hop, 7, C.body);
  // tai
  if (anim === "eat") {
    el(g, hx - 2, hy - 11 + hop, 2.6, 6, C.body);
    el(g, hx + 3, hy - 11 + hop, 2.6, 6, C.body);
    el(g, hx - 2, hy - 11 + hop, 1.2, 4, C.ear);
    el(g, hx + 3, hy - 11 + hop, 1.2, 4, C.ear);
  } else {
    el(g, hx - 3, hy - 10 + hop, 2.6, 6.5, C.body);
    el(g, hx + 2.5, hy - 10 + hop + 1, 2.6, 6, C.body);
    el(g, hx - 3, hy - 10 + hop, 1.2, 4.2, C.ear);
    el(g, hx + 2.5, hy - 10 + hop + 1, 1.2, 3.8, C.ear);
  }
  // mặt
  ci(g, hx - 2.5, hy - 1 + hop, 1.2, "#3a2a20");
  ci(g, hx + 2.5, hy - 1 + hop, 1.2, "#3a2a20");
  ci(g, hx, hy + 1.5 + hop, 1.4, "#f0909a");
  if (anim === "eat") {
    // củ cà rốt
    g.fillStyle("#f2853c", 1);
    g.fillTriangle(
      hx - 1,
      hy + 4 + hop,
      hx + 5,
      hy + 3 + hop,
      hx + 1,
      hy + 8 + hop,
    );
    if (f % 2 === 1) ci(g, hx + 5, hy + 2 + hop, 1.4, "#6aa854");
  }
}

function drawDog(g, anim, f, coat) {
  const C = COATS[coat],
    cx = 24,
    fy = 36;
  el(g, cx, fy + 2, 17, 4, "#000", 0.13);
  const step = f % 2;
  if (anim === "sleep") {
    el(g, cx, fy - 5, 15, 8, C.body);
    ci(g, cx - 9, fy - 8, 6.5, C.body);
    el(g, cx - 13, fy - 11, 3, 5, C.ear);
    ln(
      g,
      [
        [cx - 11, fy - 8],
        [cx - 8.5, fy - 8],
      ],
      "#4a3121",
      1.3,
    );
    rr(g, cx - 4, fy - 11, 12, 4, 2, C.shade, 0.5);
    return;
  }
  if (anim === "sit") {
    el(g, cx + 2, fy - 8, 10, 9, C.body);
    el(g, cx + 2, fy - 5, 6, 5, C.belly || "#f7ecd8");
    rr(g, cx - 6, fy - 4, 5, 6, 2.5, C.body);
    rr(g, cx + 1, fy - 4, 5, 6, 2.5, C.body);
    ci(g, cx - 1, fy - 17, 8, C.body);
    el(g, cx - 6.5, fy - 22, 3, 5.5, C.ear);
    el(g, cx + 4.5, fy - 22, 3, 5.5, C.ear);
    ci(g, cx - 3.5, fy - 18, 1.4, "#3a2a20");
    ci(g, cx + 1.5, fy - 18, 1.4, "#3a2a20");
    el(g, cx - 1, fy - 14.5, 3.4, 2.6, C.belly || "#f7ecd8");
    ci(g, cx - 1, fy - 15.4, 1.6, "#4a3121");
    // đuôi vẫy
    el(g, cx + 11, fy - 10 + step * 2, 4.5, 2.6, C.shade);
    return;
  }
  // đi lại / happy
  const wag = anim === "happy" ? (step ? 4 : -4) : step ? 2 : -2;
  el(g, cx + 12, fy - 12 + wag * 0.3, 4.5, 2.4, C.body); // đuôi cuộn
  el(g, cx + 1, fy - 9, 12, 7.5, C.body);
  el(g, cx + 1, fy - 6, 8, 4, C.belly || "#f7ecd8", 0.9);
  // chân
  rr(g, cx - 8 + step * 2, fy - 5, 4.5, 6, 2, C.body);
  rr(g, cx - 1 - step * 2, fy - 5, 4.5, 6, 2, C.shade);
  rr(g, cx + 5 + step * 2, fy - 5, 4.5, 6, 2, C.body);
  // đầu
  const bobH = anim === "happy" ? step * 1.6 : 0;
  ci(g, cx - 8, fy - 16 - bobH, 8, C.body);
  el(g, cx - 13, fy - 21 - bobH, 3.2, 5.6, C.ear);
  el(g, cx - 2.5, fy - 21 - bobH, 3.2, 5.6, C.ear);
  el(g, cx - 8, fy - 13 - bobH, 4, 3, C.belly || "#f7ecd8");
  if (anim === "happy") {
    ln(
      g,
      [
        [cx - 11, fy - 17 - bobH],
        [cx - 8.5, fy - 18 - bobH],
      ],
      "#4a3121",
      1.4,
    );
    ln(
      g,
      [
        [cx - 7, fy - 18 - bobH],
        [cx - 4.5, fy - 17 - bobH],
      ],
      "#4a3121",
      1.4,
    );
  } else {
    ci(g, cx - 10.5, fy - 17 - bobH, 1.4, "#3a2a20");
    ci(g, cx - 5.5, fy - 17 - bobH, 1.4, "#3a2a20");
  }
  ci(g, cx - 8, fy - 13.6 - bobH, 1.7, "#4a3121");
  if (anim === "happy" && step) {
    ci(g, cx - 8, fy - 9.5 - bobH, 1.5, "#f08080");
  }
}

function drawCat(g, anim, f, coat) {
  const C = COATS[coat],
    cx = 24,
    fy = 34;
  el(g, cx, fy + 2, 15, 3.6, "#000", 0.13);
  const step = f % 2;
  if (anim === "sleep") {
    el(g, cx, fy - 6, 12, 7.5, C.body);
    // đuôi quấn quanh
    g.lineStyle(3.6, C.shade, 1);
    g.beginPath();
    g.arc(cx, fy - 5, 10.5, 0.15 * Math.PI, 0.95 * Math.PI);
    g.strokePath();
    // tai
    g.fillStyle(C.body, 1);
    g.fillTriangle(cx - 9, fy - 11, cx - 6, fy - 16, cx - 3, fy - 11);
    g.fillTriangle(cx - 1, fy - 11, cx + 2, fy - 16, cx + 5, fy - 11);
    ln(
      g,
      [
        [cx - 5, fy - 6],
        [cx - 2, fy - 6],
      ],
      "#4a3121",
      1.3,
    );
    return;
  }
  // đuôi
  const tailUp = anim === "sit" ? -8 : step ? -3 : -7;
  g.lineStyle(3.4, C.body, 1);
  g.beginPath();
  g.moveTo(cx + 11, fy - 8);
  g.lineTo(cx + 14, fy - 9 + tailUp * 0.15);
  g.lineTo(cx + 15.5, fy - 11 + tailUp * 0.45);
  g.lineTo(cx + 16, fy - 14 + tailUp);
  g.strokePath();
  if (anim === "sit") {
    el(g, cx + 1, fy - 8, 10, 9.5, C.body);
    rr(g, cx - 6, fy - 4, 5, 6, 2.5, C.body);
    rr(g, cx + 1, fy - 4, 5, 6, 2.5, C.body);
    if (C.stripe) {
      ln(
        g,
        [
          [cx - 2, fy - 15],
          [cx - 2, fy - 10],
        ],
        C.stripe,
        2,
      );
      ln(
        g,
        [
          [cx + 4, fy - 14],
          [cx + 4, fy - 9],
        ],
        C.stripe,
        2,
      );
    }
    ci(g, cx - 2, fy - 16, 7.5, C.body);
    g.fillStyle(C.body, 1);
    g.fillTriangle(cx - 8, fy - 20, cx - 6, fy - 26, cx - 2, fy - 21);
    g.fillTriangle(cx + 2, fy - 21, cx + 5, fy - 26, cx + 7, fy - 20);
    g.fillStyle(C.ear, 1);
    g.fillTriangle(cx - 6.6, fy - 21, cx - 5.6, fy - 24, cx - 3.6, fy - 21.4);
    g.fillTriangle(cx + 3.2, fy - 21.4, cx + 4.6, fy - 24, cx + 5.8, fy - 21);
    const groom = anim === "groom";
    if (groom && step) {
      ci(g, cx - 4.8, fy - 16, 1.2, "#3a2a20");
      ci(g, cx + 0.8, fy - 16, 1.2, "#3a2a20");
      ci(g, cx - 2, fy - 11.5, 2.2, "#f0909a"); // liếm chân
      rr(g, cx - 7, fy - 13, 6, 3, 1.5, C.body);
    } else {
      ci(g, cx - 4.8, fy - 16.5, 1.3, "#3a2a20");
      ci(g, cx + 0.8, fy - 16.5, 1.3, "#3a2a20");
      ci(g, cx - 2, fy - 13.6, 1.2, "#e88a94");
    }
    ln(
      g,
      [
        [cx - 9, fy - 14],
        [cx - 12, fy - 15],
      ],
      "#d9cfc2",
      0.8,
    );
    ln(
      g,
      [
        [cx + 5, fy - 14],
        [cx + 8, fy - 15],
      ],
      "#d9cfc2",
      0.8,
    );
    return;
  }
  // đi lại
  el(g, cx + 1, fy - 8, 11, 6.5, C.body);
  if (C.stripe) {
    ln(
      g,
      [
        [cx - 2, fy - 13],
        [cx - 2, fy - 8],
      ],
      C.stripe,
      2,
    );
    ln(
      g,
      [
        [cx + 3, fy - 12.5],
        [cx + 3, fy - 7.5],
      ],
      C.stripe,
      2,
    );
  }
  rr(g, cx - 7 + step * 2.4, fy - 4, 4, 5, 2, C.body);
  rr(g, cx - 1 - step * 2.4, fy - 4, 4, 5, 2, C.shade);
  rr(g, cx + 4 + step * 2.4, fy - 4, 4, 5, 2, C.body);
  ci(g, cx - 8, fy - 14, 7, C.body);
  g.fillStyle(C.body, 1);
  g.fillTriangle(cx - 13, fy - 18, cx - 11.5, fy - 24, cx - 7, fy - 19);
  g.fillTriangle(cx - 6, fy - 19.5, cx - 3, fy - 24, cx - 1.5, fy - 18);
  ci(g, cx - 10.5, fy - 14.5, 1.3, "#3a2a20");
  ci(g, cx - 5.5, fy - 14.5, 1.3, "#3a2a20");
  ci(g, cx - 8, fy - 11.8, 1.1, "#e88a94");
}

/* ================= CÂY TRỒNG ================= */
function drawCropStage(g, crop, stage) {
  const C = crop.colors;
  el(g, 24, 42, 14, 3.5, "#000", 0.15);
  if (stage === 0) {
    // hạt
    el(g, 24, 40, 9, 3.5, "#6b4a34");
    el(g, 24, 39, 6, 2.2, "#7d5a40");
    ci(g, 24, 38.5, 2, "#e8d9bd");
    return;
  }
  if (stage === 1) {
    // mầm
    ln(
      g,
      [
        [24, 40],
        [24, 33],
      ],
      "#5fae4c",
      2,
    );
    el(g, 20.5, 32, 4.5, 2.6, C.leaf || "#6aa854");
    el(g, 27.5, 32, 4.5, 2.6, C.leaf || "#6aa854");
    return;
  }
  if (stage === 2) {
    // đang lớn
    ln(
      g,
      [
        [24, 41],
        [24, 28],
      ],
      "#4f9a40",
      2.4,
    );
    el(g, 18, 30, 6, 3.4, C.leaf || "#6aa854");
    el(g, 30, 30, 6, 3.4, C.leaf || "#6aa854");
    el(g, 20, 25, 5, 3, C.leaf || "#6aa854");
    el(g, 28, 25, 5, 3, C.leaf || "#6aa854");
    return;
  }
  const ready = stage === 4;
  const dim = ready ? 1 : 0.75;
  if (ready) el(g, 24, 34, 20, 13, "#fff", 0.1);
  const main = shade(C.main, dim),
    acc = shade(C.accent || C.main, dim);
  switch (crop.type) {
    case "root": {
      el(g, 24, 40, 7, 4.5, main);
      el(g, 24, 38.6, 4.5, 2.4, acc);
      for (let i = -1; i <= 1; i++) {
        ln(
          g,
          [
            [24 + i * 4, 38],
            [24 + i * 6, 28 - Math.abs(i) * 2],
          ],
          C.leaf,
          2.4,
        );
        el(g, 24 + i * 6, 27 - Math.abs(i) * 2, 3.5, 2.4, C.leaf);
      }
      break;
    }
    case "leaf":
    case "bush": {
      ci(g, 19, 35, 6, shade(C.leaf, dim));
      ci(g, 29, 35, 6, shade(C.leaf, dim));
      ci(g, 24, 31, 7, C.leaf);
      if (crop.type === "bush") {
        ci(g, 20, 32, 2.6, main);
        ci(g, 27, 35, 2.6, main);
        ci(g, 25, 29, 2.6, acc);
      }
      break;
    }
    case "vine": {
      ln(
        g,
        [
          [24, 41],
          [24, 18],
        ],
        "#4f9a40",
        2.6,
      );
      ln(
        g,
        [
          [24, 30],
          [17, 27],
        ],
        "#4f9a40",
        2,
      );
      ln(
        g,
        [
          [24, 24],
          [31, 21],
        ],
        "#4f9a40",
        2,
      );
      el(g, 16, 26, 5, 3, C.leaf);
      el(g, 32, 20, 5, 3, C.leaf);
      ci(g, 20, 34, 4.2, main);
      ci(g, 28, 27, 4.2, main);
      ci(g, 24, 20, 3.6, acc);
      ci(g, 18.6, 32.6, 1.3, "#fff", 0.5);
      ci(g, 26.6, 25.6, 1.3, "#fff", 0.5);
      break;
    }
    case "tall": {
      ln(
        g,
        [
          [24, 42],
          [24, 12],
        ],
        "#5fae4c",
        3,
      );
      el(g, 17, 30, 7, 3, C.leaf);
      el(g, 31, 24, 7, 3, C.leaf);
      el(g, 24, 15, 5, 8, main); // bắp
      ln(
        g,
        [
          [22, 11],
          [26, 9],
        ],
        C.leaf,
        2,
      );
      ln(
        g,
        [
          [22, 10],
          [25, 7.5],
        ],
        C.leaf,
        2,
      );
      break;
    }
    case "flower": {
      ln(
        g,
        [
          [24, 41],
          [24, 22],
        ],
        "#4f9a40",
        2.6,
      );
      el(g, 18.5, 32, 5.5, 2.8, C.leaf);
      el(g, 29.5, 34, 5.5, 2.8, C.leaf);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        el(g, 24 + Math.cos(a) * 6, 18 + Math.sin(a) * 6, 4.6, 4.6, main);
      }
      ci(g, 24, 18, 4, acc);
      if (ready) ci(g, 24, 18, 1.6, "#fff", 0.7);
      break;
    }
    case "gourd": {
      g.lineStyle(2.6, "#6a7a3a", 1);
      g.beginPath();
      g.moveTo(10, 40);
      g.lineTo(14, 37);
      g.lineTo(19, 34);
      g.lineTo(24, 32);
      g.lineTo(29, 31);
      g.lineTo(34, 29);
      g.lineTo(38, 28);
      g.strokePath();
      el(g, 15, 37, 5, 3, C.leaf);
      el(g, 33, 30, 5, 3, C.leaf);
      el(g, 24, 33, 13, 10.5, main);
      ln(
        g,
        [
          [24, 23.5],
          [24, 42],
        ],
        acc,
        2,
        0.8,
      );
      ln(
        g,
        [
          [18.5, 25],
          [18.5, 41],
        ],
        acc,
        1.6,
        0.6,
      );
      ln(
        g,
        [
          [29.5, 25],
          [29.5, 41],
        ],
        acc,
        1.6,
        0.6,
      );
      rr(g, 22.6, 20, 3, 4.5, 1.5, "#6a7a3a");
      el(g, 20, 28, 3.5, 2.2, "#fff", 0.35);
      break;
    }
    case "star": {
      ln(
        g,
        [
          [24, 41],
          [24, 24],
        ],
        "#5fae8a",
        2.6,
      );
      el(g, 18, 34, 5.5, 2.8, C.leaf);
      el(g, 30, 36, 5.5, 2.8, C.leaf);
      if (ready) el(g, 24, 17, 20, 16, "#b48ae8", 0.22);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const x = 24 + Math.cos(a) * 7,
          y = 17 + Math.sin(a) * 7;
        g.fillStyle(main, 1);
        g.fillTriangle(
          24,
          17,
          x - Math.sin(a) * 3.4,
          y + Math.cos(a) * 3.4,
          x + Math.sin(a) * 3.4,
          y - Math.cos(a) * 3.4,
        );
        el(g, x, y, 3.4, 3.4, main);
      }
      ci(g, 24, 17, 3.4, acc);
      if (ready) {
        ci(g, 17, 11, 1.4, "#fff", 0.9);
        ci(g, 32, 20, 1.2, "#fff", 0.9);
      }
      break;
    }
  }
  if (!ready && stage === 3) {
    /* mature nhưng chưa thu hoạch: đã vẽ dim */
  }
}
function shade(hex, mul) {
  if (mul >= 0.999) return hex;
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * mul),
    g2 = Math.round(((n >> 8) & 255) * mul),
    b = Math.round((n & 255) * mul);
  return `rgb(${r},${g2},${b})`;
}

/* ================= ICON VẬT PHẨM ================= */
function drawIcon(g, id) {
  if (id.startsWith("seed_")) {
    const cropId = id.replace("seed_", "");
    const crop = cropId ? window.__CROPS?.[cropId] : null;
    rr(g, 9, 7, 30, 34, 5, "#fdf6e9");
    rr(
      g,
      9,
      7,
      30,
      10,
      { tl: 5, tr: 5, bl: 0, br: 0 },
      crop ? crop.colors.main : "#a8c686",
    );
    ci(g, 24, 27, 6.5, crop ? crop.colors.main : "#7ba05b");
    ci(g, 22, 25, 2, "#fff", 0.5);
    ln(
      g,
      [
        [13, 20],
        [35, 20],
      ],
      "#e0d0b0",
      1,
    );
    return;
  }
  switch (id) {
    case "hoe":
      ln(
        g,
        [
          [14, 36],
          [30, 12],
        ],
        "#8a5a3a",
        4,
      );
      rr(g, 26, 8, 12, 7, 3, "#9aa3b2");
      break;
    case "can":
      rr(g, 12, 18, 22, 16, 5, "#5db6d4");
      ln(
        g,
        [
          [34, 22],
          [42, 14],
        ],
        "#5db6d4",
        4,
      );
      ci(g, 42, 13, 3, "#4a9ab5");
      g.lineStyle(3, "#4a9ab5", 1);
      g.beginPath();
      g.arc(20, 16, 7, Math.PI, 0);
      g.strokePath();
      break;
    case "rod":
      ln(
        g,
        [
          [10, 38],
          [36, 10],
        ],
        "#8a5a3a",
        3.4,
      );
      ln(
        g,
        [
          [36, 10],
          [38, 30],
        ],
        "#d9d0c0",
        1.4,
      );
      ci(g, 38, 32, 3, "#f5c542");
      break;
    case "net":
      ln(
        g,
        [
          [14, 38],
          [26, 18],
        ],
        "#8a5a3a",
        3.4,
      );
      g.lineStyle(3, "#9aa3b2", 1);
      g.strokeCircle(30, 13, 8);
      g.lineStyle(1, "#c9d4dd", 0.8);
      g.strokeCircle(30, 13, 4);
      break;
    case "food_rabbit":
      g.fillStyle("#f2853c", 1);
      g.fillTriangle(16, 14, 32, 12, 26, 36);
      ln(
        g,
        [
          [24, 12],
          [28, 6],
        ],
        "#6aa854",
        3,
      );
      ln(
        g,
        [
          [25, 12],
          [20, 7],
        ],
        "#6aa854",
        3,
      );
      break;
    case "food_dog":
      rr(g, 10, 20, 28, 12, 6, "#c9885a");
      ci(g, 14, 19, 4, "#c9885a");
      ci(g, 34, 19, 4, "#c9885a");
      ci(g, 18, 26, 1.6, "#f7ecd8");
      ci(g, 26, 24, 1.6, "#f7ecd8");
      ci(g, 30, 28, 1.6, "#f7ecd8");
      break;
    case "food_cat":
      rr(g, 13, 14, 22, 24, 4, "#5db6d4");
      rr(g, 13, 14, 22, 7, { tl: 4, tr: 4 }, "#4a9ab5");
      el(g, 24, 29, 6, 4, "#f7ecd8");
      ci(g, 21.5, 26.5, 1.5, "#e8a35a");
      ci(g, 26.5, 26.5, 1.5, "#e8a35a");
      ci(g, 24, 31, 1.5, "#e8a35a");
      break;
    case "clover":
      ci(g, 20, 20, 6, "#6aa854");
      ci(g, 28, 20, 6, "#6aa854");
      ci(g, 24, 27, 6, "#6aa854");
      ln(
        g,
        [
          [24, 28],
          [24, 38],
        ],
        "#4f9a40",
        2.4,
      );
      break;
    case "dandelion":
      ci(g, 24, 20, 9, "#fff", 0.9);
      ci(g, 24, 20, 3.4, "#f5c542");
      ln(
        g,
        [
          [24, 29],
          [24, 40],
        ],
        "#6aa854",
        2.4,
      );
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ln(
          g,
          [
            [24 + Math.cos(a) * 4, 20 + Math.sin(a) * 4],
            [24 + Math.cos(a) * 9, 20 + Math.sin(a) * 9],
          ],
          "#fff",
          1.2,
        );
      }
      break;
    case "shell":
      g.fillStyle("#f2d9c9", 1);
      g.beginPath();
      g.arc(24, 30, 13, Math.PI, 0);
      g.fill();
      for (let i = -2; i <= 2; i++)
        ln(
          g,
          [
            [24, 30],
            [24 + i * 5.5, 18.5],
          ],
          "#d9a894",
          1.6,
        );
      break;
    case "mushroom":
      rr(g, 20, 24, 8, 14, 3, "#f2e8d8");
      el(g, 24, 22, 14, 8, "#e8543f");
      ci(g, 19, 20, 2.4, "#fff");
      ci(g, 28, 19, 2, "#fff");
      ci(g, 24, 24, 1.8, "#fff");
      break;
    case "apple":
      ci(g, 24, 26, 11, "#e8543f");
      ci(g, 20, 22, 3.4, "#fff", 0.4);
      rr(g, 23, 12, 2.6, 6, 1.3, "#6a4a2a");
      el(g, 28, 13, 4.5, 2.4, "#6aa854");
      break;
    case "pinecone":
      for (let r = 0; r < 4; r++)
        for (let c2 = 0; c2 < 3 - Math.floor(r / 2); c2++)
          el(
            g,
            18 + c2 * 6 + (r % 2) * 3,
            16 + r * 6,
            4,
            4.6,
            r % 2 ? "#8a5a3a" : "#a06a42",
          );
      break;
    case "holly":
      el(g, 17, 24, 7, 5, "#3f8c3e");
      el(g, 30, 22, 7, 5, "#3f8c3e");
      ci(g, 23, 30, 4, "#e8323f");
      ci(g, 28, 28, 3.4, "#e8323f");
      ci(g, 25, 25, 3, "#c9202f");
      break;
    case "bug_common":
    case "bug_rare": {
      const c = id === "bug_rare" ? "#e8963c" : "#8fd4e8";
      const c2 = id === "bug_rare" ? "#c94f35" : "#5db6d4";
      el(g, 16, 22, 9, 11, c);
      el(g, 32, 22, 9, 11, c);
      el(g, 17, 31, 6, 7, c2);
      el(g, 31, 31, 6, 7, c2);
      rr(g, 22.6, 16, 2.8, 20, 1.4, "#4a3121");
      ci(g, 24, 14, 2.6, "#4a3121");
      if (id === "bug_rare") {
        ln(
          g,
          [
            [13, 18],
            [20, 24],
          ],
          "#3a2a20",
          1.6,
        );
        ln(
          g,
          [
            [35, 18],
            [28, 24],
          ],
          "#3a2a20",
          1.6,
        );
      }
      break;
    }
    case "flower_pot":
      rr(g, 15, 22, 18, 6, 2, "#c97a5a");
      g.fillStyle("#b5623f", 1);
      g.fillTriangle(16, 28, 32, 28, 29, 38);
      g.fillStyle("#b5623f", 1);
      g.fillTriangle(16, 28, 32, 28, 19, 38);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        ci(g, 24 + Math.cos(a) * 4.5, 15 + Math.sin(a) * 4.5, 3.4, "#e884a8");
      }
      ci(g, 24, 15, 2.8, "#f5c542");
      ln(
        g,
        [
          [24, 22],
          [24, 18],
        ],
        "#4f9a40",
        2,
      );
      break;
    case "lantern":
      rr(g, 21, 10, 6, 3, 1.5, "#5c626e");
      rr(g, 17, 13, 14, 20, 3, "#5c626e");
      rr(g, 19.5, 15.5, 9, 15, 2, "#f5c542");
      ci(g, 24, 23, 4.4, "#ffe9a8");
      rr(g, 19, 33, 10, 3, 1.5, "#5c626e");
      break;
    case "gnome":
      el(g, 24, 34, 14, 7, "#5db6d4");
      ci(g, 24, 24, 6.5, SKIN);
      g.fillStyle("#e8323f", 1);
      g.fillTriangle(15, 22, 33, 22, 24, 4);
      el(g, 24, 29, 6, 3.4, "#fff");
      ci(g, 22, 23, 1.2, "#3a2a20");
      ci(g, 26, 23, 1.2, "#3a2a20");
      break;
    case "bench":
      rr(g, 10, 18, 28, 5, 2, "#a07a4a");
      rr(g, 10, 26, 28, 4, 2, "#a07a4a");
      rr(g, 12, 30, 4, 8, 1, "#8a6238");
      rr(g, 32, 30, 4, 8, 1, "#8a6238");
      ln(
        g,
        [
          [11, 23],
          [37, 23],
        ],
        "#8a6238",
        2,
      );
      break;
    case "flour":
      rr(g, 14, 12, 20, 26, 4, "#f2e8d8");
      rr(g, 14, 12, 20, 6, { tl: 4, tr: 4 }, "#d9c9a8");
      ci(g, 24, 27, 5, "#fff");
      break;
    case "milk":
      rr(g, 17, 14, 14, 24, 3, "#fff");
      g.fillStyle("#5db6d4", 1);
      g.fillTriangle(17, 14, 31, 14, 24, 7);
      rr(g, 17, 26, 14, 6, 0, "#bfe0f2");
      break;
    case "egg":
      el(g, 24, 26, 9, 12, "#f7ecd8");
      el(g, 21, 22, 3, 4, "#fff", 0.7);
      break;
    case "coin":
      ci(g, 24, 24, 12, "#f5c542");
      ci(g, 24, 24, 9, "#e8b02e");
      ci(g, 21, 21, 3, "#fff", 0.5);
      break;
    case "star": {
      g.fillStyle("#f5c542", 1);
      const pts = [];
      for (let i = 0; i < 10; i++) {
        const r = i % 2 ? 6 : 13,
          a = (i / 10) * Math.PI * 2 - Math.PI / 2;
        pts.push([24 + Math.cos(a) * r, 24 + Math.sin(a) * r]);
      }
      g.fillPoints(
        pts.map((p) => new Phaser.Geom.Point(p[0], p[1])),
        true,
      );
      break;
    }
    case "heart":
      ci(g, 19, 20, 7, "#ff8aa0");
      ci(g, 29, 20, 7, "#ff8aa0");
      g.fillStyle("#ff8aa0", 1);
      g.fillTriangle(12.5, 23, 35.5, 23, 24, 36);
      break;
    default:
      rr(g, 12, 12, 24, 24, 6, "#d9c9a8");
  }
}

/* ================= MÔI TRƯỜNG ================= */
function drawGrassTile(g, season, variant, rng) {
  g.fillStyle(season.grass[variant % 3], 1);
  g.fillRect(0, 0, 48, 48);
  for (let i = 0; i < 7; i++) {
    const x = rng() * 44 + 2,
      y = rng() * 44 + 2;
    g.fillStyle(season.grassDeco, 0.5);
    g.fillRect(x, y, 2.4, 2.4);
  }
  for (let i = 0; i < 4; i++) {
    const x = rng() * 40 + 4,
      y = rng() * 40 + 4;
    g.lineStyle(1.6, season.grassDeco, 0.8);
    g.beginPath();
    g.moveTo(x, y + 4);
    g.lineTo(x + (rng() - 0.5) * 3, y - 2);
    g.strokePath();
  }
  if (variant === 2) {
    // hoa nhỏ
    const fx = 10 + rng() * 26,
      fy = 10 + rng() * 26;
    const fc = season.flower[Math.floor(rng() * season.flower.length)];
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      ci(g, fx + Math.cos(a) * 2.4, fy + Math.sin(a) * 2.4, 1.8, fc);
    }
    ci(g, fx, fy, 1.4, "#f5c542");
  }
  if (variant === 1 && season.id === "autumn") {
    // lá rụng
    for (let i = 0; i < 3; i++)
      el(
        g,
        rng() * 40 + 4,
        rng() * 40 + 4,
        3,
        1.8,
        season.leafAlt[Math.floor(rng() * 2)],
        0.8,
      );
  }
  if (variant === 1 && season.id === "winter") {
    // đốm tuyết dày
    for (let i = 0; i < 5; i++)
      ci(g, rng() * 44 + 2, rng() * 44 + 2, 2.4 + rng() * 2, "#fff", 0.8);
  }
}

function drawTree(g, season, variant, maple = false) {
  // khung 96x110, gốc tại (48, 100)
  el(g, 48, 102, 34, 8, "#000", 0.16);
  const leaves = maple ? season.leafAlt : season.leaf;
  if (season.id === "winter" && !maple) {
    // cây trụi
    g.lineStyle(7, "#7a6a5a", 1);
    g.beginPath();
    g.moveTo(48, 100);
    g.lineTo(48, 58);
    g.strokePath();
    g.lineStyle(4.5, "#7a6a5a", 1);
    g.beginPath();
    g.moveTo(48, 76);
    g.lineTo(32, 58);
    g.strokePath();
    g.beginPath();
    g.moveTo(48, 68);
    g.lineTo(64, 50);
    g.strokePath();
    g.beginPath();
    g.moveTo(48, 60);
    g.lineTo(40, 44);
    g.strokePath();
    el(g, 32, 57, 7, 3, "#e8f0f5");
    el(g, 64, 49, 8, 3.4, "#e8f0f5");
    el(g, 48, 57, 6, 3, "#e8f0f5");
    el(g, 40, 43, 6, 3, "#e8f0f5");
    return;
  }
  rr(g, 42, 70, 12, 32, 5, "#8a6248");
  rr(g, 42, 70, 5, 32, { tl: 5, bl: 5 }, "#7a543c");
  ln(
    g,
    [
      [48, 84],
      [44, 78],
    ],
    "#6a4632",
    2,
  );
  ln(
    g,
    [
      [50, 92],
      [54, 86],
    ],
    "#6a4632",
    2,
  );
  const blobs = [
    [48, 34, 24],
    [28, 48, 18],
    [68, 48, 18],
    [48, 58, 20],
    [36, 36, 15],
    [62, 36, 15],
  ];
  blobs.forEach(([x, y, r], i) => ci(g, x, y, r, leaves[i % leaves.length]));
  for (let i = 0; i < 6; i++)
    ci(g, 30 + ((i * 37) % 40), 30 + ((i * 23) % 30), 2.4, "#fff", 0.25);
  if (season.id === "winter") {
    // tuyết phủ tán
    el(g, 48, 26, 34, 8, "#fff", 0.9);
    el(g, 30, 42, 18, 5, "#fff", 0.85);
    el(g, 66, 42, 18, 5, "#fff", 0.85);
  }
  if (maple && season.id === "autumn") {
    for (let i = 0; i < 5; i++)
      el(g, 24 + i * 12, 66 + (i % 2) * 5, 3, 2, "#c94f35", 0.9);
  }
}

function drawHouse(g, winter = false) {
  // khung 384 x 336. Trệt: y 150-300. Tầng 2: y 60-150. Mái: 0-70
  el(g, 192, 318, 190, 16, "#000", 0.16);
  // tường 2 tầng
  rr(g, 42, 66, 300, 240, 6, "#f6e7cf");
  rr(g, 42, 66, 300, 10, 3, "#e8d5b5");
  for (let i = 0; i < 10; i++)
    ln(
      g,
      [
        [42, 84 + i * 22],
        [342, 84 + i * 22],
      ],
      "#e8d5b5",
      2,
    );
  // móng đá
  rr(g, 36, 296, 312, 16, 4, "#b5a892");
  for (let i = 0; i < 8; i++)
    rr(g, 42 + i * 38, 298, 30, 11, 3, i % 2 ? "#a89a82" : "#c2b5a0");
  // khung gỗ
  rr(g, 42, 148, 300, 8, 2, "#b98a5e");
  rr(g, 42, 66, 8, 240, 2, "#b98a5e");
  rr(g, 334, 66, 8, 240, 2, "#b98a5e");
  // MÁI
  g.fillStyle("#c05a48", 1);
  g.fillTriangle(18, 78, 192, 4, 366, 78);
  g.fillStyle("#d9705a", 1);
  g.fillTriangle(28, 72, 192, 10, 356, 72);
  for (let r = 0; r < 3; r++) {
    const y = 30 + r * 15,
      half = 40 + r * 52;
    for (let x = 192 - half; x < 192 + half; x += 17) {
      g.fillStyle(r % 2 ? "#c05a48" : "#d9705a", 1);
      g.beginPath();
      g.arc(x + 8, y + 8, 9, Math.PI, 0);
      g.fill();
    }
  }
  rr(g, 14, 72, 356, 10, 4, "#a84a3a");
  // ống khói
  rr(g, 268, 16, 26, 44, 3, "#a08a78");
  rr(g, 264, 12, 34, 10, 3, "#8a7462");
  // Cửa sổ tầng 2 (3 cái) + ban công giữa
  const win = (x, y, w, h) => {
    rr(g, x - 4, y - 4, w + 8, h + 8, 4, "#b98a5e");
    rr(g, x, y, w, h, 3, "#bfe3f2");
    rr(g, x, y, w, h * 0.45, { tl: 3, tr: 3 }, "#d9f0fa");
    ln(
      g,
      [
        [x + w / 2, y],
        [x + w / 2, y + h],
      ],
      "#b98a5e",
      2.5,
    );
    ln(
      g,
      [
        [x, y + h / 2],
        [x + w, y + h / 2],
      ],
      "#b98a5e",
      2.5,
    );
    rr(g, x - 3, y + h + 2, w + 6, 6, 2, "#8a6248");
    // hoa ở hộp cửa
    for (let i = 0; i < 3; i++)
      ci(
        g,
        x + 8 + (i * (w - 16)) / 2,
        y + h + 3,
        3,
        i % 2 ? "#e884a8" : "#f5c542",
      );
  };
  win(70, 92, 46, 40);
  win(268, 92, 46, 40);
  // cửa sổ ban công giữa
  win(169, 88, 46, 44);
  // ban công
  rr(g, 150, 136, 84, 8, 3, "#a07a4a");
  for (let i = 0; i < 7; i++) rr(g, 154 + i * 12, 118, 4, 20, 2, "#b98a5e");
  rr(g, 150, 116, 84, 5, 2, "#a07a4a");
  // Cửa chính (tầng 1, giữa lệch trái)
  rr(g, 148, 208, 88, 100, { tl: 40, tr: 40, bl: 4, br: 4 }, "#b98a5e");
  rr(g, 156, 216, 72, 92, { tl: 34, tr: 34, bl: 3, br: 3 }, "#7ba05b");
  rr(g, 156, 216, 72, 92, { tl: 34, tr: 34, bl: 0, br: 0 }, "#6a8f4c");
  ci(g, 214, 266, 4.4, "#f5c542");
  rr(g, 176, 236, 32, 26, 4, "#bfe3f2");
  ln(
    g,
    [
      [192, 236],
      [192, 262],
    ],
    "#6a8f4c",
    2.4,
  );
  ln(
    g,
    [
      [176, 249],
      [208, 249],
    ],
    "#6a8f4c",
    2.4,
  );
  // vòng hoa trên cửa
  g.lineStyle(5, "#5fae4c", 1);
  g.strokeCircle(192, 228, 9);
  ci(g, 186, 222, 2.2, "#e8323f");
  ci(g, 198, 224, 2.2, "#e8323f");
  ci(g, 192, 236, 2.2, "#e8323f");
  // Cửa sổ tầng 1 hai bên + rèm
  win(66, 216, 52, 48);
  win(266, 216, 52, 48);
  // đèn hai bên cửa
  const lamp = (x) => {
    rr(g, x - 2, 220, 4, 8, 1, "#5c626e");
    rr(g, x - 6, 228, 12, 14, 3, "#5c626e");
    rr(g, x - 4, 230, 8, 10, 2, "#ffe9a8");
  };
  lamp(128);
  lamp(256);
  // thảm chùi chân
  el(g, 192, 316, 44, 10, "#c9a06a");
  el(g, 192, 316, 34, 7, "#b58a54");
  // dây thường xuân góc
  for (let i = 0; i < 6; i++) {
    ci(g, 48 + (i % 2) * 6, 90 + i * 14, 5, "#5fae4c");
    ci(g, 53 - (i % 2) * 5, 97 + i * 14, 4.4, "#6aa854");
  }
  if (winter) {
    g.fillStyle("#f2f6fa", 1);
    g.fillTriangle(28, 72, 192, 10, 356, 72);
    g.fillStyle("#e8eef5", 1);
    for (let x = 30; x < 350; x += 22) {
      g.beginPath();
      g.arc(x, 72, 10, Math.PI, 0);
      g.fill();
    }
    el(g, 192, 318, 170, 10, "#fff", 0.7);
    rr(g, 36, 294, 312, 6, 3, "#fff", 0.8);
  }
}

function drawFenceSeg(g, vertical = false) {
  if (!vertical) {
    rr(g, 2, 14, 5, 22, 2, "#a07a4a");
    rr(g, 41, 14, 5, 22, 2, "#a07a4a");
    rr(g, 0, 17, 48, 5, 2.5, "#b98a5e");
    rr(g, 0, 28, 48, 5, 2.5, "#b98a5e");
  } else {
    rr(g, 14, 2, 22, 5, 2, "#a07a4a");
    rr(g, 14, 41, 22, 5, 2, "#a07a4a");
    rr(g, 17, 0, 5, 48, 2.5, "#b98a5e");
    rr(g, 28, 0, 5, 48, 2.5, "#b98a5e");
  }
}

function drawHutch(g) {
  // chuồng thỏ
  el(g, 48, 86, 46, 8, "#000", 0.15);
  rr(g, 12, 30, 72, 52, 5, "#c9a06a");
  rr(g, 12, 30, 72, 10, { tl: 5, tr: 5 }, "#b58a54");
  g.fillStyle("#a07a4a", 1);
  g.fillTriangle(6, 34, 48, 8, 90, 34);
  g.fillStyle("#b98a5e", 1);
  g.fillTriangle(12, 32, 48, 12, 84, 32);
  rr(g, 20, 44, 26, 32, { tl: 12, tr: 12 }, "#5c4a3d"); // cửa tối
  rr(g, 52, 46, 26, 22, 4, "#8a6248"); // cửa sổ lưới
  for (let i = 0; i < 3; i++) {
    ln(
      g,
      [
        [56 + i * 8, 48],
        [56 + i * 8, 66],
      ],
      "#d9c9a8",
      1.4,
    );
    ln(
      g,
      [
        [54, 51 + i * 5.5],
        [76, 51 + i * 5.5],
      ],
      "#d9c9a8",
      1.4,
    );
  }
  rr(g, 16, 82, 8, 8, 2, "#8a6238");
  rr(g, 72, 82, 8, 8, 2, "#8a6238");
  el(g, 33, 84, 12, 3, "#f2e8d8"); // cỏ khô
}

function drawDoghouse(g) {
  el(g, 44, 76, 42, 7, "#000", 0.15);
  rr(g, 8, 28, 72, 48, 4, "#c96a4a");
  for (let i = 0; i < 4; i++)
    ln(
      g,
      [
        [8, 36 + i * 11],
        [80, 36 + i * 11],
      ],
      "#b55a3c",
      2.4,
    );
  g.fillStyle("#a84a3a", 1);
  g.fillTriangle(2, 32, 44, 4, 86, 32);
  g.fillStyle("#c05a48", 1);
  g.fillTriangle(8, 30, 44, 9, 80, 30);
  ci(g, 44, 52, 18, "#3a2a20");
  rr(g, 30, 72, 28, 6, 2, "#8a5a3a");
  rr(g, 36, 20, 22, 10, 3, "#f5c542"); // biển tên
}

function drawCatBed(g, color) {
  el(g, 24, 34, 23, 9, "#000", 0.14);
  el(g, 24, 30, 22, 11, color);
  el(g, 24, 28, 17, 7.5, shadeC(color, 0.7));
  el(g, 24, 29, 13, 5.5, "#f7ecd8");
}
function shadeC(hex, m) {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${Math.round(((n >> 16) & 255) * m)},${Math.round(((n >> 8) & 255) * m)},${Math.round((n & 255) * m)})`;
}

function drawMailbox(g) {
  el(g, 20, 58, 16, 4, "#000", 0.14);
  rr(g, 17, 26, 6, 32, 2, "#8a6238");
  rr(g, 4, 10, 32, 20, { tl: 9, tr: 9, bl: 3, br: 3 }, "#5db6d4");
  rr(g, 4, 10, 32, 8, { tl: 9, tr: 9 }, "#4a9ab5");
  rr(g, 30, 16, 8, 12, 2, "#e8543f"); // cờ
  rr(g, 34, 8, 3, 12, 1.5, "#8a6238");
  rr(g, 8, 18, 18, 3, 1.5, "#3a2a20", 0.25);
}

function drawButterfly(g, f, color) {
  const open = f === 0;
  const w = open ? 9 : 4;
  el(g, 12 - (open ? 0 : 4), 12, w, 8, color);
  el(g, 12 + (open ? 0 : 4) + (open ? 0 : 8), 12, w, 8, color);
  if (open) {
    el(g, 10, 17, 5, 4.4, shadeC(color, 0.75));
    el(g, 14, 17, 5, 4.4, shadeC(color, 0.75));
  }
  rr(g, 11, 7, 2.4, 12, 1.2, "#4a3121");
  ln(
    g,
    [
      [12, 7],
      [9, 3],
    ],
    "#4a3121",
    1.2,
  );
  ln(
    g,
    [
      [12.4, 7],
      [15.4, 3],
    ],
    "#4a3121",
    1.2,
  );
}

function drawDecor(g, id) {
  if (id === "flower_pot") {
    el(g, 24, 54, 16, 4, "#000", 0.15);
    rr(g, 12, 34, 24, 8, 3, "#c97a5a");
    g.fillStyle("#b5623f", 1);
    g.fillTriangle(14, 42, 34, 42, 30, 56);
    g.fillTriangle(14, 42, 34, 42, 18, 56);
    ln(
      g,
      [
        [24, 34],
        [24, 24],
      ],
      "#4f9a40",
      2.6,
    );
    ln(
      g,
      [
        [24, 30],
        [17, 26],
      ],
      "#4f9a40",
      2,
    );
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      el(
        g,
        24 + Math.cos(a) * 6.4,
        18 + Math.sin(a) * 6.4,
        5.4,
        5.4,
        "#e884a8",
      );
    }
    ci(g, 24, 18, 4.4, "#f5c542");
    el(g, 15, 25, 4, 2.4, "#5fae4c");
  } else if (id === "lantern") {
    el(g, 24, 60, 12, 3.4, "#000", 0.15);
    rr(g, 21, 12, 6, 50, 2, "#5c626e");
    rr(g, 14, 8, 20, 5, 2, "#4a505c");
    rr(g, 15, 13, 18, 22, 4, "#5c626e");
    rr(g, 18, 16, 12, 16, 3, "#ffe9a8");
    ci(g, 24, 24, 5.4, "#fff3c9");
  } else if (id === "gnome") {
    el(g, 24, 56, 15, 4, "#000", 0.15);
    el(g, 24, 46, 15, 11, "#5db6d4");
    rr(g, 15, 46, 18, 8, 3, "#4a9ab5");
    ci(g, 24, 32, 7.5, SKIN);
    el(g, 24, 38, 6.4, 3.6, "#fff");
    g.fillStyle("#e8323f", 1);
    g.fillTriangle(13, 30, 35, 30, 24, 6);
    g.fillStyle("#c9202f", 1);
    g.fillTriangle(17, 30, 31, 30, 24, 12);
    ci(g, 21, 31, 1.4, "#3a2a20");
    ci(g, 27, 31, 1.4, "#3a2a20");
    ci(g, 24, 34, 1.8, "#e8a088");
    rr(g, 13, 52, 8, 5, 2, "#3a3f47");
    rr(g, 27, 52, 8, 5, 2, "#3a3f47");
  } else if (id === "bench") {
    el(g, 48, 56, 44, 6, "#000", 0.15);
    rr(g, 8, 20, 80, 8, 3, "#a07a4a");
    rr(g, 8, 32, 80, 8, 3, "#b98a5e");
    rr(g, 12, 40, 7, 16, 2, "#8a6238");
    rr(g, 77, 40, 7, 16, 2, "#8a6238");
    rr(g, 10, 14, 4, 26, 2, "#8a6238");
    rr(g, 82, 14, 4, 26, 2, "#8a6238");
    ln(
      g,
      [
        [10, 14],
        [86, 14],
      ],
      "#a07a4a",
      4,
    );
  }
}

function drawParticles(g) {
  bake("pt_rain", 4, 14, (x) => {
    x.fillStyle("#bfe0f5", 0.85);
    x.fillRoundedRect(0, 0, 3, 14, 1.5);
  });
  bake("pt_snow", 8, 8, (x) => {
    ci(x, 4, 4, 3.4, "#fff", 0.95);
    ci(x, 3, 3, 1.4, "#fff");
  });
  bake("pt_leaf", 10, 8, (x) => {
    el(x, 5, 4, 4.6, 3, "#e8963c");
    ln(
      x,
      [
        [2, 4],
        [8, 4],
      ],
      "#c97a2a",
      1,
    );
  });
  bake("pt_leaf2", 10, 8, (x) => {
    el(x, 5, 4, 4.6, 3, "#c94f35");
    ln(
      x,
      [
        [2, 4],
        [8, 4],
      ],
      "#a83a25",
      1,
    );
  });
  bake("pt_petal", 9, 8, (x) => {
    el(x, 4.5, 4, 4, 3.2, "#f7bcd2");
    el(x, 3.4, 3, 1.8, 1.4, "#fff", 0.7);
  });
  bake("pt_heart", 12, 11, (x) => {
    ci(x, 4, 4, 3.4, "#ff8aa0");
    ci(x, 8, 4, 3.4, "#ff8aa0");
    x.fillStyle("#ff8aa0", 1);
    x.fillTriangle(0.8, 5.4, 11.2, 5.4, 6, 11);
  });
  bake("pt_sparkle", 10, 10, (x) => {
    x.fillStyle("#f5c542", 1);
    x.fillTriangle(5, 0, 6.4, 3.6, 10, 5);
    x.fillTriangle(5, 10, 3.6, 6.4, 0, 5);
    x.fillTriangle(5, 0, 3.6, 3.6, 0, 5);
    x.fillTriangle(5, 10, 6.4, 6.4, 10, 5);
    ci(x, 5, 5, 1.6, "#fff");
  });
  bake("pt_drop", 6, 8, (x) => {
    x.fillStyle("#8fd4e8", 1);
    x.fillTriangle(3, 0, 6, 5, 0, 5);
    x.fillCircle(3, 5, 3);
  });
  bake("pt_zzz", 14, 12, (x) => {
    x.lineStyle(2, "#fff", 0.95);
    x.beginPath();
    x.moveTo(2, 4);
    x.lineTo(8, 4);
    x.lineTo(2, 9);
    x.lineTo(8, 9);
    x.strokePath();
    x.lineStyle(1.4, "#fff", 0.7);
    x.beginPath();
    x.moveTo(9, 2);
    x.lineTo(12.4, 2);
    x.lineTo(9, 5.4);
    x.lineTo(12.4, 5.4);
    x.strokePath();
  });
  bake("shadow", 48, 16, (x) => {
    el(x, 24, 8, 22, 7, "#2a2018", 0.28);
    el(x, 24, 8, 14, 4.4, "#2a2018", 0.2);
  });
  bake("bubble", 34, 30, (x) => {
    rr(x, 2, 2, 30, 22, 8, "#fff");
    x.fillStyle("#fff", 1);
    x.fillTriangle(12, 22, 20, 22, 14, 29);
  });
  bake("icon_e", 30, 34, (x) => {
    x.fillStyle("#fff", 1);
    x.fillRoundedRect(1, 1, 28, 26, 8);
    x.fillStyle("#5c4a3d", 1);
    x.fillTriangle(11, 26, 19, 26, 15, 33);
    x.fillStyle("#5c4a3d", 1);
    x.fillRoundedRect(4, 4, 22, 20, 6);
    // chữ E
    x.fillStyle("#f5c542", 1);
    x.fillRect(9, 8, 10, 3);
    x.fillRect(9, 8, 3, 12);
    x.fillRect(9, 13, 8, 3);
    x.fillRect(9, 17, 10, 3);
  });
}

/* ================= API CHÍNH ================= */
export function generateAllTextures(scene) {
  sceneRef = scene;
  G = scene.make.graphics({ x: 0, y: 0, add: false });
  window.__CROPS = null; // gán sau

  // --- Nhân vật: mọi tổ hợp gender/pose/dir ---
  const poses = {
    idle: 2,
    walk: 4,
    water: 2,
    dig: 2,
    harvest: 2,
    pet: 2,
    feed: 2,
    cook: 2,
  };
  for (const gender of ["female", "male"]) {
    for (const [pose, frames] of Object.entries(poses)) {
      for (const dir of ["down", "up", "left"]) {
        for (let f = 0; f < frames; f++) {
          bake(`pf_${gender}_${pose}_${dir}_${f}`, 48, 58, (g) =>
            drawHuman(g, { gender, dir, pose, f }),
          );
        }
      }
    }
    bake(`pf_${gender}_sleep_down_0`, 48, 58, (g) => drawSleeping(g, gender));
    bake(`pf_${gender}_sit_down_0`, 48, 58, (g) => drawSitting(g, gender));
  }

  // --- Thú cưng ---
  const petAnims = {
    rabbit: { hop: 2, sit: 1, sleep: 1, eat: 2 },
    dog: { walk: 2, sit: 1, sleep: 1, happy: 2 },
    cat: { walk: 2, sit: 1, sleep: 1, groom: 2 },
  };
  const coats = { rabbit: ["white"], dog: ["tan"], cat: ["gray", "orange"] };
  for (const [sp, anims] of Object.entries(petAnims)) {
    for (const coat of coats[sp]) {
      for (const [anim, frames] of Object.entries(anims)) {
        for (let f = 0; f < frames; f++) {
          bake(`pet_${sp}_${coat}_${anim}_${f}`, 48, 44, (g) => {
            if (sp === "rabbit") drawRabbit(g, anim, f, coat);
            else if (sp === "dog") drawDog(g, anim, f, coat);
            else drawCat(g, anim, f, coat);
          });
        }
      }
    }
  }

  // --- Gạch nền ---
  bake("tile_path", 48, 48, (g) => {
    g.fillStyle("#d9b98a", 1);
    g.fillRect(0, 0, 48, 48);
    const rng = mulberry(7);
    for (let i = 0; i < 9; i++)
      ci(
        g,
        rng() * 44 + 2,
        rng() * 44 + 2,
        2 + rng() * 2.6,
        rng() > 0.5 ? "#c9a878" : "#e0c49a",
      );
    g.fillStyle("#c9a878", 0.5);
    g.fillRect(0, 0, 48, 2);
    g.fillRect(0, 46, 48, 2);
  });
  bake("tile_dirt", 48, 48, (g) => {
    g.fillStyle("#9a7a54", 1);
    g.fillRect(0, 0, 48, 48);
    const rng = mulberry(11);
    for (let i = 0; i < 10; i++)
      ci(g, rng() * 44 + 2, rng() * 44 + 2, 1.6 + rng() * 1.6, "#8a6a46");
  });
  bake("tile_soil", 48, 48, (g) => drawSoil(g, false));
  bake("tile_soil_wet", 48, 48, (g) => drawSoil(g, true));

  function drawSoil(g, wet) {
    g.fillStyle(wet ? "#5f4530" : "#7d5a40", 1);
    g.fillRect(0, 0, 48, 48);
    for (let i = 0; i < 4; i++) {
      rr(g, 3, 5 + i * 11, 42, 6, 3, wet ? "#6b4f38" : "#8a6a4a");
      rr(g, 3, 5 + i * 11, 42, 2.6, 3, wet ? "#54381f" : "#6b4f38");
    }
    if (wet) {
      ci(g, 12, 12, 1.6, "#8fd4e8", 0.7);
      ci(g, 34, 26, 1.6, "#8fd4e8", 0.7);
      ci(g, 22, 40, 1.6, "#8fd4e8", 0.7);
    } else {
      ci(g, 14, 20, 1.4, "#9a7a54");
      ci(g, 30, 34, 1.4, "#9a7a54");
    }
  }
  function mulberry(seed) {
    return mulberry32Local(seed);
  }

  // --- Nhà, công trình ---
  bake("house", 384, 336, (g) => drawHouse(g, false));
  bake("house_snow", 384, 336, (g) => drawHouse(g, true));
  bake("fence_h", 48, 40, (g) => drawFenceSeg(g, false));
  bake("fence_v", 40, 48, (g) => drawFenceSeg(g, true));
  bake("hutch", 96, 92, (g) => drawHutch(g));
  bake("doghouse", 88, 82, (g) => drawDoghouse(g));
  bake("catbed_pink", 48, 40, (g) => drawCatBed(g, "#e8a0b8"));
  bake("catbed_blue", 48, 40, (g) => drawCatBed(g, "#8ab8d4"));
  bake("mailbox", 44, 62, (g) => drawMailbox(g));
  bake("dock", 72, 40, (g) => {
    rr(g, 0, 4, 72, 32, 3, "#a07a4a");
    for (let i = 0; i < 4; i++)
      ln(
        g,
        [
          [4 + i * 18, 4],
          [4 + i * 18, 36],
        ],
        "#8a6238",
        2.4,
      );
    ln(
      g,
      [
        [0, 10],
        [72, 10],
      ],
      "#b98a5e",
      2,
    );
    ln(
      g,
      [
        [0, 30],
        [72, 30],
      ],
      "#b98a5e",
      2,
    );
  });

  // --- Bướm ---
  const bfColors = ["#8fd4e8", "#f5c542", "#e8963c"];
  bfColors.forEach((c, i) => {
    for (let f = 0; f < 2; f++)
      bake(`bf_${i}_${f}`, 24, 24, (g) => drawButterfly(g, f, c));
  });

  // --- Decor ---
  bake("decor_flower_pot", 48, 60, (g) => drawDecor(g, "flower_pot"));
  bake("decor_lantern", 48, 64, (g) => drawDecor(g, "lantern"));
  bake("decor_gnome", 48, 60, (g) => drawDecor(g, "gnome"));
  bake("decor_bench", 96, 60, (g) => drawDecor(g, "bench"));

  drawParticles(G);

  G.destroy();
  G = null;
}
function mulberry32Local(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Sinh texture theo mùa (gọi khi đổi mùa)
export function generateSeasonTextures(scene, season) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  for (let v = 0; v < 3; v++) {
    const key = `grass_${v}`;
    if (scene.textures.exists(key)) scene.textures.remove(key);
    g.clear();
    drawGrassTile(g, season, v, mulberry32Local(100 + v));
    g.generateTexture(key, 48, 48);
  }
  // cây theo mùa: 2 biến thể thường + 1 phong
  for (let v = 0; v < 2; v++) {
    const key = `tree_${v}`;
    if (scene.textures.exists(key)) scene.textures.remove(key);
    g.clear();
    drawTree(g, season, v, false);
    g.generateTexture(key, 96, 110);
  }
  const mk = "tree_maple";
  if (scene.textures.exists(mk)) scene.textures.remove(mk);
  g.clear();
  drawTree(g, season, 0, true);
  g.generateTexture(mk, 96, 110);
  // icon nông sản & hạt giống (mọi mùa - vẽ 1 lần, vẽ lại để cập nhật __CROPS)
  g.destroy();
}

// Icon nông sản + hạt giống (cần CROPS đã import ở nơi gọi)
export function generateCropAndItemIcons(scene, CROPS) {
  window.__CROPS = CROPS;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  for (const [id, crop] of Object.entries(CROPS)) {
    for (let s = 0; s <= 4; s++) {
      const key = `crop_${id}_${s}`;
      if (scene.textures.exists(key)) scene.textures.remove(key);
      g.clear();
      drawCropStage(g, crop, s);
      g.generateTexture(key, 48, 48);
    }
    const seedKey = `icon_seed_${id}`;
    if (!scene.textures.exists(seedKey)) {
      g.clear();
      drawIcon(g, `seed_${id}`);
      g.generateTexture(seedKey, 48, 48);
    }
    const cropKey = `icon_crop_${id}`;
    if (!scene.textures.exists(cropKey)) {
      g.clear();
      el(g, 24, 40, 14, 4, "#000", 0.12);
      g.translateCanvas?.(0, 0);
      drawCropIconMini(g, crop);
      g.generateTexture(cropKey, 48, 48);
    }
  }
  // icon vật phẩm thường
  for (const id of [
    "hoe",
    "can",
    "rod",
    "net",
    "food_rabbit",
    "food_dog",
    "food_cat",
    "clover",
    "dandelion",
    "shell",
    "mushroom",
    "apple",
    "pinecone",
    "holly",
    "bug_common",
    "bug_rare",
    "flower_pot",
    "lantern",
    "gnome",
    "bench",
    "flour",
    "milk",
    "egg",
    "coin",
    "star",
    "heart",
  ]) {
    const key = `icon_${id}`;
    if (!scene.textures.exists(key)) {
      g.clear();
      drawIcon(g, id);
      g.generateTexture(key, 48, 48);
    }
  }
  g.destroy();
}
function drawCropIconMini(g, crop) {
  // thu nhỏ hình cây trưởng thành vào icon bằng cách vẽ lại stage 4 lệch tâm
  const save = [];
  g.clear();
  el(g, 24, 42, 14, 3.5, "#000", 0.12);
  drawCropStage(g, crop, 4);
}
