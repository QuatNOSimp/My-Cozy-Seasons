import { CONFIG } from "../config.js";
import { GameState } from "../state.js";

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, gender) {
    super(scene, x, y, `pf_${gender}_idle_down_0`);
    this.gender = gender;
    this.dir = "down";
    this.locked = false;
    this.sitting = false;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(22, 14).setOffset(13, 42);
    scene.addDepthSorted(this);

    this.shadow = scene.add
      .image(x, y + 24, "shadow")
      .setScale(0.8)
      .setDepth(1);
    this.actionCallback = null;
    this.buildAnims();
    this.anims.play(`${this.g}_idle_down`, true);
  }
  get g() {
    return this.gender;
  }

  buildAnims() {
    const LOOP_POSES = new Set(["idle", "walk"]);

    const mk = (key, frames, rate = 8, repeat = -1) => {
      if (this.scene.anims.exists(key)) {
        this.scene.anims.remove(key);
      }

      this.scene.anims.create({
        key,
        frames: frames.map((f) => ({ key: f })),
        frameRate: rate,
        repeat,
      });
    };

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

    for (const [pose, n] of Object.entries(poses)) {
      const repeat = LOOP_POSES.has(pose) ? -1 : 0;
      const rate = pose === "walk" ? 9 : 5;

      for (const dir of ["down", "up", "left"]) {
        mk(
          `${this.g}_${pose}_${dir}`,
          Array.from(
            { length: n },
            (_, i) => `pf_${this.g}_${pose}_${dir}_${i}`,
          ),
          rate,
          repeat,
        );
      }
    }

    mk(`${this.g}_sleep_down`, [`pf_${this.g}_sleep_down_0`], 1, -1);
    mk(`${this.g}_sit_down`, [`pf_${this.g}_sit_down_0`], 1, 0);
  }

  dirAnimSuffix() {
    return this.dir === "right" ? "left" : this.dir;
  }

  faceToward(x, y) {
    const dx = x - this.x,
      dy = y - this.y;
    if (Math.abs(dx) > Math.abs(dy)) this.dir = dx > 0 ? "right" : "left";
    else this.dir = dy > 0 ? "down" : "up";
    this.setFlipX(this.dir === "right");
  }

  playAction(name, onDone) {
    if (this.locked) return;

    const suffix = this.dirAnimSuffix();
    const key = `${this.g}_${name}_${suffix}`;

    // Nếu thiếu animation thì không được khóa player mãi mãi
    if (!this.scene.anims.exists(key)) {
      console.warn(`[Player] Thiếu animation hành động: ${key}`);
      this.anims.play(`${this.g}_idle_${suffix}`, true);
      onDone?.();
      return;
    }

    this.locked = true;
    this.body.setVelocity(0);
    this.anims.timeScale = 1;

    // Xóa listener complete cũ nếu có, tránh callback bị gọi chồng
    this.off(Phaser.Animations.Events.ANIMATION_COMPLETE);

    const finish = () => {
      this.locked = false;
      this.anims.play(`${this.g}_idle_${suffix}`, true);
      onDone?.();
    };

    // Chơi lần 1
    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      // Chơi lần 2 cho mượt rồi kết thúc
      this.anims.play(key, true);

      this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        finish();
      });
    });

    this.anims.play(key, true);

    if (this.anims.currentAnim) {
      this.anims.currentAnim.repeat = 0;
    }
  }

  playSleep(onDone) {
    this.locked = true;
    this.anims.play(`${this.g}_sleep_down`, true);
    this.scene.time.delayedCall(900, onDone);
  }

  sit() {
    if (this.sitting) return;

    this.sitting = true;
    this.locked = true;
    this.body.setVelocity(0);
    this.anims.play(`${this.g}_sit_down`, true);
  }

  standUp() {
    if (!this.sitting) return;

    this.sitting = false;
    this.locked = false;
    this.body.setVelocity(0);
    this.anims.play(`${this.g}_idle_${this.dirAnimSuffix()}`, true);
  }

  toggleSit() {
    if (this.sitting) {
      this.standUp();
    } else {
      this.sit();
    }
  }

  update(keys) {
    let mx = 0,
      my = 0;
    if (!this.locked && !GameState.uiOpen && !this.sitting) {
      if (keys.left.isDown) mx = -1;
      else if (keys.right.isDown) mx = 1;
      if (keys.up.isDown) my = -1;
      else if (keys.down.isDown) my = 1;
    }
    const run = keys.shift.isDown;
    const spd = run ? CONFIG.RUN : CONFIG.WALK;
    if (mx && my) {
      mx *= 0.7071;
      my *= 0.7071;
    }
    this.body.setVelocity(mx * spd, my * spd);

    if (mx || my) {
      if (mx) this.dir = mx > 0 ? "right" : "left";
      else this.dir = my > 0 ? "down" : "up";
      this.setFlipX(this.dir === "right");
      const key = `${this.g}_walk_${this.dirAnimSuffix()}`;
      if (!this.anims.currentAnim || this.anims.currentAnim.key !== key) {
        this.anims.play(key, true);
      }
      // AnimationState KHÔNG có setTimeScale() — gán trực tiếp property
      this.anims.timeScale = run ? 1.5 : 1;
    } else if (!this.locked && !this.sitting) {
      const key = `${this.g}_idle_${this.dirAnimSuffix()}`;
      if (!this.anims.currentAnim || this.anims.currentAnim.key !== key) {
        this.anims.play(key, true);
      }
      this.anims.timeScale = 1; // trả về tốc độ thường khi đứng yên
    }
    this.shadow.setPosition(this.x, this.y + 24);
  }

  destroy(fromScene) {
    this.shadow?.destroy();
    super.destroy(fromScene);
  }
}
