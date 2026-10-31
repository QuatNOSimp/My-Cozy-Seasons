import { GameState, newGamePayload } from "../state.js";
import { SaveSystem } from "../systems/SaveSystem.js";
import { SEASONS } from "../data/seasons.js";
import SFX from "../SoundFX.js";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("Menu");
  }

  create() {
    this.drawBackdrop();
    this.buildDOM();
  }

  drawBackdrop() {
    const { width: W, height: H } = this.scale;
    const season = SEASONS[0];
    // trời
    const bands = ["#a8dcf5", "#bfe3f2", "#d4eef8", "#e8f5d9"];
    bands.forEach((c, i) => {
      this.add
        .rectangle(
          0,
          (H / bands.length) * i,
          W,
          H / bands.length + 2,
          Phaser.Display.Color.HexStringToColor(c).color,
        )
        .setOrigin(0, 0);
    });
    // mặt trời
    const sun = this.add.circle(W - 180, 110, 46, 0xfff3c9);
    this.add.circle(W - 180, 110, 60, 0xfff3c9, 0.3);
    this.tweens.add({
      targets: sun,
      scale: 1.06,
      duration: 2600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    // đồi
    const hill = this.add.graphics();
    hill.fillStyle(0x9ecb7f, 1);
    hill.fillEllipse(W * 0.25, H + 140, W * 0.9, 380);
    hill.fillStyle(0x8cc070, 1);
    hill.fillEllipse(W * 0.85, H + 180, W * 0.9, 420);
    // nhà & cây preview
    this.add.image(W * 0.5, H * 0.62, "house").setScale(0.9);
    this.add.image(W * 0.16, H * 0.66, "tree_0").setScale(1.3);
    this.add.image(W * 0.84, H * 0.68, "tree_maple").setScale(1.25);
    this.add.image(W * 0.28, H * 0.8, "hutch").setScale(0.8);
    // cánh hoa bay
    const em = this.add.particles(0, 0, "pt_petal", {
      x: { min: 0, max: W },
      y: -20,
      lifespan: 9000,
      speedY: { min: 26, max: 60 },
      speedX: { min: -20, max: 30 },
      rotate: { start: 0, end: 360 },
      scale: { start: 0.8, end: 1.2 },
      frequency: 420,
      alpha: { start: 0.9, end: 0 },
    });
    em.setDepth(5);
  }

  buildDOM() {
    const root = document.getElementById("ui-root");
    const hasSave = SaveSystem.hasValidSave();
    root.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:14px;margin-top:-140px" class="anim-fadeup">
        <div style="text-align:center">
          <h1 style="font-size:52px;font-weight:900;color:#fff;text-shadow:0 4px 0 rgba(92,74,61,.35),0 10px 30px rgba(0,0,0,.3);letter-spacing:1px">My Cozy Seasons</h1>
          <p style="color:#fff;font-weight:800;text-shadow:0 2px 8px rgba(0,0,0,.35);font-size:15px">Khu vườn nhỏ · Bốn mùa · Những người bạn lông mềm</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;min-width:270px">
          ${hasSave ? '<button class="btn btn-primary" id="btn-continue" style="font-size:16px;padding:13px">Tiếp tục</button>' : ""}
          <button class="btn ${hasSave ? "btn-soft" : "btn-primary"}" id="btn-new" style="font-size:16px;padding:13px">Chơi mới</button>
          <button class="btn btn-soft" id="btn-help">Hướng dẫn</button>
        </div>
      </div>`;
    root.querySelector("#btn-continue")?.addEventListener("click", () => {
      SFX.blip();
      SaveSystem.load();
      root.innerHTML = "";
      this.scene.start("Game");
    });
    root.querySelector("#btn-new").addEventListener("click", () => {
      SFX.blip();
      this.showCharacterCreation();
    });
    root.querySelector("#btn-help").addEventListener("click", () => {
      SFX.blip();
      this.showHelp();
    });
  }

  showHelp() {
    const root = document.getElementById("ui-root");
    const wrap = document.createElement("div");
    wrap.className = "overlay anim-fade";
    wrap.innerHTML = `
      <div class="panel anim-pop" style="max-width:430px">
        <button class="panel-close">✕</button>
        <h3>Điều khiển</h3>
        <div class="help-grid">
          <kbd>W A S D</kbd><span>Di chuyển (hoặc phím mũi tên)</span>
          <kbd>Shift</kbd><span>Chạy</span>
          <kbd>E</kbd><span>Tương tác vật gần nhất</span>
          <kbd>I</kbd><span>Túi đồ (chọn hạt/công cụ để dùng)</span>
          <kbd>Q</kbd><span>Xem chỉ số thú cưng (đứng cạnh)</span>
          <kbd>P</kbd><span>Chụp ảnh khu vườn</span>
          <kbd>Esc</kbd><span>Menu tạm dừng</span>
        </div>
        <div class="btn-row"><button class="btn btn-primary back-btn">Đã hiểu</button></div>
      </div>`;
    const close = () => {
      wrap.remove();
    };
    wrap.querySelector(".panel-close").onclick = close;
    wrap.querySelector(".back-btn").onclick = close;
    root.appendChild(wrap);
  }

  showCharacterCreation() {
    const root = document.getElementById("ui-root");
    const wrap = document.createElement("div");
    wrap.className = "overlay anim-fade";
    wrap.innerHTML = `
      <div class="panel anim-pop" style="min-width:480px">
        <button class="panel-close">✕</button>
        <h3 style="justify-content:center">Tạo nhân vật</h3>
        <div class="pet-preview-row">
          <div class="pet-pick active" data-g="female">
            <div id="prev-female" style="height:116px;width:96px;display:flex;align-items:flex-end;justify-content:center"></div>
            <b>Nữ</b>
          </div>
          <div class="pet-pick" data-g="male">
            <div id="prev-male" style="height:116px;width:96px;display:flex;align-items:flex-end;justify-content:center"></div>
            <b>Nam</b>
          </div>
        </div>
        <div style="display:flex;justify-content:center;margin-bottom:6px">
          <input class="name-input" id="char-name" maxlength="12" placeholder="Tên của bạn" value="">
        </div>
        <div class="btn-row">
          <button class="btn btn-soft back-btn">Quay lại</button>
          <button class="btn btn-primary" id="btn-start">Bắt đầu cuộc sống mới</button>
        </div>
      </div>`;
    root.appendChild(wrap);

    let gender = "female";
    // preview animation thật bằng sprite Phaser đặt lên div
    const mkPreview = (holderId, g2) => {
      const holder = wrap.querySelector(holderId);
      const cv = document.createElement("canvas");
      cv.width = 96;
      cv.height = 116;
      holder.appendChild(cv);
      const ctx = cv.getContext("2d");
      let frame = 0;
      const tick = () => {
        if (!wrap.isConnected) return;
        ctx.clearRect(0, 0, 96, 116);
        for (let f = 0; f < 2; f++) {
          const img = this.textures
            .get(`pf_${g2}_idle_down_${(frame + f) % 2}`)
            .getSourceImage();
          ctx.save();
          ctx.translate(f === 0 ? 24 : 0, f === 0 ? 58 - 14 : 0);
          ctx.scale(f === 0 ? 0.9 : 2, f === 0 ? 0.9 : 2);
          if (f === 0) ctx.globalAlpha = 0;
          ctx.drawImage(img, 0, 0);
          ctx.restore();
        }
        // vẽ frame idle tỉ lệ 2x
        const img = this.textures
          .get(`pf_${g2}_idle_down_${frame % 2}`)
          .getSourceImage();
        ctx.clearRect(0, 0, 96, 116);
        ctx.drawImage(img, 0, 0, 48, 58, 0, 0, 96, 116);
        frame++;
        setTimeout(tick, 520);
      };
      tick();
    };
    mkPreview("#prev-female", "female");
    mkPreview("#prev-male", "male");

    wrap.querySelectorAll(".pet-pick").forEach((el) => {
      el.addEventListener("click", () => {
        SFX.pop();
        wrap
          .querySelectorAll(".pet-pick")
          .forEach((x) => x.classList.remove("active"));
        el.classList.add("active");
        gender = el.dataset.g;
      });
    });
    const close = () => wrap.remove();
    wrap.querySelector(".panel-close").onclick = close;
    wrap.querySelector(".back-btn").onclick = close;
    wrap.querySelector("#btn-start").addEventListener("click", () => {
      const name = wrap.querySelector("#char-name").value.trim();
      SFX.quest();
      newGamePayload(gender, name);
      root.innerHTML = "";
      this.scene.start("Game");
    });
  }
}
