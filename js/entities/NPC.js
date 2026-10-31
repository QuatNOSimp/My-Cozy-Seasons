export class NPC extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, cfg, x, y) {
    super(scene, x, y, `npc_${cfg.id}_idle_down_0`);
    this.cfg = cfg;
    this.homeX = x;
    this.homeY = y;
    this.r = cfg.wanderR || 80;
    this.state = "idle";
    this.t = Phaser.Math.Between(1500, 4500);
    this.v = new Phaser.Math.Vector2();

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(22, 14).setOffset(13, 42);
    scene.addDepthSorted(this);

    this.shadow = scene.add
      .image(x, y + 24, "shadow")
      .setScale(0.8)
      .setDepth(1);
  }

  update(dt) {
    this.t -= dt;
    if (this.t <= 0) {
      if (this.state === "idle" && Math.random() < 0.45) {
        this.state = "walk";
        const a = Math.random() * Math.PI * 2;
        this.v.set(Math.cos(a), Math.sin(a));
        this.t = Phaser.Math.Between(1500, 3500);
      } else {
        this.state = "idle";
        this.setFlipX(false);
        this.anims.play(`npcani_${this.cfg.id}_idle_down`, true);
        this.t = Phaser.Math.Between(2200, 5200);
      }
    }
    if (this.state === "walk") {
      const nx = this.x + (this.v.x * 26 * dt) / 1000;
      const ny = this.y + (this.v.y * 26 * dt) / 1000;
      if (Math.hypot(nx - this.homeX, ny - this.homeY) > this.r) {
        this.state = "idle";
        this.t = 0;
      } else {
        this.setPosition(nx, ny);
        const side = Math.abs(this.v.x) > Math.abs(this.v.y);
        if (side) {
          this.setFlipX(this.v.x > 0);
          this.anims.play(`npcani_${this.cfg.id}_walk_left`, true);
        } else {
          this.setFlipX(false);
          this.anims.play(`npcani_${this.cfg.id}_walk_down`, true);
        }
      }
    }
    this.shadow.setPosition(this.x, this.y + 24);
  }

  facePlayer(p) {
    this.setFlipX(p.x > this.x);
  }

  destroy(fromScene) {
    this.shadow?.destroy();
    super.destroy(fromScene);
  }
}
