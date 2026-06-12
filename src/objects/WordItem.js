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
    this.body.setSize(52, 52);
    this.groundY = groundY;
    this.spawnY = groundY - 25;
    this.collected = false;
    this.spawned = false;
    this.setActive(false).setVisible(false);
    this.body.enable = false;
  }

  spawn(speed) {
    this.spawned = true;
    this.collected = false;
    this.setPosition(850, this.spawnY);
    this.setActive(true).setVisible(true);
    this.body.enable = true;
    this.body.updateFromGameObject();
    this.body.setVelocityX(-speed);
    this.scene.tweens.add({
      targets: this,
      scale: 1.22,
      angle: 12,
      duration: 420,
      yoyo: true,
      repeat: -1,
    });
  }

  update(speed) {
    if (!this.active) return;

    if (this.x < -60 && !this.collected) {
      this.setPosition(850, this.spawnY);
      this.body.updateFromGameObject();
      this.body.setVelocityX(-speed);
    }
  }

  collect() {
    if (!this.active || this.collected) return false;
    this.collected = true;
    this.scene.tweens.killTweensOf(this);
    this.body.setVelocityX(0);
    this.setActive(false).setVisible(false);
    this.body.enable = false;
    return true;
  }

  reset() {
    this.scene.tweens.killTweensOf(this);
    this.spawned = false;
    this.collected = false;
    this.body.setVelocityX(0);
    this.setScale(1).setAngle(0);
    this.setActive(false).setVisible(false);
    this.body.enable = false;
  }
}

window.WordItem = WordItem;
