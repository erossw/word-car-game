const OBSTACLE_TYPES = [
  { key: "pit", emoji: "🕳️", width: 54, height: 24, yOffset: 2 },
  { key: "rock", emoji: "🪨", width: 44, height: 38, yOffset: 0 },
  { key: "cactus", emoji: "🌵", width: 38, height: 54, yOffset: 0 },
  { key: "doubleCactus", emoji: "🌵🌵", width: 72, height: 54, yOffset: 0 },
];

class ObstacleSpawner {
  constructor(scene, groundY) {
    this.scene = scene;
    this.groundY = groundY;
    this.group = scene.physics.add.group({
      allowGravity: false,
      immovable: true,
    });
    this.pool = [];
    this.elapsed = 0;
    this.nextInterval = 0;
  }

  reset(interval) {
    this.elapsed = 0;
    this.nextInterval = interval * Phaser.Math.FloatBetween(0.75, 1.05);
    this.pool.forEach(obstacle => this.release(obstacle));
  }

  update(delta, speed, interval, enabled = true) {
    this.pool.forEach(obstacle => {
      if (!obstacle.active) return;
      obstacle.x -= speed * delta / 1000;
      obstacle.body.updateFromGameObject();
      if (obstacle.x < -100) this.release(obstacle);
    });

    if (!enabled) return;
    this.elapsed += delta;
    if (this.elapsed >= this.nextInterval) {
      this.elapsed = 0;
      this.nextInterval = interval * Phaser.Math.FloatBetween(0.82, 1.18);
      this.spawn();
    }
  }

  spawn() {
    const maxType = this.scene.stageConfig.stage < 4 ? 2 : OBSTACLE_TYPES.length;
    const type = OBSTACLE_TYPES[Phaser.Math.Between(0, maxType - 1)];
    let obstacle = this.pool.find(item => !item.active);

    if (!obstacle) {
      obstacle = this.scene.add.text(0, 0, type.emoji, {
        fontFamily: "Arial, sans-serif",
        fontSize: "48px",
      });
      obstacle.setOrigin(0.5, 1).setDepth(5);
      this.scene.physics.add.existing(obstacle);
      obstacle.body.setAllowGravity(false);
      obstacle.body.setImmovable(true);
      this.group.add(obstacle);
      this.pool.push(obstacle);
    }

    obstacle.setText(type.emoji);
    obstacle.setPosition(860, this.groundY + type.yOffset);
    obstacle.setActive(true).setVisible(true);
    obstacle.body.enable = true;
    obstacle.body.setSize(type.width, type.height);
    obstacle.body.setOffset(
      Math.max(0, (obstacle.width - type.width) / 2),
      Math.max(0, obstacle.height - type.height),
    );
    obstacle.body.updateFromGameObject();
  }

  release(obstacle) {
    obstacle.setActive(false).setVisible(false);
    if (obstacle.body) obstacle.body.enable = false;
  }
}

window.ObstacleSpawner = ObstacleSpawner;
