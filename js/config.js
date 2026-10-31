// Hằng số toàn cục + bố cục thế giới (đơn vị tile) — Phần 2 thêm nhà kính & điểm câu cá
export const CONFIG = {
  W: 1120,
  H: 680,
  TILE: 48,
  MAP_W: 34,
  MAP_H: 24,
  WALK: 155,
  RUN: 245,
  INTERACT_R: 60,
  SAVE_KEY: "mcs_save_v1",
  SAVE_VERSION: 1,
  MINUTE_MS: 260,
  DAY_START: 6 * 60,
  PASS_OUT: 26 * 60,
  GREENHOUSE_LEVEL: 3,
};

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
export const pad2 = (n) => String(n).padStart(2, "0");

export function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const choice = (rng, arr) => arr[Math.floor(rng() * arr.length)];

export const LAYOUT = {
  house: { tx: 3, ty: 1.2, w: 384, h: 336 },
  door: { tx: 7, ty: 8.4 },
  mailbox: { tx: 10.2, ty: 9.2 },
  plots: [
    ...[...Array(12)].map((_, i) => ({
      tx: 18 + (i % 4),
      ty: 7 + Math.floor(i / 4),
      area: "garden",
    })),
    ...[...Array(6)].map((_, i) => ({
      tx: 23 + (i % 3),
      ty: 7 + Math.floor(i / 3),
      area: "flower",
    })),
  ],
  // 4 ô nhà kính — luôn trồng được trái mùa
  ghPlots: [
    { tx: 28.1, ty: 5.5, area: "gh" },
    { tx: 29.1, ty: 5.5, area: "gh" },
    { tx: 30.1, ty: 5.5, area: "gh" },
    { tx: 31.1, ty: 5.5, area: "gh" },
  ],
  greenhouse: { tx: 27.6, ty: 4.1 },
  pond: { tx: 29, ty: 19, rx: 3.1, ry: 2.1 },
  dock: { tx: 25.6, ty: 19 },
  fishingSpot: { tx: 26.9, ty: 19.5 },
  pet: {
    rabbit: { homeX: 5.5, homeY: 17.5, hutch: { tx: 4, ty: 15.6 }, r: 90 },
    dog: { homeX: 12, homeY: 16.5, house: { tx: 12.6, ty: 15.2 }, r: 190 },
    cat1: { homeX: 14.5, homeY: 18.5, bed: { tx: 14.5, ty: 17.6 }, r: 150 },
    cat2: { homeX: 13.5, homeY: 20.5, bed: { tx: 13.5, ty: 19.9 }, r: 150 },
  },
  fences: {
    rabbit: { x1: 3.4, y1: 15.4, x2: 8.6, y2: 19.9 },
    garden: { x1: 17.3, y1: 6.2, x2: 26.7, y2: 10.4 },
  },
  trees: [
    [1.3, 2.4],
    [12.8, 1.6],
    [15.6, 2.3],
    [30.5, 1.4],
    [32.6, 5.5],
    [1.2, 9.5],
    [1.5, 14.2],
    [2.4, 21.6],
    [9.6, 22.4],
    [16.8, 22.2],
    [23.5, 22.6],
    [32.4, 12.6],
    [31.8, 22.4],
    [15.2, 12.2],
  ],
  paths: [
    { x1: 7, y1: 9, x2: 7, y2: 12 },
    { x1: 7, y1: 12, x2: 14, y2: 12 },
    { x1: 14, y1: 12, x2: 14, y2: 8 },
    { x1: 14, y1: 8, x2: 17, y2: 8 },
    { x1: 7, y1: 12, x2: 7, y2: 16 },
    { x1: 14, y1: 12, x2: 24, y2: 12 },
    { x1: 24, y1: 12, x2: 24, y2: 17 },
    { x1: 24, y1: 17, x2: 26, y2: 17 },
    { x1: 9, y1: 9, x2: 11, y2: 9 },
    { x1: 24, y1: 7, x2: 27, y2: 7 },
  ],
};
export const T = CONFIG.TILE;
export const tx2px = (tx) => tx * T;
export const px2tx = (px) => px / T;
