class Car extends Phaser.GameObjects.Text {
  constructor(scene, x, y) {
    super(scene, x, y, "🚗", {
      fontFamily: "Arial, sans-serif",
      fontSize: "54px",
    });

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1);
    this.setDepth(6);

    this.body.setSize(58, 34);
    this.body.setOffset(4, 17);
    this.body.setCollideWorldBounds(true);
    this.body.setGravityY(1150);

    this.jumpVelocity = -500;
    this.moveSpeed = 220;
    this.invulnerableUntil = 0;
  }

  move(direction) {
    this.body.setVelocityX(direction * this.moveSpeed);
    if (direction !== 0) this.setFlipX(direction < 0);
  }

  jump() {
    if (this.body.blocked.down || this.body.touching.down) {
      this.body.setVelocityY(this.jumpVelocity);
      return true;
    }
    return false;
  }

  takeHit(now) {
    if (now < this.invulnerableUntil) return false;

    this.invulnerableUntil = now + 1500;
    this.scene.tweens.add({
      targets: this,
      alpha: 0.2,
      duration: 120,
      yoyo: true,
      repeat: 5,
      onComplete: () => this.setAlpha(1),
    });
    return true;
  }

  resetForStage(x, y) {
    this.setPosition(x, y);
    this.setAlpha(1);
    this.body.setVelocity(0, 0);
    this.invulnerableUntil = 0;
  }
}

window.Car = Car;
