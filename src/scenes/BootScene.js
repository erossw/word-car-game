class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create() {
    const requiredGlobals = [
      "wordManager",
      "getStageConfig",
      "ScoreStorage",
      "quizController",
    ];
    const missing = requiredGlobals.filter(name => !window[name]);

    if (missing.length > 0) {
      this.add.text(400, 200, `초기화 오류: ${missing.join(", ")}`, {
        fontFamily: "Arial, sans-serif",
        fontSize: "22px",
        color: "#ffffff",
        align: "center",
      }).setOrigin(0.5);
      return;
    }

    this.scene.start("MenuScene");
  }
}

window.BootScene = BootScene;
