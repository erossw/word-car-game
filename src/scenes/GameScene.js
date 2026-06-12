class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  init(data) {
    this.session = data.session || { stage: 1, score: 0, lives: 3, combo: 0 };
  }

  create() {
    this.stageConfig = window.getStageConfig(this.session.stage);
    if (this.session.gradeStage === this.session.stage) {
      this.stageConfig.gradeLevel = this.session.gradeLevel;
    } else {
      this.session.gradeStage = this.session.stage;
      this.session.gradeLevel = this.stageConfig.gradeLevel;
    }
    this.stageStartScore = this.session.score;
    this.distance = 0;
    this.distanceRemainder = 0;
    this.isQuizOpen = false;
    this.isTransitioning = false;
    this.quizPassed = false;
    this.quizElapsed = 0;
    this.groundY = 330;
    this.wordData = window.wordManager.getWord(this.stageConfig.gradeLevel);

    this.drawWorld();
    this.createGround();
    this.car = new window.Car(this, 125, this.groundY);
    this.physics.add.collider(this.car, this.ground);

    this.obstacles = new window.ObstacleSpawner(this, this.groundY);
    this.obstacles.reset(this.stageConfig.obstacleInterval);
    this.physics.add.overlap(
      this.car,
      this.obstacles.group,
      this.handleObstacleHit,
      undefined,
      this,
    );

    this.wordItem = new window.WordItem(this, this.groundY);
    this.physics.add.overlap(
      this.car,
      this.wordItem,
      this.handleWordItem,
      undefined,
      this,
    );

    this.createHud();
    this.bindInput();
    this.createTouchControls();
    this.showStageBanner();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.quizController.hide();
    });
  }

  drawWorld() {
    const theme = window.STAGE_THEMES[this.stageConfig.bgTheme];
    this.cameras.main.setBackgroundColor(theme.sky);

    this.background = this.add.graphics();
    if (this.stageConfig.bgTheme === "day" || this.stageConfig.bgTheme === "evening") {
      this.background.fillStyle(theme.accent, 0.85).fillCircle(680, 72, 34);
      this.background.fillStyle(0xffffff, 0.7);
      this.background.fillEllipse(130, 82, 115, 35);
      this.background.fillEllipse(520, 130, 140, 40);
    } else {
      this.background.fillStyle(theme.accent, 0.85);
      for (let i = 0; i < 42; i++) {
        this.background.fillCircle(
          Phaser.Math.Between(0, 800),
          Phaser.Math.Between(20, 255),
          Phaser.Math.Between(1, 3),
        );
      }
    }

    this.background.fillStyle(theme.ground).fillRect(0, this.groundY, 800, 70);
    this.background.fillStyle(theme.road).fillRect(0, this.groundY + 12, 800, 58);
    this.roadStripes = [];
    for (let i = 0; i < 7; i++) {
      const stripe = this.add.rectangle(i * 140 + 30, 365, 72, 6, 0xf8fafc, 0.8);
      this.roadStripes.push(stripe);
    }
  }

  createGround() {
    this.ground = this.add.rectangle(400, 348, 800, 36, 0x000000, 0);
    this.physics.add.existing(this.ground, true);
    this.ground.body.updateFromGameObject();
  }

  createHud() {
    const style = {
      fontFamily: "Arial, sans-serif",
      fontSize: "18px",
      fontStyle: "bold",
      color: "#ffffff",
      stroke: "#172033",
      strokeThickness: 4,
    };
    this.stageText = this.add.text(18, 14, "", style).setDepth(20);
    this.scoreText = this.add.text(220, 14, "", style).setDepth(20);
    this.livesText = this.add.text(610, 14, "", style).setDepth(20);

    this.progressTrack = this.add.rectangle(400, 54, 360, 12, 0x172033, 0.7)
      .setOrigin(0.5)
      .setDepth(19);
    this.progressBar = this.add.rectangle(220, 54, 360, 8, 0xfacc15)
      .setOrigin(0, 0.5)
      .setScale(0, 1)
      .setDepth(20);
    this.updateHud();
  }

  bindInput() {
    const touchControlsRightEdge = 155;
    this.keys = this.input.keyboard.addKeys({
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      d: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.touchMoveDirection = 0;
    this.input.on("pointerdown", pointer => {
      if (!this.isQuizOpen && pointer.y > 70 && pointer.x > touchControlsRightEdge) {
        this.car.jump();
      }
    });
  }

  createTouchControls() {
    const createControl = (x, label, direction) => {
      const control = this.add.circle(x, 280, 28, 0x172033, 0.65)
        .setStrokeStyle(2, 0xffffff, 0.8)
        .setDepth(25)
        .setScrollFactor(0)
        .setInteractive();
      this.add.text(x, 280, label, {
        fontFamily: "Arial, sans-serif",
        fontSize: "25px",
        fontStyle: "bold",
        color: "#ffffff",
      }).setOrigin(0.5).setDepth(26);

      control.on("pointerdown", () => {
        this.touchMoveDirection = direction;
      });
      control.on("pointerup", () => {
        if (this.touchMoveDirection === direction) this.touchMoveDirection = 0;
      });
      control.on("pointerout", () => {
        if (this.touchMoveDirection === direction) this.touchMoveDirection = 0;
      });
    };

    createControl(50, "◀", -1);
    createControl(120, "▶", 1);
    this.input.on("pointerup", () => {
      this.touchMoveDirection = 0;
    });
  }

  showStageBanner() {
    const banner = this.add.text(400, 155,
      `STAGE ${this.session.stage}\nGRADE ${this.stageConfig.gradeLevel}`, {
        fontFamily: "Arial, sans-serif",
        fontSize: "30px",
        fontStyle: "bold",
        color: "#ffffff",
        align: "center",
        stroke: "#172033",
        strokeThickness: 7,
      }).setOrigin(0.5).setDepth(30);
    this.tweens.add({
      targets: banner,
      alpha: 0,
      y: 125,
      delay: 700,
      duration: 450,
      onComplete: () => banner.destroy(),
    });
  }

  update(_time, delta) {
    if (this.isQuizOpen || this.isTransitioning) return;

    if (Phaser.Input.Keyboard.JustDown(this.keys.space)
      || Phaser.Input.Keyboard.JustDown(this.keys.up)) {
      this.car.jump();
    }

    const moveDirection = this.keys.left.isDown || this.keys.a.isDown
      ? -1
      : this.keys.right.isDown || this.keys.d.isDown
        ? 1
        : this.touchMoveDirection;
    this.car.move(moveDirection);

    const distanceDelta = this.stageConfig.scrollSpeed * delta / 1000;
    this.distance += distanceDelta;
    this.distanceRemainder += distanceDelta;
    const earnedDistancePoints = Math.floor(this.distanceRemainder / 10);
    if (earnedDistancePoints > 0) {
      this.session.score += earnedDistancePoints;
      this.distanceRemainder -= earnedDistancePoints * 10;
    }

    this.roadStripes.forEach(stripe => {
      stripe.x -= distanceDelta;
      if (stripe.x < -50) stripe.x += 980;
    });

    this.obstacles.update(
      delta,
      this.stageConfig.scrollSpeed,
      this.stageConfig.obstacleInterval,
      true,
    );
    this.wordItem.update(this.stageConfig.scrollSpeed);

    if (!this.wordItem.spawned
      && this.distance >= this.stageConfig.targetDistance * 0.45) {
      this.wordItem.spawn(this.stageConfig.scrollSpeed);
    }
    if (this.quizPassed && this.distance >= this.stageConfig.targetDistance) {
      this.completeStage();
    }
    this.updateHud();
  }

  handleObstacleHit() {
    if (this.isQuizOpen || this.isTransitioning) return;
    if (!this.car.takeHit(this.time.now)) return;

    this.session.lives -= 1;
    this.cameras.main.shake(150, 0.008);
    this.updateHud();
    if (this.session.lives <= 0) this.endGame();
  }

  handleWordItem() {
    if (this.isQuizOpen || this.isTransitioning || !this.wordItem.collect()) return;

    this.isQuizOpen = true;
    this.touchMoveDirection = 0;
    this.car.move(0);
    this.physics.pause();
    const distractors = window.wordManager.getDistractors(
      this.wordData,
      this.stageConfig.gradeLevel,
    );
    window.quizController.show(this.wordData, distractors, {
      onCorrect: elapsed => this.handleCorrectAnswer(elapsed),
      onWrong: () => this.handleWrongAnswer(),
    });
  }

  handleCorrectAnswer(elapsed) {
    this.physics.resume();
    this.isQuizOpen = false;
    this.session.combo += 1;
    this.quizPassed = true;
    this.quizElapsed = elapsed;
    this.updateHud();

    if (this.distance >= this.stageConfig.targetDistance) {
      this.completeStage();
      return;
    }

    const message = this.add.text(400, 165, "정답!\n목표 지점까지 달리세요", {
      fontFamily: "Arial, sans-serif",
      fontSize: "28px",
      fontStyle: "bold",
      color: "#fef08a",
      align: "center",
      stroke: "#172033",
      strokeThickness: 7,
    }).setOrigin(0.5).setDepth(30);
    this.time.delayedCall(900, () => message.destroy());
  }

  completeStage() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    const multiplier = this.session.combo >= 3 ? 2 : this.session.combo === 2 ? 1.5 : 1;
    this.session.score += Math.round(150 * multiplier);
    if (this.quizElapsed <= 5000) this.session.score += 50;
    this.updateHud();

    const message = this.add.text(400, 165,
      `STAGE CLEAR\n+${Math.round(150 * multiplier) + (this.quizElapsed <= 5000 ? 50 : 0)}점`, {
        fontFamily: "Arial, sans-serif",
        fontSize: "28px",
        fontStyle: "bold",
        color: "#fef08a",
        align: "center",
        stroke: "#172033",
        strokeThickness: 7,
      }).setOrigin(0.5).setDepth(30);

    this.session.stage += 1;
    delete this.session.gradeStage;
    delete this.session.gradeLevel;
    this.time.delayedCall(1200, () => {
      message.destroy();
      this.scene.restart({ session: this.session });
    });
  }

  handleWrongAnswer() {
    this.physics.resume();
    this.isQuizOpen = false;
    this.isTransitioning = true;
    this.session.score = this.stageStartScore;
    this.session.combo = 0;
    this.session.lives -= 1;
    this.updateHud();

    if (this.session.lives <= 0) {
      this.endGame();
      return;
    }

    const message = this.add.text(400, 170, "목숨 -1\n스테이지를 다시 시작합니다", {
      fontFamily: "Arial, sans-serif",
      fontSize: "25px",
      fontStyle: "bold",
      color: "#fecaca",
      align: "center",
      stroke: "#172033",
      strokeThickness: 7,
    }).setOrigin(0.5).setDepth(30);

    this.time.delayedCall(1100, () => {
      message.destroy();
      this.scene.restart({ session: this.session });
    });
  }

  updateHud() {
    this.stageText.setText(`STAGE ${this.session.stage}  |  GRADE ${this.stageConfig.gradeLevel}`);
    this.scoreText.setText(`SCORE ${Math.floor(this.session.score)}  COMBO x${this.session.combo}`);
    this.livesText.setText(`LIFE ${"❤️".repeat(Math.max(0, this.session.lives))}`);
    const progress = Phaser.Math.Clamp(
      this.distance / this.stageConfig.targetDistance,
      0,
      1,
    );
    this.progressBar.setScale(progress, 1);
  }

  endGame() {
    if (this.isTransitioning && this.session.lives > 0) return;
    this.isTransitioning = true;
    this.physics.pause();
    window.quizController.hide();
    this.scene.start("ScoreScene", {
      score: Math.floor(this.session.score),
      stage: this.session.stage,
    });
  }
}

window.GameScene = GameScene;
