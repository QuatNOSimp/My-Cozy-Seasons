import { GameState } from "../state.js";
import { clamp } from "../config.js";
import { EVT, emit } from "../GameEvents.js";

const ANIM_SET = {
  rabbit: {
    idle: "sit",
    move: "hop",
    sleep: "sleep",
    eat: "eat",
    happy: "hop",
    groom: "sit",
  },
  dog: {
    idle: "sit",
    move: "walk",
    sleep: "sleep",
    eat: "sit",
    happy: "happy",
    groom: "sit",
  },
  cat: {
    idle: "sit",
    move: "walk",
    sleep: "sleep",
    eat: "sit",
    happy: "walk",
    groom: "groom",
  },
};

export class Pet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, cfg, homeX, homeY, wanderR) {
    super(scene, homeX, homeY, `pet_${cfg.species}_${cfg.coat}_sit_0`);
    this.cfg = cfg;
    this.homeX = homeX;
    this.homeY = homeY;
    this.wanderR = wanderR;
    this.state = "sit";
    this.stateT = Phaser.Math.Between(1500, 4000);
    this.moveDir = new Phaser.Math.Vector2();
    this.speed =
      cfg.species === "rabbit" ? 60 : cfg.species === "dog" ? 55 : 42;
    this.petCooldown = 0;
    this.bubble = null;
    this.bubbleTxt = null;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(26, 16).setOffset(11, 26);
    scene.addDepthSorted(this);

    this.shadow = scene.add
      .image(homeX, homeY + 16, "shadow")
      .setScale(0.7)
      .setAlpha(0.9);
    this.setAnim("idle");
  }

  stats() {
    if (!GameState.pets[this.cfg.id]) {
      GameState.pets[this.cfg.id] = {
        hunger: 30,
        happiness: 75,
        cleanliness: 85,
        energy: 90,
      };
    }
    return GameState.pets[this.cfg.id];
  }

  animKey(name) {
    const map = ANIM_SET[this.cfg.species];
    const a = map[name] || name;
    return `pet_${this.cfg.species}_${this.cfg.coat}_${a}`;
  }

  framesOf(base) {
    let n = 0;
    while (this.scene.textures.exists(`${base}_${n}`)) n++;
    return n;
  }

  buildFrames(base, n) {
    return Array.from({ length: n }, (_, i) => ({ key: `${base}_${i}` }));
  }

  // ĐÃ SỬA: đăng ký animation TOÀN CỤC trước khi play.
  // play({key, frames}) KHÔNG tự tạo animation trong Phaser 3.
  setAnim(name) {
    const base = this.animKey(name);
    const n = this.framesOf(base);

    if (n <= 1) {
      this.anims.stop();
      if (this.scene.textures.exists(`${base}_0`)) this.setTexture(`${base}_0`);
      this.currentAnimName = name;
      return;
    }
    if (!this.scene.anims.exists(base)) {
      this.scene.anims.create({
        key: base,
        frames: this.buildFrames(base, n),
        frameRate: name === "hop" ? 6 : 5,
        repeat: -1,
      });
    }
    this.anims.play(base, true);
    this.currentAnimName = name;
  }

  update(dt) {
    this.petCooldown = Math.max(0, this.petCooldown - dt);
    this.stateT -= dt;
    const s = this.stats();
    const night =
      GameState.timeMinutes >= 20 * 60 || GameState.timeMinutes < 6 * 60;

    if (this.state === "eat") {
      if (this.stateT <= 0) {
        this.state = "sit";
        this.setAnim("idle");
      }
      return;
    }
    if (this.state === "sleep") {
      if (!night && this.stateT <= 0) {
        this.state = "sit";
        this.setAnim("idle");
        this.stateT = 1200;
      }
      if (night) this.stats().energy = clamp(s.energy + dt * 0.004, 0, 100);
      return;
    }
    if (this.stateT <= 0) this.pickState(night, s);

    if (this.state === "move") {
      const px = this.x + (this.moveDir.x * this.speed * dt) / 1000;
      const py = this.y + (this.moveDir.y * this.speed * dt) / 1000;
      if (Math.hypot(px - this.homeX, py - this.homeY) > this.wanderR)
        this.pickState(night, s);
      else {
        this.setPosition(px, py);
        this.setFlipX(this.moveDir.x > 0);
      }
    }
    // phản ứng khi người chơi đến gần (chó mừng)
    const pl = this.scene.player;
    if (
      pl &&
      this.state === "sit" &&
      Phaser.Math.Distance.Between(this.x, this.y, pl.x, pl.y) < 70 &&
      this.cfg.species === "dog" &&
      this.petCooldown <= 0
    ) {
      this.setAnim("happy");
      this.state = "happyreact";
      this.stateT = 1600;
    }
    if (this.state === "happyreact" && this.stateT <= 0) {
      this.state = "sit";
      this.setAnim("idle");
    }

    this.shadow.setPosition(this.x, this.y + 16);
    this.updateBubble(s);
  }

  pickState(night, s) {
    const roll = Math.random();
    if (night || s.energy < 22) {
      this.state = "sleep";
      this.setAnim("sleep");
      this.stateT = Phaser.Math.Between(9000, 16000);
      return;
    }
    if (this.cfg.species === "cat" && roll < 0.22) {
      this.state = "grooming";
      this.setAnim("groom");
      this.stateT = 2200;
      return;
    }
    if (roll < 0.45) {
      this.state = "move";
      this.setAnim("move");
      const a = Math.random() * Math.PI * 2;
      this.moveDir.set(Math.cos(a), Math.sin(a));
      this.stateT = Phaser.Math.Between(1200, 3000);
    } else {
      this.state = "sit";
      this.setAnim("idle");
      this.stateT = Phaser.Math.Between(2500, 6500);
    }
  }

  updateBubble(s) {
    const need = s.hunger > 72 ? "!" : s.cleanliness < 25 ? "~" : null;
    if (need && !this.bubble) {
      this.bubble = this.scene.add
        .image(this.x, this.y - 42, "bubble")
        .setScale(0.8)
        .setDepth(800);
      this.bubbleTxt = this.scene.add
        .text(this.x, this.y - 46, need, {
          fontSize: "16px",
          fontWeight: "900",
          color: "#e8543f",
        })
        .setOrigin(0.5)
        .setDepth(801);
    } else if (!need && this.bubble) {
      this.bubble.destroy();
      this.bubbleTxt.destroy();
      this.bubble = null;
      this.bubbleTxt = null;
    }
    if (this.bubble) {
      const by = this.y - 42 + Math.sin(this.scene.time.now / 300) * 2;
      this.bubble.setPosition(this.x, by);
      this.bubbleTxt.setPosition(this.x, by - 4);
    }
  }

  feed() {
    const s = this.stats();
    s.hunger = 0;
    s.happiness = clamp(s.happiness + 12, 0, 100);
    this.state = "eat";
    this.setAnim("eat");
    this.stateT = 2200;
    this.petCooldown = 6000;
    emit(EVT.PET_CHANGE, this.cfg.id);
    emit(EVT.SAVE);
  }

  petted() {
    const s = this.stats();
    s.happiness = clamp(s.happiness + 15, 0, 100);
    this.petCooldown = 9000;
    if (this.cfg.species === "dog") {
      this.setAnim("happy");
      this.state = "happyreact";
      this.stateT = 1800;
    } else {
      this.state = "sit";
      this.setAnim("idle");
    }
    this.scene.add
      .particles(this.x, this.y - 30, "pt_heart", {
        lifespan: 1100,
        speedY: { min: -40, max: -70 },
        speedX: { min: -16, max: 16 },
        quantity: 4,
        emitting: false,
      })
      .setDepth(820)
      .explode(4);
    emit(EVT.PET_CHANGE, this.cfg.id);
    emit(EVT.SAVE);
  }

  decayHour() {
    const s = this.stats();
    s.hunger = clamp(s.hunger + 1.6, 0, 100);
    s.cleanliness = clamp(s.cleanliness - 0.6, 0, 100);
    s.happiness = clamp(s.happiness - (s.hunger > 70 ? 1.6 : 0.7), 0, 100);
    s.energy = clamp(s.energy - 0.9, 0, 100);
  }

  endDay() {
    const s = this.stats();
    s.hunger = clamp(s.hunger + 24, 0, 100);
    s.energy = 100;
    s.cleanliness = clamp(s.cleanliness - 12, 0, 100);
    s.happiness = clamp(s.happiness - (s.hunger > 70 ? 14 : 4), 0, 100);
  }

  destroy(fromScene) {
    this.shadow?.destroy();
    this.bubble?.destroy();
    this.bubbleTxt?.destroy();
    super.destroy(fromScene);
  }
}
