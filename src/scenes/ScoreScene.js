class ScoreScene extends Phaser.Scene {
  constructor() {
    super("ScoreScene");
  }

  init(data) {
    this.result = {
      score: Math.max(0, Math.floor(Number(data.score) || 0)),
      stage: Math.max(1, Math.floor(Number(data.stage) || 1)),
    };
  }

  create() {
    this.cameras.main.setBackgroundColor("#101827");
    this.add.text(400, 78, "GAME OVER", {
      fontFamily: "Arial, sans-serif",
      fontSize: "48px",
      fontStyle: "bold",
      color: "#fca5a5",
    }).setOrigin(0.5);
    this.add.text(400, 145,
      `최종 점수  ${this.result.score}\n도달 스테이지  ${this.result.stage}`, {
        fontFamily: "Arial, sans-serif",
        fontSize: "26px",
        color: "#ffffff",
        align: "center",
        lineSpacing: 12,
      }).setOrigin(0.5);

    this.openScoreForm();
  }

  openScoreForm() {
    this.overlay = document.getElementById("score-overlay");
    this.form = document.getElementById("score-form");
    this.nameInput = document.getElementById("player-name");
    this.skipButton = document.getElementById("score-skip");
    document.getElementById("score-summary").textContent =
      `${this.result.score}점 · STAGE ${this.result.stage}`;

    this.submitHandler = event => {
      event.preventDefault();
      window.ScoreStorage.save({
        name: this.nameInput.value,
        score: this.result.score,
        stage: this.result.stage,
        date: new Date().toISOString().slice(0, 10),
      });
      this.closeAndReturn();
    };
    this.skipHandler = () => this.closeAndReturn();

    this.form.addEventListener("submit", this.submitHandler);
    this.skipButton.addEventListener("click", this.skipHandler);
    this.overlay.classList.add("is-visible");
    this.nameInput.value = "";
    this.nameInput.focus();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.detachForm());
  }

  detachForm() {
    this.form?.removeEventListener("submit", this.submitHandler);
    this.skipButton?.removeEventListener("click", this.skipHandler);
    this.overlay?.classList.remove("is-visible");
  }

  closeAndReturn() {
    this.detachForm();
    this.scene.start("MenuScene");
  }
}

window.ScoreScene = ScoreScene;
