class WordItem extends Phaser.GameObjects.Text {
  constructor(scene, groundY) {
    super(scene, 0, 0, "⭐", {
      fontFamily: "Arial, sans-serif",
      fontSize: "46px",
    });

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5).setDepth(7);
    this.body.setAllowGravity(false);
    this.body.setSize(40, 40);
    this.groundY = groundY;
    this.collected = false;
    this.spawned = false;
    this.setActive(false).setVisible(false);
    this.body.enable = false;
  }

  spawn() {
    this.spawned = true;
    this.collected = false;
    this.setPosition(850, this.groundY - 78);
    this.setActive(true).setVisible(true);
    this.body.enable = true;
    this.body.updateFromGameObject();
    this.scene.tweens.add({
      targets: this,
      scale: 1.22,
      angle: 12,
      duration: 420,
      yoyo: true,
      repeat: -1,
    });
  }

  update(delta, speed) {
    if (!this.active) return;
    this.x -= speed * delta / 1000;
    this.body.updateFromGameObject();

    if (this.x < -60 && !this.collected) {
      this.setPosition(850, this.groundY - 78);
      this.body.updateFromGameObject();
    }
  }

  collect() {
    if (!this.active || this.collected) return false;
    this.collected = true;
    this.scene.tweens.killTweensOf(this);
    this.setActive(false).setVisible(false);
    this.body.enable = false;
    return true;
  }

  reset() {
    this.scene.tweens.killTweensOf(this);
    this.spawned = false;
    this.collected = false;
    this.setScale(1).setAngle(0);
    this.setActive(false).setVisible(false);
    this.body.enable = false;
  }
}

window.WordItem = WordItem;
