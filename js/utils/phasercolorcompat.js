const RGB_RE = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i;

export function toColorInt(c) {
  if (typeof c === "number") return c;
  if (typeof c !== "string") return c;
  const s = c.trim();
  if (s[0] === "#") {
    return Phaser.Display.Color.HexStringToColor(s).color;
  }
  const m = RGB_RE.exec(s);
  if (m) return Phaser.Display.Color.GetColor(+m[1], +m[2], +m[3]);
  if (/^0x[0-9a-f]+$/i.test(s)) return parseInt(s, 16);
  console.warn("[colorCompat] Màu không hợp lệ:", c);
  return 0xff00ff;
}

function wrapMethod(proto, name, colorArgIdx) {
  const orig = proto[name];
  if (typeof orig !== "function" || orig.__colorCompat) return;
  const wrapped = function (...args) {
    for (const i of colorArgIdx) {
      if (typeof args[i] === "string") args[i] = toColorInt(args[i]);
    }
    return orig.apply(this, args);
  };
  wrapped.__colorCompat = true;
  proto[name] = wrapped;
}

export function installColorCompat() {
  const Gfx = Phaser.GameObjects.Graphics.prototype;
  wrapMethod(Gfx, "fillStyle", [0]); //  (color, alpha)
  wrapMethod(Gfx, "lineStyle", [1]); //  (width, color, alpha)
  wrapMethod(Gfx, "fillGradientStyle", [0, 1, 2, 3]);
  const Shape = Phaser.GameObjects.Shape.prototype;
  wrapMethod(Shape, "setFillStyle", [0]); //  (color, alpha)
  wrapMethod(Shape, "setStrokeStyle", [1]); //  (width, color, alpha)
}
