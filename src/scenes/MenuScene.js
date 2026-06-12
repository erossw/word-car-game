class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    window.quizController.hide();
    document.getElementById("score-overlay").classList.remove("is-visible");
    this.cameras.main.setBackgroundColor("#172554");
    this.drawBackdrop();

    this.add.text(400, 72, "🚗 WORD CAR GAME", {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "42px",
      fontStyle: "bold",
      color: "#ffffff",
      stroke: "#172033",
      strokeThickness: 7,
    }).setOrigin(0.5);

    this.add.text(400, 120, "달리고, 피하고, 영어 단어를 맞혀요!", {
      fontFamily: "Arial, sans-serif",
      fontSize: "19px",
      color: "#e0f2fe",
    }).setOrigin(0.5);

    this.createButton(400, 180, "게임 시작", () => {
      window.wordManager.init();
      this.scene.start("GameScene", {
        session: { stage: 1, score: 0, lives: 3, combo: 0 },
      });
    });

    this.add.text(400, 236, "Space / ↑ 점프 · ← → / A D 앞뒤 이동", {
      fontFamily: "Arial, sans-serif",
      fontSize: "17px",
      color: "#fef3c7",
    }).setOrigin(0.5);

    this.renderScores();
  }

  drawBackdrop() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 0.8);
    for (let i = 0; i < 35; i++) {
      graphics.fillCircle(
        Phaser.Math.Between(0, 800),
        Phaser.Math.Between(0, 260),
        Phaser.Math.Between(1, 3),
      );
    }
    graphics.fillStyle(0x284c38).fillRect(0, 310, 800, 90);
    graphics.fillStyle(0x495364).fillRect(0, 330, 800, 70);
  }

  createButton(x, y, label, onClick) {
    const background = this.add.rectangle(x, y, 220, 52, 0xfacc15)
      .setStrokeStyle(3, 0xffffff)
      .setInteractive({ useHandCursor: true });
    const text = this.add.text(x, y, label, {
      fontFamily: "Arial, sans-serif",
      fontSize: "23px",
      fontStyle: "bold",
      color: "#172033",
    }).setOrigin(0.5);

    background.on("pointerover", () => background.setFillStyle(0xfde047));
    background.on("pointerout", () => background.setFillStyle(0xfacc15));
    background.on("pointerdown", onClick);
    return { background, text };
  }

  renderScores() {
    const scores = window.ScoreStorage.load();
    this.add.text(75, 270, "TOP 10", {
      fontFamily: "Arial, sans-serif",
      fontSize: "18px",
      fontStyle: "bold",
      color: "#facc15",
    });

    if (scores.length === 0) {
      this.add.text(75, 302, "아직 등록된 점수가 없습니다.", {
        fontFamily: "Arial, sans-serif",
        fontSize: "15px",
        color: "#ffffff",
      });
      return;
    }

    scores.slice(0, 10).forEach((entry, index) => {
      this.add.text(75 + (index >= 5 ? 370 : 0), 300 + (index % 5) * 20,
        `${index + 1}. ${entry.name.padEnd(10, " ")} ${entry.score}점  ST.${entry.stage}`, {
          fontFamily: "monospace",
          fontSize: "13px",
          color: "#ffffff",
        });
    });
  }
}

window.MenuScene = MenuScene;
