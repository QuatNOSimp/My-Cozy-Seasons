// Texture nội thất căn nhà, nhà kính, icon món ăn & cá — sinh tại BootScene
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

function bake(key, w, h, draw) {
  G.clear();
  draw(G);
  G.generateTexture(key, w, h);
}

export function generateInteriorTextures(scene) {
  G = scene.make.graphics({ x: 0, y: 0, add: false });

  /* ---- sàn & tường ---- */
  bake("int_floor1", 48, 48, (g) => {
    g.fillStyle("#c99a6a", 1);
    g.fillRect(0, 0, 48, 48);
    for (let i = 0; i < 3; i++) {
      g.fillStyle("#b8895c", 1);
      g.fillRect(0, i * 16, 48, 1.6);
      g.fillStyle("#d4a878", 0.5);
      g.fillRect(0, i * 16 + 2, 48, 2);
      g.fillStyle("#a87a4c", 1);
      g.fillRect((i * 19 + 8) % 48, i * 16, 1.6, 16);
    }
    ln(
      g,
      [
        [6, 7],
        [16, 7],
      ],
      "#b8895c",
      1,
    );
    ln(
      g,
      [
        [28, 24],
        [40, 24],
      ],
      "#b8895c",
      1,
    );
    ln(
      g,
      [
        [10, 40],
        [22, 40],
      ],
      "#b8895c",
      1,
    );
  });
  bake("int_floor2", 48, 48, (g) => {
    g.fillStyle("#d9b58a", 1);
    g.fillRect(0, 0, 48, 48);
    for (let i = 0; i < 3; i++) {
      g.fillStyle("#c9a376", 1);
      g.fillRect(0, i * 16, 48, 1.6);
      g.fillStyle("#e4c49a", 0.6);
      g.fillRect(0, i * 16 + 2, 48, 2);
      g.fillStyle("#bd9364", 1);
      g.fillRect((i * 27 + 12) % 48, i * 16, 1.6, 16);
    }
  });
  bake("int_wall1", 48, 48, (g) => {
    g.fillStyle("#f2e4c8", 1);
    g.fillRect(0, 0, 48, 48);
    for (let i = 0; i < 3; i++) {
      g.fillStyle("#e8d5b0", 1);
      g.fillRect(i * 16 + 6, 0, 5, 40);
    }
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 2; j++)
        ci(g, i * 24 + 3, j * 20 + 10, 1.4, "#d9c09a");
    g.fillStyle("#a87a4a", 1);
    g.fillRect(0, 40, 48, 8);
    g.fillStyle("#c99a6a", 1);
    g.fillRect(0, 40, 48, 2.4);
  });
  bake("int_wall2", 48, 48, (g) => {
    g.fillStyle("#dce8f0", 1);
    g.fillRect(0, 0, 48, 48);
    for (let i = 0; i < 3; i++) {
      g.fillStyle("#cadde8", 1);
      g.fillRect(i * 16 + 6, 0, 5, 40);
    }
    for (let i = 0; i < 3; i++)
      ci(g, i * 16 + 3, 14 + (i % 2) * 12, 1.5, "#b6ccd9");
    g.fillStyle("#a87a4a", 1);
    g.fillRect(0, 40, 48, 8);
    g.fillStyle("#c99a6a", 1);
    g.fillRect(0, 40, 48, 2.4);
  });
  bake("furn_window", 84, 64, (g) => {
    rr(g, 2, 2, 80, 56, 6, "#b98a5e");
    rr(g, 7, 7, 70, 46, 4, "#bfe3f2");
    rr(g, 7, 7, 70, 20, { tl: 4, tr: 4, bl: 0, br: 0 }, "#d9f0fa");
    ci(g, 60, 18, 7, "#fff3c9", 0.9);
    ln(
      g,
      [
        [42, 7],
        [42, 53],
      ],
      "#b98a5e",
      3,
    );
    ln(
      g,
      [
        [7, 30],
        [77, 30],
      ],
      "#b98a5e",
      3,
    );
    // rèm hai bên
    rr(g, 0, 0, 14, 62, { bl: 8, tl: 4 }, "#e884a8");
    rr(g, 70, 0, 14, 62, { br: 8, tr: 4 }, "#e884a8");
    ln(
      g,
      [
        [4, 8],
        [4, 54],
      ],
      "#d46a90",
      2,
    );
    ln(
      g,
      [
        [80, 8],
        [80, 54],
      ],
      "#d46a90",
      2,
    );
  });
  bake("int_door", 76, 96, (g) => {
    rr(g, 2, 2, 72, 92, { tl: 30, tr: 30, bl: 3, br: 3 }, "#8a6248");
    rr(g, 8, 8, 60, 86, { tl: 26, tr: 26, bl: 2, br: 2 }, "#a07a4a");
    rr(g, 16, 24, 44, 26, 5, "#8a6248", 0.5);
    rr(g, 16, 58, 44, 26, 5, "#8a6248", 0.5);
    ci(g, 60, 56, 4, "#f5c542");
    el(g, 38, 96, 40, 6, "#c9a06a");
  });

  /* ---- phòng khách ---- */
  bake("furn_sofa", 120, 74, (g) => {
    el(g, 60, 68, 58, 8, "#000", 0.14);
    rr(g, 6, 8, 108, 44, 12, "#c96a5a");
    rr(g, 6, 8, 108, 16, { tl: 12, tr: 12, bl: 0, br: 0 }, "#d47a68");
    rr(g, 14, 26, 44, 24, 8, "#e08a78");
    rr(g, 62, 26, 44, 24, 8, "#e08a78");
    rr(g, 0, 20, 14, 40, 7, "#b55a4a");
    rr(g, 106, 20, 14, 40, 7, "#b55a4a");
    ci(g, 26, 22, 5, "#f2e4c8");
    ci(g, 94, 22, 5, "#a8c686");
    rr(g, 12, 62, 10, 10, 3, "#8a5a3a");
    rr(g, 98, 62, 10, 10, 3, "#8a5a3a");
  });
  bake("furn_armchair", 68, 66, (g) => {
    el(g, 34, 61, 32, 7, "#000", 0.14);
    rr(g, 8, 6, 52, 40, 10, "#7ba05b");
    rr(g, 8, 6, 52, 14, { tl: 10, tr: 10, bl: 0, br: 0 }, "#8fb86e");
    rr(g, 14, 22, 40, 20, 7, "#96bd74");
    rr(g, 2, 18, 12, 34, 6, "#6a8f4c");
    rr(g, 54, 18, 12, 34, 6, "#6a8f4c");
    rr(g, 12, 56, 9, 9, 3, "#8a5a3a");
    rr(g, 47, 56, 9, 9, 3, "#8a5a3a");
  });
  bake("furn_ctable", 72, 50, (g) => {
    el(g, 36, 44, 34, 7, "#000", 0.14);
    el(g, 36, 26, 34, 19, "#a07a4a");
    el(g, 36, 24, 34, 19, "#b98a5e");
    el(g, 36, 23, 28, 15, "#c99a6a");
    ci(g, 30, 22, 4, "#e884a8");
    ci(g, 42, 25, 3.4, "#f5c542");
    el(g, 36, 20, 4, 2, "#5fae4c");
  });
  bake("furn_rug", 170, 104, (g) => {
    el(g, 85, 52, 84, 51, "#e0b8a0");
    el(g, 85, 52, 72, 43, "#eac9b4");
    el(g, 85, 52, 56, 33, "#e0b8a0");
    el(g, 85, 52, 42, 24, "#f2dcc9");
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      el(g, 85 + Math.cos(a) * 62, 52 + Math.sin(a) * 37, 3, 2, "#c9987e");
    }
    ci(g, 85, 52, 8, "#d4a088");
  });
  bake("furn_fireplace", 112, 112, (g) => {
    rr(g, 6, 20, 100, 88, 6, "#b5a892");
    for (let r2 = 0; r2 < 5; r2++)
      for (let c = 0; c < 4; c++)
        rr(
          g,
          10 + c * 24 + (r2 % 2) * 10,
          24 + r2 * 16,
          20,
          12,
          2,
          r2 % 2 ? "#a89a82" : "#c2b5a0",
        );
    rr(g, 2, 10, 108, 14, 4, "#8a7462");
    el(g, 56, 42, 14, 4, "#f5c542");
    rr(g, 18, 24, 6, 20, 2, "#f5c542");
    rr(g, 88, 24, 6, 20, 2, "#f5c542"); // nến? giữ đơn giản
    rr(g, 26, 46, 60, 56, { tl: 26, tr: 26, bl: 3, br: 3 }, "#3a2a20");
    rr(g, 32, 88, 48, 8, 3, "#6a4a2a");
    ci(g, 48, 84, 10, "#f2a154");
    ci(g, 62, 82, 12, "#f5c542");
    ci(g, 55, 76, 8, "#ffe9a8");
    ci(g, 50, 86, 4, "#e8543f");
  });
  bake("furn_bookshelf", 92, 112, (g) => {
    el(g, 46, 108, 44, 6, "#000", 0.14);
    rr(g, 4, 4, 84, 104, 5, "#8a6248");
    rr(g, 10, 10, 72, 92, 3, "#a07a4a");
    const bookColors = [
      "#c96a5a",
      "#5f8fbf",
      "#7ba05b",
      "#e8b02e",
      "#9a6abf",
      "#e884a8",
    ];
    for (let s2 = 0; s2 < 3; s2++) {
      const y = 14 + s2 * 30;
      rr(g, 8, y + 22, 76, 4, 1, "#8a6248");
      for (let b = 0; b < 7; b++) {
        const h = 16 + ((b * 7 + s2 * 3) % 3) * 3;
        rr(
          g,
          12 + b * 10,
          y + 26 - h,
          8,
          h,
          2,
          bookColors[(b + s2) % bookColors.length],
        );
        ln(
          g,
          [
            [13 + b * 10, y + 28 - h],
            [18 + b * 10, y + 28 - h],
          ],
          "#fff",
          1,
          0.4,
        );
      }
    }
    el(g, 66, 16, 8, 5, "#7ba05b");
    rr(g, 63, 16, 6, 6, 2, "#c97a5a");
  });
  bake("furn_plant", 48, 72, (g) => {
    el(g, 24, 66, 16, 5, "#000", 0.15);
    rr(g, 13, 48, 22, 8, 3, "#c97a5a");
    g.fillStyle("#b5623f", 1);
    g.fillTriangle(15, 56, 33, 56, 30, 68);
    g.fillTriangle(15, 56, 33, 56, 18, 68);
    ln(
      g,
      [
        [24, 48],
        [24, 26],
      ],
      "#4f9a40",
      3,
    );
    ln(
      g,
      [
        [24, 40],
        [14, 30],
      ],
      "#4f9a40",
      2.4,
    );
    ln(
      g,
      [
        [24, 36],
        [35, 26],
      ],
      "#4f9a40",
      2.4,
    );
    el(g, 12, 28, 8, 5, "#5fae4c");
    el(g, 36, 24, 8, 5, "#6aa854");
    el(g, 24, 20, 8, 6, "#5fae4c");
    el(g, 18, 16, 6, 4.4, "#6aa854");
    el(g, 30, 14, 6, 4.4, "#5fae4c");
  });

  /* ---- bếp ---- */
  bake("furn_counter_long", 210, 66, (g) => {
    el(g, 105, 62, 100, 6, "#000", 0.13);
    rr(g, 4, 14, 202, 50, 5, "#a8c686");
    for (let i = 0; i < 4; i++) {
      rr(g, 12 + i * 50, 22, 40, 34, 4, "#94b876");
      ci(g, 32 + i * 50, 39, 2.6, "#5c4a3d");
    }
    rr(g, 0, 6, 210, 14, 4, "#e8dcc4");
    rr(g, 0, 6, 210, 5, 3, "#f2ead8");
  });
  bake("furn_stove", 58, 54, (g) => {
    rr(g, 2, 2, 54, 50, 5, "#5c626e");
    rr(g, 5, 5, 48, 30, 4, "#3a3f47");
    ci(g, 18, 20, 8, "#2a2e34");
    ci(g, 40, 20, 8, "#2a2e34");
    ci(g, 18, 20, 5, "#4a505c");
    ci(g, 40, 20, 5, "#4a505c");
    rr(g, 12, 12, 20, 12, 4, "#c96a5a");
    rr(g, 10, 10, 24, 4, 2, "#8a5a3a"); // nồi
    ci(g, 26, 8, 2, "#fff", 0.6);
    ci(g, 30, 4, 2.4, "#fff", 0.4);
    for (let i = 0; i < 4; i++) ci(g, 12 + i * 11, 44, 3, "#8a929e");
  });
  bake("furn_sink", 58, 50, (g) => {
    rr(g, 2, 2, 54, 46, 5, "#d9d9d9");
    rr(g, 8, 10, 42, 30, 6, "#aebfc9");
    rr(g, 11, 13, 36, 24, 5, "#93aab8");
    rr(g, 26, 2, 6, 12, 3, "#8a929e");
    ci(g, 29, 4, 4, "#8a929e");
    ci(g, 29, 26, 3.4, "#7a93a2");
    ci(g, 16, 18, 1.6, "#fff", 0.7);
  });
  bake("furn_fridge", 66, 104, (g) => {
    el(g, 33, 100, 30, 6, "#000", 0.14);
    rr(g, 5, 4, 56, 98, 7, "#f2f2f0");
    rr(g, 5, 4, 56, 34, { tl: 7, tr: 7, bl: 0, br: 0 }, "#fafaf8");
    ln(
      g,
      [
        [5, 38],
        [61, 38],
      ],
      "#d4d4d0",
      3,
    );
    rr(g, 50, 12, 5, 18, 2.5, "#b5b5b0");
    rr(g, 50, 46, 5, 26, 2.5, "#b5b5b0");
    rr(g, 12, 10, 26, 18, 3, "#bfe3f2"); // ghi chú dán
    ci(g, 20, 60, 3, "#e884a8");
    ci(g, 30, 66, 3, "#f5c542");
    ci(g, 40, 58, 3, "#7ba05b");
    rr(g, 8, 96, 10, 7, 2, "#b5b5b0");
    rr(g, 48, 96, 10, 7, 2, "#b5b5b0");
  });
  bake("furn_table", 112, 84, (g) => {
    el(g, 56, 78, 54, 7, "#000", 0.14);
    rr(g, 6, 26, 100, 46, 8, "#a07a4a");
    rr(g, 6, 20, 100, 40, 8, "#b98a5e");
    rr(g, 10, 24, 92, 32, 6, "#c99a6a");
    ln(
      g,
      [
        [10, 40],
        [102, 40],
      ],
      "#b98a5e",
      1.6,
    );
    el(g, 56, 36, 16, 9, "#e884a8");
    el(g, 56, 33, 12, 6, "#f2a3c0");
    ci(g, 56, 32, 3, "#f5c542"); // khay hoa
    rr(g, 12, 66, 9, 14, 3, "#8a6238");
    rr(g, 91, 66, 9, 14, 3, "#8a6238");
  });
  bake("furn_chair", 46, 58, (g) => {
    el(g, 23, 54, 20, 4, "#000", 0.14);
    rr(g, 9, 2, 28, 30, 6, "#b98a5e");
    rr(g, 13, 6, 20, 22, 5, "#c99a6a");
    rr(g, 6, 30, 34, 12, 5, "#a07a4a");
    rr(g, 9, 28, 28, 8, 4, "#d47a68");
    rr(g, 9, 42, 6, 14, 2, "#8a6238");
    rr(g, 31, 42, 6, 14, 2, "#8a6238");
  });

  /* ---- phòng ngủ ---- */
  bake("furn_bed", 132, 150, (g) => {
    el(g, 66, 144, 62, 7, "#000", 0.14);
    rr(g, 8, 4, 116, 26, { tl: 12, tr: 12 }, "#8a6248");
    rr(g, 14, 8, 104, 16, 7, "#a07a4a");
    rr(g, 10, 26, 112, 116, 8, "#f2f2f0");
    rr(g, 10, 62, 112, 80, { bl: 8, br: 8 }, "#a8c686");
    for (let i = 0; i < 4; i++) {
      ln(
        g,
        [
          [16, 74 + i * 18],
          [116, 74 + i * 18],
        ],
        "#94b876",
        3,
      );
    }
    for (let i = 0; i < 5; i++)
      ci(g, 30 + i * 18, 84 + (i % 2) * 22, 3.4, "#f2e4c8", 0.8);
    rr(g, 22, 32, 42, 24, 9, "#fff");
    rr(g, 68, 32, 42, 24, 9, "#fff");
    rr(g, 22, 32, 42, 9, 6, "#e8e8e4");
    rr(g, 68, 32, 42, 9, 6, "#e8e8e4");
    rr(g, 8, 136, 12, 10, 3, "#6a4a32");
    rr(g, 112, 136, 12, 10, 3, "#6a4a32");
  });
  bake("furn_wardrobe", 96, 124, (g) => {
    el(g, 48, 120, 46, 6, "#000", 0.14);
    rr(g, 6, 14, 84, 104, 6, "#a07a4a");
    rr(g, 2, 8, 92, 12, 4, "#8a6248");
    rr(g, 12, 22, 34, 88, 4, "#b98a5e");
    rr(g, 50, 22, 34, 88, 4, "#b98a5e");
    ln(
      g,
      [
        [16, 30],
        [16, 102],
      ],
      "#a07a4a",
      2,
    );
    ln(
      g,
      [
        [80, 30],
        [80, 102],
      ],
      "#a07a4a",
      2,
    );
    ci(g, 42, 66, 3, "#5c4a3d");
    ci(g, 54, 66, 3, "#5c4a3d");
    el(g, 29, 40, 8, 10, "#c99a6a");
    el(g, 67, 40, 8, 10, "#c99a6a");
  });
  bake("furn_dresser", 84, 84, (g) => {
    el(g, 42, 80, 40, 5, "#000", 0.14);
    el(g, 42, 18, 24, 16, "#d9e8f0");
    g.lineStyle(4, "#a07a4a", 1);
    g.strokeEllipse(42, 18, 24, 16);
    ci(g, 36, 14, 4, "#fff", 0.7);
    rr(g, 10, 34, 64, 44, 5, "#a07a4a");
    rr(g, 15, 40, 54, 14, 3, "#b98a5e");
    rr(g, 15, 58, 54, 14, 3, "#b98a5e");
    ci(g, 42, 47, 2.6, "#5c4a3d");
    ci(g, 42, 65, 2.6, "#5c4a3d");
    rr(g, 14, 76, 8, 7, 2, "#8a6238");
    rr(g, 62, 76, 8, 7, 2, "#8a6238");
    ci(g, 20, 32, 3, "#e884a8");
    ci(g, 26, 31, 2.6, "#f5c542");
  });
  bake("furn_lamp", 40, 84, (g) => {
    el(g, 20, 80, 14, 4, "#000", 0.14);
    rr(g, 17, 34, 6, 44, 3, "#8a6248");
    el(g, 20, 78, 10, 4, "#6a4a32");
    g.fillStyle("#f5c542", 1);
    g.fillTriangle(6, 36, 34, 36, 28, 10);
    g.fillTriangle(6, 36, 34, 36, 12, 10);
    g.fillStyle("#ffe9a8", 1);
    g.fillTriangle(10, 36, 30, 36, 20, 12);
    ci(g, 20, 24, 12, "#fff3c9", 0.25);
  });
  bake("furn_stairs", 100, 116, (g) => {
    el(g, 50, 112, 48, 5, "#000", 0.13);
    for (let i = 0; i < 5; i++) {
      const y = 96 - i * 19,
        x = 8 + i * 4;
      rr(g, x, y, 88 - i * 8, 16, 3, i % 2 ? "#b98a5e" : "#a07a4a");
      rr(g, x, y, 88 - i * 8, 5, 3, "#c99a6a");
    }
    for (let i = 0; i < 5; i++)
      rr(
        g,
        12 + i * 4,
        12 - i * 0 + i * 0 + 84 - i * 19,
        5,
        16 + i * 0,
        2,
        "#8a6248",
      );
    ln(
      g,
      [
        [10, 92],
        [90, 16],
      ],
      "#8a6248",
      5,
    );
    ci(g, 90, 14, 5, "#8a6248");
  });

  /* ---- nhà kính ---- */
  bake("gh_house", 250, 160, (g) => {
    el(g, 125, 152, 120, 9, "#000", 0.13);
    // khung kính
    rr(g, 10, 54, 230, 98, 6, "#bfe3f2", 0.5);
    g.fillStyle("#d9f0fa", 0.45);
    g.fillTriangle(10, 58, 125, 8, 240, 58);
    g.lineStyle(5, "#7ba05b", 1);
    g.strokeRoundedRect(10, 54, 230, 98, 6);
    g.beginPath();
    g.moveTo(10, 58);
    g.lineTo(125, 8);
    g.lineTo(240, 58);
    g.strokePath();
    for (let i = 1; i < 5; i++) {
      ln(
        g,
        [
          [10 + i * 46, 54],
          [10 + i * 46, 152],
        ],
        "#7ba05b",
        3,
      );
    }
    ln(
      g,
      [
        [10, 100],
        [240, 100],
      ],
      "#7ba05b",
      3,
    );
    ln(
      g,
      [
        [60, 34],
        [190, 34],
      ],
      "#7ba05b",
      3,
    );
    // cây bên trong
    ln(
      g,
      [
        [56, 140],
        [56, 116],
      ],
      "#4f9a40",
      3,
    );
    ci(g, 56, 112, 8, "#e8543f");
    el(g, 50, 122, 5, 3, "#5fae4c");
    ln(
      g,
      [
        [125, 142],
        [125, 120],
      ],
      "#4f9a40",
      3,
    );
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ci(g, 125 + Math.cos(a) * 6, 114 + Math.sin(a) * 6, 4, "#e884a8");
    }
    ci(g, 125, 114, 3.4, "#f5c542");
    ln(
      g,
      [
        [194, 140],
        [194, 118],
      ],
      "#4f9a40",
      3,
    );
    ci(g, 194, 112, 7, "#f5c542");
    ci(g, 194, 112, 3, "#8a5a3a");
    ci(g, 90, 70, 10, "#fff", 0.4);
    ci(g, 160, 60, 8, "#fff", 0.35);
  });

  G.destroy();
  G = null;
}

/* ---- icon món ăn & cá ---- */
export function generateInteriorIcons(scene, RECIPES, FISH) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  const bake2 = (key, draw) => {
    if (scene.textures.exists(key)) return;
    g.clear();
    draw(g);
    g.generateTexture(key, 48, 48);
  };

  for (const r of RECIPES) {
    bake2(`icon_${r.id}`, (x) => {
      ci(x, 24, 26, 15, "#fff");
      ci(x, 24, 26, 12, "#f2ead8");
      ci(x, 24, 26, 9, "#e8dcc4");
      switch (r.id) {
        case "dish_salad":
          ci(x, 20, 23, 4, "#7ac362");
          ci(x, 27, 22, 4, "#5fae4c");
          ci(x, 24, 27, 4, "#8fd47a");
          ci(x, 26, 25, 2.2, "#e8543f");
          break;
        case "dish_soup":
          ci(x, 24, 25, 9, "#e8963c");
          ci(x, 24, 25, 7, "#f2b53c");
          ln(
            x,
            [
              [20, 14],
              [21, 9],
            ],
            "#d9d0c0",
            2,
            0.8,
          );
          ln(
            x,
            [
              [27, 14],
              [28, 9],
            ],
            "#d9d0c0",
            2,
            0.8,
          );
          break;
        case "dish_pancake":
          el(x, 24, 29, 10, 4, "#c9985e");
          el(x, 24, 26, 10, 4, "#d9a86a");
          el(x, 24, 23, 10, 4, "#e8b878");
          el(x, 24, 21, 7, 2.6, "#f2a154");
          rr(x, 21.5, 17, 5, 4, 1.5, "#ffe9a8");
          break;
        case "dish_stew":
          ci(x, 24, 25, 9, "#8a5a3a");
          ci(x, 24, 25, 7, "#a06a42");
          el(x, 21, 24, 4, 2.6, "#e8b878");
          ci(x, 27, 26, 2.4, "#f2853c");
          ci(x, 24, 22, 2, "#7ac362");
          break;
        case "dish_pie":
          el(x, 24, 27, 11, 7, "#d9a86a");
          el(x, 24, 25, 9, 5.4, "#e8963c");
          for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            ci(
              x,
              24 + Math.cos(a) * 9.4,
              27 + Math.sin(a) * 5.8,
              1.8,
              "#c9985e",
            );
          }
          break;
        case "dish_tea":
          el(x, 24, 31, 11, 4, "#d9c9a8");
          rr(x, 17, 21, 14, 11, 4, "#8fd4e8");
          rr(x, 17, 21, 14, 4, 2, "#a8e0f0");
          g.lineStyle?.(0);
          x.lineStyle(2.4, "#8fd4e8", 1);
          x.beginPath();
          x.arc(33, 26, 4, -Math.PI / 2, Math.PI / 2);
          x.strokePath();
          ci(x, 22, 24, 1.8, "#e884a8");
          ln(
            x,
            [
              [24, 17],
              [25, 12],
            ],
            "#d9d0c0",
            2,
            0.8,
          );
          break;
      }
    });
  }

  for (const f of FISH) {
    bake2(`icon_${f.id}`, (x) => {
      el(x, 20, 24, 13, 8, f.body);
      g.fillStyle?.(f.body);
      x.fillStyle(f.body, 1);
      x.fillTriangle(28, 24, 38, 16, 38, 32);
      el(x, 17, 27, 7, 4, f.belly, 0.9);
      x.fillStyle(f.fin, 1);
      x.fillTriangle(18, 18, 24, 12, 25, 20);
      ci(x, 13, 22, 1.8, "#3a2a20");
      if (f.patches) {
        ci(x, 20, 21, 3, f.patches);
        ci(x, 25, 27, 2.6, f.patches);
      }
      if (f.rarity === "rare") {
        ci(x, 36, 10, 1.6, "#f5c542");
        ci(x, 8, 34, 1.4, "#f5c542");
      }
      el(x, 22, 36, 14, 2.4, "#000", 0.1);
    });
  }
  g.destroy();
}
