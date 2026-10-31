import { GameState } from "../state.js";

export const DialogueUI = {
  active: false,
  lines: [],
  idx: 0,
  onDone: null,
  el: null,
  typeTimer: null,
  fullText: "",
  shown: 0,
  scene: null,

  show(scene, { name, portraitKey, lines, onDone }) {
    this.forceClose();
    this.scene = scene;
    this.lines = lines;
    this.idx = 0;
    this.onDone = onDone;
    this.active = true;
    GameState.uiOpen = true;

    let portrait = "";
    const tex = scene.textures.get(portraitKey);
    const src = tex?.getSourceImage?.();
    if (src?.toDataURL) portrait = src.toDataURL();

    const root = document.getElementById("ui-root");
    this.el = document.createElement("div");
    this.el.style.cssText =
      "position:absolute;bottom:86px;left:50%;transform:translateX(-50%);z-index:55";
    this.el.innerHTML = `
      <div class="panel anim-fadeup" style="min-width:420px;max-width:520px;padding:14px 18px;cursor:pointer">
        <div style="display:flex;gap:12px;align-items:flex-start">
          ${portrait ? `<img src="${portrait}" style="width:56px;height:68px;background:#fbf3e2;border-radius:12px;border:2px solid #e4d3b4">` : ""}
          <div style="flex:1">
            <b style="color:#e8963c;font-size:14px">${name}</b>
            <p id="dlg-text" style="font-size:13.5px;font-weight:700;line-height:1.5;min-height:42px;margin-top:3px"></p>
          </div>
        </div>
        <div style="text-align:right;font-size:10px;color:#8a7362;font-weight:800">Nhấn E hoặc nhấp để tiếp tục</div>
      </div>`;
    this.el.addEventListener("click", () => this.advance());
    root.appendChild(this.el);
    this.renderLine();
  },

  renderLine() {
    const tx = this.el.querySelector("#dlg-text");
    this.fullText = this.lines[this.idx];
    this.shown = 0;
    clearInterval(this.typeTimer);
    this.typeTimer = setInterval(() => {
      this.shown++;
      tx.textContent = this.fullText.slice(0, this.shown);
      if (this.shown >= this.fullText.length) clearInterval(this.typeTimer);
    }, 18);
  },

  advance() {
    if (!this.active) return;
    const tx = this.el?.querySelector("#dlg-text");
    if (this.shown < this.fullText.length) {
      clearInterval(this.typeTimer);
      this.shown = this.fullText.length;
      if (tx) tx.textContent = this.fullText;
      return;
    }
    this.idx++;
    if (this.idx >= this.lines.length) {
      const cb = this.onDone;
      this.forceClose();
      cb?.();
    } else this.renderLine();
  },

  isActive() {
    return this.active;
  },

  forceClose() {
    clearInterval(this.typeTimer);
    this.el?.remove();
    this.el = null;
    this.active = false;
    GameState.uiOpen = false;
  },
};
